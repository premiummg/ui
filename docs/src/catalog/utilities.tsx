import { useState } from 'react';
import type { ComponentDoc } from '../components/doc/ComponentBlock';
import {
  importedHeaderSet,
  resolveImportRow,
  diffForImportUpdate,
  type ImportFieldSpec,
} from '../../../src/lib/bulkImport';
import {
  sanitizeRichText,
  sanitizePastedHtml,
  htmlToPlainText,
  looksLikeHtml,
  isHtmlEmpty,
  parseYouTubeId,
  youTubeEmbedUrl,
  youTubeWatchUrl,
  readPastedImage,
} from '../../../src/components/RichTextEditor';

// Plain functions, not components - there's nothing to render, so each demo
// below calls the real function against realistic sample input and prints
// its actual return value, the same "see precisely what produced this"
// standard the rest of the catalog holds visual demos to.
function Output({ value }: { value: unknown }) {
  return (
    <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

type EmployeeField = 'name' | 'hourlyRate' | 'ripplingId';

const EMPLOYEE_SPEC: ImportFieldSpec<EmployeeField>[] = [
  { key: 'name', headers: ['Name'] },
  { key: 'hourlyRate', headers: ['Hourly Rate', 'Rate'] },
  { key: 'ripplingId', headers: ['Rippling Employee ID', 'Rippling ID'] },
];

// A sibling app's own export shape (no "Hourly Rate"/"Rippling Employee ID"
// columns at all, only its own "Rate"/"Rippling ID") - resolveImportRow
// finds the value through the alias anyway.
const intranetHeaders = importedHeaderSet(['Name', 'Rate', 'Rippling ID']);
const intranetRow = resolveImportRow(
  { Name: 'Ada Lovelace', Rate: '40', 'Rippling ID': 'R-104' },
  intranetHeaders,
  EMPLOYEE_SPEC,
);

// Same spec, a file that only has a Name column - hourlyRate/ripplingId are
// left out of the result entirely, not set to '' - there's no column to
// have an opinion about them at all.
const partialHeaders = importedHeaderSet(['Name']);
const partialRow = resolveImportRow({ Name: 'Grace Hopper' }, partialHeaders, EMPLOYEE_SPEC);

const unchangedDiff = diffForImportUpdate(
  { name: 'Ada Lovelace', hourlyRate: '40' },
  { name: 'Ada Lovelace', hourlyRate: 40 },
);

const changedDiff = diffForImportUpdate(
  { name: 'Ada Lovelace', hourlyRate: '45' },
  { name: 'Ada Lovelace', hourlyRate: 40 },
);

// A column that IS present with a blank cell is a deliberate "clear this
// field", not "leave it alone" - the one behavior this whole utility exists
// to get right (see resolveImportRow's own omit-vs-'' distinction above).
const clearedDiff = diffForImportUpdate({ hourlyRate: '' }, { hourlyRate: 40 });

const DANGEROUS_HTML = `<p onclick="alert(1)">Hi<script>alert(2)</script><img src="x" onerror="alert(3)"><span style="position:fixed;url(evil)">text</span></p>`;
const sanitizedDisplay = sanitizeRichText(DANGEROUS_HTML);
const sanitizedPaste = sanitizePastedHtml(DANGEROUS_HTML);

const plainTextSource = '<p>First paragraph.</p><p>Second paragraph with a <b>bold</b> word.</p>';
const plainTextResult = htmlToPlainText(plainTextSource);

const looksLikeHtmlCases: [string, boolean][] = [
  ['<p>Hi</p>', looksLikeHtml('<p>Hi</p>')],
  ['Plain text\\nwith real newlines', looksLikeHtml('Plain text\nwith real newlines')],
];
const isHtmlEmptyCases: [string, boolean][] = [
  ['<p><br></p>', isHtmlEmpty('<p><br></p>')],
  ['<p>Hi</p>', isHtmlEmpty('<p>Hi</p>')],
  ['<img src="x">  (image-only, no text)', isHtmlEmpty('<img src="x">')],
];

const youtubeInputs = [
  'https://youtu.be/dQw4w9WgXcQ?si=abc123',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s',
  'dQw4w9WgXcQ',
  'not a youtube link',
];
const youtubeResults = youtubeInputs.map(input => {
  const id = parseYouTubeId(input);
  return { input, id, embedUrl: id ? youTubeEmbedUrl(id) : null, watchUrl: id ? youTubeWatchUrl(id) : null };
});

// Interactive, unlike every other demo on this page - readPastedImage needs
// a real File (a static call has nothing realistic to pass), so this picks
// one via a plain file input rather than requiring an actual clipboard
// paste event, which the function itself doesn't distinguish from anyway.
function ReadPastedImageDemo() {
  const [result, setResult] = useState<{ originalKB: number; outputKB: number; original: string; output: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const original = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const output = await readPastedImage(file);
      setResult({
        originalKB: Math.round((file.size / 1024) * 10) / 10,
        outputKB: Math.round((output.length * 0.75 / 1024) * 10) / 10, // base64 -> ~bytes
        original,
        output,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-xs">
      <input type="file" accept="image/*" onChange={onFile} disabled={busy}
        className="block text-xs text-gray-600 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-(--premium-red) file:text-white file:text-xs file:font-medium" />
      {busy && <p className="mt-2 text-gray-400">Compressing...</p>}
      {result && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-gray-400">Original - {result.originalKB} KB</p>
            <img src={result.original} className="max-w-full rounded border border-gray-200 dark:border-white/10" />
          </div>
          <div>
            <p className="mb-1 text-gray-400">readPastedImage output - ~{result.outputKB} KB</p>
            <img src={result.output} className="max-w-full rounded border border-gray-200 dark:border-white/10" />
          </div>
        </div>
      )}
    </div>
  );
}

export const utilities: ComponentDoc[] = [
  {
    name: 'resolveImportRow',
    summary: 'Reads one spreadsheet row against a list of recognized fields, each with its own ordered list of acceptable header names - so a sibling app\'s own export, with its own column names for the same data, still imports.',
    notes: 'importedHeaderSet(headerRow), also exported, turns the sheet\'s own header row into the Set this checks against - compute it once per file, not once per row. A field is only included in the result when one of its headers is actually present in the file: present-with-a-blank-cell resolves to \'\', while a header that never appears in the file at all is left out of the result completely. That distinction is load-bearing for diffForImportUpdate below - it\'s how a deliberately blanked cell can still clear a field on update, instead of being indistinguishable from "this column isn\'t in this file".',
    demos: [
      {
        label: 'A sibling app\'s own header names (Rate/Rippling ID instead of Hourly Rate/Rippling Employee ID)',
        node: <Output value={intranetRow} />,
        code: `const spec = [
  { key: 'name', headers: ['Name'] },
  { key: 'hourlyRate', headers: ['Hourly Rate', 'Rate'] },
  { key: 'ripplingId', headers: ['Rippling Employee ID', 'Rippling ID'] },
];
const headers = importedHeaderSet(['Name', 'Rate', 'Rippling ID']);
resolveImportRow(
  { Name: 'Ada Lovelace', Rate: '40', 'Rippling ID': 'R-104' },
  headers,
  spec,
);
// -> ${JSON.stringify(intranetRow)}`,
      },
      {
        label: 'A column missing from the file entirely is omitted, not blanked',
        node: <Output value={partialRow} />,
        code: `const headers = importedHeaderSet(['Name']);
resolveImportRow({ Name: 'Grace Hopper' }, headers, spec);
// -> ${JSON.stringify(partialRow)}
// 'hourlyRate' and 'ripplingId' aren't keys on the result at all`,
      },
    ],
  },
  {
    name: 'diffForImportUpdate',
    summary: 'Compares a resolved row against an existing record and returns only the keys whose value actually changed - so re-importing someone unchanged is a no-op write, and a deliberately blanked cell still clears that field rather than being silently ignored.',
    notes: 'Values are stringified and trimmed before comparing (a stored 40 and an imported "40" count as equal) - a field needing looser/tighter equality should be normalized by the caller first. Only keys present in `incoming` are ever considered, so a field resolveImportRow omitted (column not in the file) can never appear in the diff.',
    demos: [
      {
        label: 'Unchanged value - excluded from the diff',
        node: <Output value={unchangedDiff} />,
        code: `diffForImportUpdate(
  { name: 'Ada Lovelace', hourlyRate: '40' },
  { name: 'Ada Lovelace', hourlyRate: 40 },
);
// -> ${JSON.stringify(unchangedDiff)}`,
      },
      {
        label: 'Changed value - included',
        node: <Output value={changedDiff} />,
        code: `diffForImportUpdate(
  { name: 'Ada Lovelace', hourlyRate: '45' },
  { name: 'Ada Lovelace', hourlyRate: 40 },
);
// -> ${JSON.stringify(changedDiff)}`,
      },
      {
        label: 'A blank cell against an existing value clears it',
        node: <Output value={clearedDiff} />,
        code: `diffForImportUpdate({ hourlyRate: '' }, { hourlyRate: 40 });
// -> ${JSON.stringify(clearedDiff)}`,
      },
    ],
  },
  {
    name: 'sanitizeRichText',
    summary: 'DOMPurify with the fixed allow-list RichTextEditor bodies are always sanitized through before dangerouslySetInnerHTML - strips scripts, event handlers, javascript: URLs, and unsafe inline CSS (url(), position:fixed, @import) that DOMPurify leaves alone on its own.',
    notes: 'sanitizePastedHtml, also exported, is the stricter allow-list used the moment content is pasted INTO the editor rather than displayed - notably it excludes <img> entirely, since pasted images are handled separately as a real resizable node rather than trusted from arbitrary clipboard HTML. A consuming app\'s own backend should mirror the same allow-list on write - this is display-time sanitization, the second of two layers.',
    demos: [
      {
        label: 'Display sanitizer (sanitizeRichText) - script/handler/dangerous-CSS stripped, <img> kept',
        node: <Output value={sanitizedDisplay} />,
        code: `sanitizeRichText('${DANGEROUS_HTML}');
// -> ${JSON.stringify(sanitizedDisplay)}`,
      },
      {
        label: 'Paste sanitizer (sanitizePastedHtml) - same input, <img> also stripped',
        node: <Output value={sanitizedPaste} />,
        code: `sanitizePastedHtml('${DANGEROUS_HTML}');
// -> ${JSON.stringify(sanitizedPaste)}`,
      },
    ],
  },
  {
    name: 'htmlToPlainText',
    summary: 'A sanitized, line-broken plain-text rendering of an HTML body - what a list card\'s line-clamped preview reads from instead of the full rich body, so a pasted screenshot can\'t blow a small card up to full width.',
    notes: 'Block boundaries (<p>/<div>/<li>/<tr>/<h1-6>/<br>) become real newlines first - textContent alone would run two paragraphs together as one word, since those boundaries collapse to nothing in the DOM\'s own text content.',
    demos: [
      {
        label: 'Two paragraphs',
        node: <Output value={plainTextResult} />,
        code: `htmlToPlainText('${plainTextSource}');
// -> ${JSON.stringify(plainTextResult)}`,
      },
    ],
  },
  {
    name: 'looksLikeHtml',
    summary: 'Is this string actually HTML, or plain text with real newlines? Bodies written before a field became rich text are the latter - rendering those through dangerouslySetInnerHTML would collapse every line break, so callers use this to keep the old whitespace-pre-line rendering for them.',
    notes: 'isHtmlEmpty, also exported: is an HTML body empty of real content? An untouched editor can hold "<br>" or "<p></p>" (not literally the empty string), and a body that\'s nothing but a pasted screenshot is legitimately non-empty while having no text at all - the <img>/data-youtube check short-circuits before the tag-strip for that case. Deliberately regex-based rather than parse-and-inspect, since both run on every render (the editor\'s placeholder, a form\'s submit-button disabled state) and re-parsing a multi-megabyte pasted screenshot on every keystroke would visibly jank typing.',
    demos: [
      {
        label: 'looksLikeHtml',
        node: <Output value={Object.fromEntries(looksLikeHtmlCases)} />,
        code: looksLikeHtmlCases.map(([input, result]) => `looksLikeHtml(${JSON.stringify(input)}); // -> ${result}`).join('\n'),
      },
      {
        label: 'isHtmlEmpty',
        node: <Output value={Object.fromEntries(isHtmlEmptyCases)} />,
        code: isHtmlEmptyCases.map(([input, result]) => `isHtmlEmpty(${JSON.stringify(input)}); // -> ${result}`).join('\n'),
      },
    ],
  },
  {
    name: 'parseYouTubeId',
    summary: 'Pulls the 11-character video id out of anything a user is realistically going to paste - a full watch URL, a youtu.be short link, an /embed//shorts//live/ URL, any of those carrying extra query params, or a bare id - returning null for anything that isn\'t recognizably YouTube.',
    notes: 'youTubeEmbedUrl/youTubeWatchUrl, also exported, build the two URLs the rest of the package needs from a validated id: the embed src (always youtube-nocookie.com, YouTube\'s privacy-preserving domain - it doesn\'t set tracking cookies until the viewer actually presses play) and the ordinary youtube.com watch link. The id is never trusted merely for matching YOUTUBE_ID_RE from user input - what actually reaches an <iframe> is always re-validated against it first (see renderRichTextHtml), so a crafted request straight against an API can\'t smuggle in an arbitrary embedded page.',
    demos: [
      {
        label: 'Every shape a paste can take',
        node: <Output value={youtubeResults} />,
        code: youtubeInputs.map(input => `parseYouTubeId(${JSON.stringify(input)});`).join('\n') + `\n// -> ${JSON.stringify(youtubeResults, null, 2)}`,
      },
    ],
  },
  {
    name: 'readPastedImage',
    summary: 'Downscales (capped at 1600px on its longest side) and re-encodes a pasted/dropped image as JPEG before it ever becomes part of a stored document - a raw clipboard screenshot commonly carries full monitor resolution and lossless PNG encoding, and left uncompressed can balloon one record\'s stored HTML, and therefore the whole list endpoint\'s payload, by megabytes.',
    notes: 'Not RichTextEditor-specific - takes a plain File and returns a data URL, so it\'s useful for any upload flow wanting client-side image compression before the bytes ever leave the browser. Every paste is compressed, no small-file exemption: two "small" (~150-250KB) uncompressed images pasted into the same body were still enough, combined, to reproduce the same slow-decode hang a single large one caused. Falls back to the original file\'s own data URL if decoding fails (an exotic format, corrupt clipboard data) rather than losing the paste entirely.',
    demos: [
      {
        label: 'Pick an image - compare original vs. output size',
        node: <ReadPastedImageDemo />,
      },
    ],
  },
];
