import { describe, expect, test } from 'vitest';
import { importedHeaderSet, resolveImportRow, diffForImportUpdate, ImportFieldSpec } from './bulkImport';

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
