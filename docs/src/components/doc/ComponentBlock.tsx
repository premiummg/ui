import { useState, type ReactNode } from 'react';
import { PANEL, Spec } from './Section';
import { PropsTable } from './PropsTable';
import { CodeBlock } from './CodeBlock';

export interface ComponentDoc {
  name: string;
  summary: ReactNode;
  notes?: ReactNode;
  demos: { label: string; node: ReactNode; code?: string }[];
  propsKey?: string; // when the generated props.json key differs from `name`
  // Full-bleed layout pieces (Navbar, AuthShell, Hero, PageHeader, ...) read
  // as badly cramped squeezed into half of a 2-column grid row - span the
  // whole row for those instead.
  wide?: boolean;
}

// code, when given, is the real *.stories.tsx source for this exact demo
// (extracted at build time - see scripts/generate-props.mjs) - a viewer can
// see precisely what produced what they're looking at, not a paraphrase of
// it that can quietly drift from the real thing.
function Demo({ label, node, code }: { label: string; node: ReactNode; code?: string }) {
  const [showCode, setShowCode] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="pmg-eyebrow text-gray-400 dark:text-gray-500">{label}</span>
        {code && (
          <button
            onClick={() => setShowCode(s => !s)}
            className="text-[11px] font-mono text-gray-400 dark:text-gray-500 hover:text-(--premium-red) transition"
          >
            {showCode ? 'Hide code' : '</> Code'}
          </button>
        )}
      </div>
      {/* Plain block, not flex: a flex item is sized shrink-to-fit, and a
          component with no in-flow content of its own (an absolutely-
          positioned img + caption, e.g. PortraitFigure's aspect-ratio box)
          has nothing to shrink-to-fit against - it collapses to zero width,
          and zero height behind it. Storybook's own canvas is a plain block
          for the same reason this needs to be one too. */}
      <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-[#F9F9F9] dark:bg-black/20 p-4">
        {node}
      </div>
      {showCode && code && <CodeBlock code={code} />}
    </div>
  );
}

export function ComponentBlock({ name, summary, notes, demos, propsKey, wide }: ComponentDoc) {
  return (
    <div id={name} className={`${PANEL} p-6 scroll-mt-24 ${wide ? 'md:col-span-2' : ''}`}>
      <h3 className="font-heading font-bold text-base text-gray-900 dark:text-gray-100 mb-1.5">{name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-1">{summary}</p>
      {notes && <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{notes}</p>}
      {!notes && <div className="mb-4" />}

      <div className="flex flex-col gap-3 mb-5">
        {demos.map(d => <Demo key={d.label} {...d} />)}
      </div>

      <PropsTable component={propsKey ?? name} />
      <Spec>{`import { ${name} } from '@premiummg/ui'`}</Spec>
    </div>
  );
}
