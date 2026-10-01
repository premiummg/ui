// Shared mechanics for a spreadsheet bulk-import flow, used identically by
// every Premium app's own "Import" button so the two don't grow independent,
// slightly-different copies of the same two rules:
//
// 1. A recognized field can come from more than one possible column header -
//    a sibling app's own export naturally uses its own header names (e.g.
//    "Rate" vs "Hourly Rate"), and the importer shouldn't fail a whole file
//    over that.
// 2. When a row matches someone who already exists, only the fields that
//    actually CHANGED should be written back - re-importing someone
//    unchanged shouldn't fire a write, but a cell someone deliberately left
//    blank should still clear that field rather than being silently ignored,
//    which only works if "blank cell" and "this column isn't in this file at
//    all" are kept distinct the whole way through.

export interface ImportFieldSpec<K extends string = string> {
  key: K;
  // Header names to look for, in priority order - the first one present in
  // the file's own header row wins.
  headers: string[];
}

// The sheet's own header row (e.g. from `XLSX.utils.sheet_to_json(sheet,
// {header: 1})[0]`), turned into the set resolveImportRow checks against -
// read once per sheet, not once per row.
export function importedHeaderSet(headerRow: unknown[]): Set<string> {
  return new Set(headerRow.map(h => String(h ?? '').trim()));
}

// Resolves one already-parsed row (however the caller's own
// `sheet_to_json(sheet)` call produced it, keyed by header text) against a
// field spec list. A field is included - even as an empty string - only when
// one of its acceptable headers is actually present in the file; a field
// whose header never appears in the file at all is left out of the result
// entirely. That omission is the signal callers rely on to leave an existing
// record's value alone, vs. an included empty string, which means "clear
// this field".
export function resolveImportRow<K extends string>(
  row: Record<string, unknown>,
  headers: Set<string>,
  spec: ImportFieldSpec<K>[],
): Partial<Record<K, string>> {
  const result: Partial<Record<K, string>> = {};
  for (const field of spec) {
    const matchedHeader = field.headers.find(h => headers.has(h));
    if (matchedHeader === undefined) continue;
    result[field.key] = String(row[matchedHeader] ?? '').trim();
  }
  return result;
}

// Given a row already resolved by resolveImportRow (or already resolved
// further by the caller, e.g. a division NAME turned into a division_id)
// and the matching existing record, returns only the keys whose value
// actually differs. Values are stringified and trimmed before comparing, so
// e.g. a stored `40` and an imported `"40"` count as equal - callers that
// need looser/tighter equality for a particular field should normalize it
// themselves before calling this.
export function diffForImportUpdate<K extends string>(
  incoming: Partial<Record<K, unknown>>,
  current: Partial<Record<K, unknown>>,
): Partial<Record<K, unknown>> {
  const diff: Partial<Record<K, unknown>> = {};
  for (const key of Object.keys(incoming) as K[]) {
    const next = incoming[key];
    const nextStr = String(next ?? '').trim();
    const currStr = String(current[key] ?? '').trim();
    if (nextStr !== currStr) diff[key] = next;
  }
  return diff;
}

// A third rule, independent of the two above, that every app's own bulk
// import kept re-deriving by hand: a row can reference ANOTHER row in the
// same file that hasn't been created yet (e.g. an employee's Manager column
// naming someone further down the same sheet). Row order in the file is not
// meaningful, so this can't be solved with a single top-to-bottom pass - it
// needs retries, but only bounded ones, since a name that matches nothing in
// the file (or a true circular reference) must still fail instead of
// spinning forever.
//
// This only drives the retry loop - it knows nothing about what a "row" or
// an "outcome" actually is. `processRow` is the caller's own per-entity
// logic (parse/resolve, maybe call create()/update(), whatever this entity's
// import actually does for one row) and decides for itself, each call,
// whether this row's dependencies are satisfied yet; when they're not, it
// returns `{ retry: true }` instead of a final outcome. A resolved
// dependency becoming available to a later call is the caller's own
// responsibility too (typically: a closed-over Map from name -> id that a
// successful create() populates) - this function only repeats calling
// `processRow` on whatever is still pending, in file order, until a full
// pass produces no newly-resolved row, then reports `onStuck` for whatever's
// left and stops.
export interface MultiPassOutcome<TOutcome> {
  retry?: boolean;
  outcome?: TOutcome;
}

export async function runMultiPassImport<TRow, TOutcome>(
  rows: TRow[],
  processRow: (row: TRow) => Promise<MultiPassOutcome<TOutcome>>,
  onStuck: (row: TRow) => TOutcome,
): Promise<TOutcome[]> {
  const outcomesByIndex = new Map<number, TOutcome>();
  let pending = rows.map((row, index) => ({ row, index }));

  while (pending.length > 0) {
    const stillPending: typeof pending = [];
    let progressed = false;

    for (const item of pending) {
      const result = await processRow(item.row);
      if (result.retry) {
        stillPending.push(item);
      } else {
        progressed = true;
        outcomesByIndex.set(item.index, result.outcome as TOutcome);
      }
    }

    if (!progressed) {
      for (const item of stillPending) {
        outcomesByIndex.set(item.index, onStuck(item.row));
      }
      break;
    }
    pending = stillPending;
  }

  return rows.map((_, index) => outcomesByIndex.get(index) as TOutcome);
}
