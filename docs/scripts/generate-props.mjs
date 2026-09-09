// Walks every src/components/<Name>/<Name>.tsx (the component's own source
// file, never its .stories/.test sibling) and extracts its props via
// react-docgen-typescript, so the docs app's props tables are read straight
// from the real TypeScript types instead of hand-maintained a second time.
import { parse } from 'react-docgen-typescript';
import { readdirSync, statSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const here = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.dirname(here);
const componentsDir = path.join(docsRoot, '..', 'src', 'components');
const outDir = path.join(docsRoot, 'src', 'generated');

// Only props declared in the component's own file - filters out the huge
// inherited native-attribute list (onClick, aria-*, ...) that comes along
// free with `extends ButtonHTMLAttributes<...>` etc. That inherited surface
// is real and usable, but listing all of it would bury the handful of props
// each component actually adds - the same reasoning Storybook/react-
// styleguidist docgen configs use this exact filter for.
const options = {
  propFilter: (prop) => {
    if (prop.parent) return !prop.parent.fileName.includes('node_modules');
    return true;
  },
  shouldRemoveUndefinedFromOptional: true,
};

// A module namespace object (`import * as mod from './X.stories'`) lists
// its string-keyed exports in ALPHABETICAL order per the ECMAScript spec,
// not the order they're declared in the file - confirmed live in-browser
// (ColorField's `Blue`/`Red` come back as ['Blue', 'Red', 'default']),
// so demosFromModule can't rely on Object.keys/entries for display order.
// This regex-scans each stories file for its `export const Name: Story`
// declarations in the order they actually appear in the source, so the
// docs app can re-sort back to that order at render time.
const EXPORT_RE = /^export const (\w+)\s*:\s*Story/gm;

// A "view code" toggle should show a visitor what they'd actually WRITE to
// get this demo - real JSX usage - not the CSF `export const X: Story = {
// args: {...} }` wrapper Storybook itself needs. Real parsing (the
// TypeScript compiler API, not regex) so multi-line values, nested objects,
// and string-vs-expression props are all handled correctly:
//   - a story with `render: (args) => (<Foo .../>)`: show just what render
//     returns (unwrapped from its own arrow-function parens), with any
//     `{...args}` spread expanded back into real attributes - it's already
//     hand-written JSX otherwise, nothing else to reconstruct.
//   - an args-only story (no `render`): synthesize `<Component prop=.../>`
//     from meta.args merged with the story's own args, since there's no
//     JSX in the source to show at all otherwise.
function findProp(objectLiteral, propName) {
  return objectLiteral.properties.find(
    p => ts.isPropertyAssignment(p) && p.name.getText() === propName,
  );
}

// Reads a plain object literal's own properties into name -> raw source
// text of the value (e.g. `variant` -> `'primary'`, `onClick` -> `() => {}`).
// A spread entry (`...ConfirmDelete.args`) is resolved through
// storiesByName when it references another story in the same file (Modal's
// WideMaxWidth does this) - unresolvable spreads are skipped rather than
// failing the whole extraction.
function readObjectLiteral(objectLiteral, storiesByName) {
  const map = new Map();
  if (!objectLiteral) return map;
  for (const prop of objectLiteral.properties) {
    if (ts.isSpreadAssignment(prop)) {
      const expr = prop.expression;
      if (ts.isPropertyAccessExpression(expr) && expr.name.getText() === 'args' && ts.isIdentifier(expr.expression)) {
        const other = storiesByName?.get(expr.expression.text);
        const otherArgsProp = other && findProp(other, 'args');
        if (otherArgsProp && ts.isObjectLiteralExpression(otherArgsProp.initializer)) {
          for (const [k, v] of readObjectLiteral(otherArgsProp.initializer, storiesByName)) map.set(k, v);
        }
      }
    } else if (ts.isPropertyAssignment(prop)) {
      map.set(prop.name.getText(), prop.initializer.getText());
    } else if (ts.isShorthandPropertyAssignment(prop)) {
      map.set(prop.name.getText(), prop.name.getText());
    }
  }
  return map;
}

function isQuoted(s) {
  return /^(['"]).*\1$/.test(s);
}

// name="value" for a string literal, name (shorthand) for `true`, name={expr}
// for everything else - `children` is handled by the caller instead, since
// it renders as JSX children text, not an attribute.
function attrsFromArgs(argsMap) {
  return [...argsMap.entries()]
    .filter(([key]) => key !== 'children')
    .map(([key, value]) => {
      if (value === 'true') return key;
      if (isQuoted(value)) return `${key}="${value.slice(1, -1)}"`;
      return `${key}={${value}}`;
    })
    .join(' ');
}

function jsxFromArgs(componentName, argsMap) {
  const children = argsMap.get('children');
  const attrText = attrsFromArgs(argsMap);
  const attrs = attrText ? ' ' + attrText : '';
  if (children === undefined) return `<${componentName}${attrs} />`;
  const childText = isQuoted(children) ? children.slice(1, -1) : `{${children}}`;
  return `<${componentName}${attrs}>${childText}</${componentName}>`;
}

// The render function's own body - unwrapped from `render: (args) => ( ... )`
// down to just the `(...)`'s contents, or the block `{ ... }`'s own
// statements when a story defines a whole helper component inline
// (Toaster's own Default story does this).
function renderBodyText(fn) {
  const body = fn.body;
  if (ts.isParenthesizedExpression(body)) return body.expression.getText().trim();
  if (ts.isBlock(body)) return body.getText().slice(1, -1).trim(); // strip the block's own { }
  return body.getText().trim();
}

// A render function written as `render: (args) => (<Foo {...args}>...)`
// spreads its own merged args back onto the JSX at runtime - shown as
// literal `{...args}` text, that isn't real code a reader could paste
// anywhere else. Expanding it back into the real attributes it resolves to
// at runtime turns it into exactly that. Only the `{...args}` token itself
// (plus its own single leading space) is touched - every occurrence in this
// codebase sits inline right after the tag name, never alone on its own
// indented line, so this can't eat real indentation elsewhere in the block.
function expandArgsSpread(text, argsMap) {
  const attrs = attrsFromArgs(argsMap);
  return text.replace(/ ?\{\.\.\.args\}/g, attrs ? ` ${attrs}` : '');
}

// Strips whatever common leading indentation the snippet still carries from
// its original position inside the file (nested inside `render: () => ( ... )`
// at some depth) - without this every multi-line snippet renders visibly
// mis-indented, shifted right by however deep it happened to sit in the
// source file rather than starting at column 0 like real standalone code.
function dedent(text) {
  const lines = text.split('\n');
  if (lines.length <= 1) return text;
  const indents = lines.slice(1).filter(l => l.trim() !== '').map(l => l.match(/^ */)[0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return [lines[0], ...lines.slice(1).map(l => (l.trim() === '' ? '' : l.slice(min)))].join('\n');
}

function extractStorySources(source, fileName) {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let metaComponentName;
  let metaArgs;
  const storyNodes = []; // { name, objectLiteral }
  const storiesByName = new Map(); // name -> objectLiteral, for cross-story references

  ts.forEachChild(sf, (node) => {
    if (!ts.isVariableStatement(node)) return;
    const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || !decl.initializer || !ts.isObjectLiteralExpression(decl.initializer)) continue;
      if (decl.name.text === 'meta') {
        const componentProp = findProp(decl.initializer, 'component');
        if (componentProp && ts.isIdentifier(componentProp.initializer)) metaComponentName = componentProp.initializer.text;
        const argsProp = findProp(decl.initializer, 'args');
        if (argsProp && ts.isObjectLiteralExpression(argsProp.initializer)) metaArgs = argsProp.initializer;
      } else if (isExported) {
        storyNodes.push({ name: decl.name.text, objectLiteral: decl.initializer });
        storiesByName.set(decl.name.text, decl.initializer);
      }
    }
  });

  // One property-access hop (`render: ConfirmDelete.render`) reusing another
  // story's render function - the only pattern actually used here (Modal's
  // WideMaxWidth); deeper chains aren't worth resolving speculatively.
  function resolveRenderFn(renderProp) {
    if (!renderProp) return undefined;
    const init = renderProp.initializer;
    if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) return init;
    if (ts.isPropertyAccessExpression(init) && init.name.getText() === 'render' && ts.isIdentifier(init.expression)) {
      const other = storiesByName.get(init.expression.text);
      const otherRenderProp = other && findProp(other, 'render');
      const otherInit = otherRenderProp?.initializer;
      if (otherInit && (ts.isArrowFunction(otherInit) || ts.isFunctionExpression(otherInit))) return otherInit;
    }
    return undefined;
  }

  const out = {};
  for (const { name, objectLiteral } of storyNodes) {
    const argsProp = findProp(objectLiteral, 'args');
    const storyArgs = argsProp && ts.isObjectLiteralExpression(argsProp.initializer) ? argsProp.initializer : undefined;
    const merged = readObjectLiteral(metaArgs, storiesByName);
    for (const [k, v] of readObjectLiteral(storyArgs, storiesByName)) merged.set(k, v);

    const renderFn = resolveRenderFn(findProp(objectLiteral, 'render'));
    if (renderFn) {
      out[name] = dedent(expandArgsSpread(renderBodyText(renderFn), merged));
      continue;
    }
    if (!metaComponentName) continue; // nothing to synthesize against
    out[name] = jsxFromArgs(metaComponentName, merged);
  }
  return out;
}

const result = {};
const storyOrder = {};
const storySource = {};

for (const name of readdirSync(componentsDir)) {
  const dir = path.join(componentsDir, name);
  if (!statSync(dir).isDirectory()) continue;
  const file = path.join(dir, `${name}.tsx`);
  try {
    statSync(file);
  } catch {
    continue; // e.g. an index-only folder
  }

  const docs = parse(file, options);
  for (const doc of docs) {
    const props = Object.entries(doc.props ?? {}).map(([propName, p]) => ({
      name: propName,
      type: p.type?.name ?? 'unknown',
      required: p.required,
      defaultValue: p.defaultValue?.value ?? null,
      description: p.description || null,
    }));
    if (props.length === 0 && doc.displayName !== name) continue;
    result[doc.displayName] = props;
  }

  const storiesFile = path.join(dir, `${name}.stories.tsx`);
  try {
    const source = readFileSync(storiesFile, 'utf8').replace(/\r\n/g, '\n');
    storyOrder[name] = [...source.matchAll(EXPORT_RE)].map(m => m[1]);
    storySource[name] = extractStorySources(source, storiesFile);
  } catch {
    // no stories file for this component
  }
}

mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'props.json'), JSON.stringify(result, null, 2));
writeFileSync(path.join(outDir, 'storyOrder.json'), JSON.stringify(storyOrder, null, 2));
writeFileSync(path.join(outDir, 'storySource.json'), JSON.stringify(storySource, null, 2));
console.log(`Generated props for ${Object.keys(result).length} components -> src/generated/props.json`);
console.log(`Generated story order for ${Object.keys(storyOrder).length} components -> src/generated/storyOrder.json`);
console.log(`Generated story source for ${Object.keys(storySource).length} components -> src/generated/storySource.json`);
