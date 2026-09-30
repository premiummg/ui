import type { ComponentDoc } from '../components/doc/ComponentBlock';
import {
  importedHeaderSet,
  resolveImportRow,
  diffForImportUpdate,
  type ImportFieldSpec,
} from '../../../src/lib/bulkImport';

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
];
