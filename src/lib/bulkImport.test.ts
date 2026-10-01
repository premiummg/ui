import { describe, expect, test } from 'vitest';
import { importedHeaderSet, resolveImportRow, diffForImportUpdate, runMultiPassImport, ImportFieldSpec } from './bulkImport';

type Field = 'name' | 'rate' | 'ripplingId';

const SPEC: ImportFieldSpec<Field>[] = [
  { key: 'name', headers: ['Name'] },
  { key: 'rate', headers: ['Hourly Rate', 'Rate'] },
  { key: 'ripplingId', headers: ['Rippling Employee ID', 'Rippling ID'] },
];

describe('resolveImportRow', () => {
  test('reads a field from its first matching header', () => {
    const headers = importedHeaderSet(['Name', 'Hourly Rate']);
    const row = resolveImportRow({ Name: 'Ada Lovelace', 'Hourly Rate': 40 }, headers, SPEC);
    expect(row).toEqual({ name: 'Ada Lovelace', rate: '40' });
  });

  test('falls back to a later alias when the primary header is absent', () => {
    // Intranet's own export shape: no "Hourly Rate"/"Rippling Employee ID"
    // columns at all, only "Rate"/"Rippling ID".
    const headers = importedHeaderSet(['Name', 'Rate', 'Rippling ID']);
    const row = resolveImportRow({ Name: 'Ada Lovelace', Rate: '40', 'Rippling ID': 'R-1' }, headers, SPEC);
    expect(row).toEqual({ name: 'Ada Lovelace', rate: '40', ripplingId: 'R-1' });
  });

  test('omits a field entirely when none of its headers are in the file', () => {
    const headers = importedHeaderSet(['Name']);
    const row = resolveImportRow({ Name: 'Ada Lovelace' }, headers, SPEC);
    expect(row).toEqual({ name: 'Ada Lovelace' });
    expect('rate' in row).toBe(false);
  });

  test('includes an empty string, not omission, for a blank cell under a present header', () => {
    const headers = importedHeaderSet(['Name', 'Hourly Rate']);
    const row = resolveImportRow({ Name: 'Ada Lovelace', 'Hourly Rate': '' }, headers, SPEC);
    expect(row).toEqual({ name: 'Ada Lovelace', rate: '' });
  });
});

describe('diffForImportUpdate', () => {
  test('excludes fields whose value is unchanged', () => {
    const diff = diffForImportUpdate({ name: 'Ada Lovelace', rate: '40' }, { name: 'Ada Lovelace', rate: 40 });
    expect(diff).toEqual({});
  });

  test('includes only the fields that actually changed', () => {
    const diff = diffForImportUpdate({ name: 'Ada Lovelace', rate: '45' }, { name: 'Ada Lovelace', rate: 40 });
    expect(diff).toEqual({ rate: '45' });
  });

  test('a deliberately blanked cell clears a field that had a value', () => {
    const diff = diffForImportUpdate({ rate: '' }, { rate: 40 });
    expect(diff).toEqual({ rate: '' });
  });

  test('a blank cell against an already-empty field is not a diff', () => {
    const diff = diffForImportUpdate({ rate: '' }, { rate: null });
    expect(diff).toEqual({});
  });

  test('a field never present in incoming (column absent from the file) never appears in the diff', () => {
    const diff = diffForImportUpdate({ name: 'Ada Lovelace' }, { name: 'Someone Else', rate: 999 });
    expect(diff).toEqual({ name: 'Ada Lovelace' });
    expect('rate' in diff).toBe(false);
  });
});

describe('runMultiPassImport', () => {
  type Row = { name: string; managerName?: string };
  type Outcome = { name: string; status: 'ok' | 'error'; message?: string; id?: string };

  // Mirrors the real shape every app's own employee import already used: a
  // row naming a Manager can't resolve until that manager's own row has run,
  // which may be anywhere else in the file - the closed-over `createdIds`
  // map is exactly what a real processRow would populate from a successful
  // create() call.
  function makeProcessor(createdIds: Map<string, string>, allNames: Set<string>) {
    let nextId = 1;
    return async (row: Row): Promise<{ retry?: boolean; outcome?: Outcome }> => {
      if (row.managerName) {
        const managerId = createdIds.get(row.managerName.toLowerCase());
        if (!managerId) {
          if (allNames.has(row.managerName.toLowerCase())) return { retry: true };
          return { outcome: { name: row.name, status: 'error', message: `Manager "${row.managerName}" not found` } };
        }
      }
      const id = `id-${nextId++}`;
      createdIds.set(row.name.toLowerCase(), id);
      return { outcome: { name: row.name, status: 'ok', id } };
    };
  }
  const onStuck = (row: Row): Outcome => ({ name: row.name, status: 'error', message: 'stuck' });

  test('resolves a row whose manager appears later in the same file', async () => {
    const rows: Row[] = [{ name: 'Report', managerName: 'Boss' }, { name: 'Boss' }];
    const createdIds = new Map<string, string>();
    const allNames = new Set(rows.map((r) => r.name.toLowerCase()));
    const results = await runMultiPassImport(rows, makeProcessor(createdIds, allNames), onStuck);
    expect(results[0].status).toBe('ok');
    expect(results[1].status).toBe('ok');
  });

  test('fails a row whose referenced manager is not in the file at all', async () => {
    const rows: Row[] = [{ name: 'Report', managerName: 'Ghost' }];
    const createdIds = new Map<string, string>();
    const allNames = new Set(rows.map((r) => r.name.toLowerCase()));
    const results = await runMultiPassImport(rows, makeProcessor(createdIds, allNames), onStuck);
    expect(results[0]).toEqual({ name: 'Report', status: 'error', message: 'Manager "Ghost" not found' });
  });

  test('reports onStuck for a genuinely circular reference instead of looping forever', async () => {
    const rows: Row[] = [{ name: 'A', managerName: 'B' }, { name: 'B', managerName: 'A' }];
    const createdIds = new Map<string, string>();
    const allNames = new Set(rows.map((r) => r.name.toLowerCase()));
    const results = await runMultiPassImport(rows, makeProcessor(createdIds, allNames), onStuck);
    expect(results.every((r) => r.status === 'error' && r.message === 'stuck')).toBe(true);
  });

  test('preserves original row order in the results regardless of resolution order', async () => {
    const rows: Row[] = [
      { name: 'C', managerName: 'A' },
      { name: 'A' },
      { name: 'B', managerName: 'A' },
    ];
    const createdIds = new Map<string, string>();
    const allNames = new Set(rows.map((r) => r.name.toLowerCase()));
    const results = await runMultiPassImport(rows, makeProcessor(createdIds, allNames), onStuck);
    expect(results.map((r) => r.name)).toEqual(['C', 'A', 'B']);
    expect(results.every((r) => r.status === 'ok')).toBe(true);
  });
});
