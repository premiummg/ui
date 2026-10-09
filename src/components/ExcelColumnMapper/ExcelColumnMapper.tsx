import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { SearchPicker } from '../SearchPicker';

export interface ExcelColumnMapperField {
  key: string;
  label: string;
}

export interface ExcelColumnMapperProps {
  // The app picks the file (its own input, dropzone, menu item - same as
  // FileDropzone leaves triggering to the caller) and hands it over here.
  // Reading starts the moment this becomes non-null; the modal closes
  // itself when it goes back to null.
  file: File | null;
  fields: ExcelColumnMapperField[];
  // The app's own guess, usually built from domain synonyms this component
  // can't know about ("amount"/"montant" -> "budget"). Tried first, per
  // header. Whatever it leaves unmapped falls through to this component's
  // own guess (an exact or partial match against a field's label) before
  // landing on "ignore".
  guessField?: (header: string) => string | undefined;
  // Keys from `fields` that must be mapped to SOME column before Confirm
  // is enabled. The simple case ("name is always required"). For anything
  // compound (this field OR an external fallback picked elsewhere),
  // combine with `confirmDisabled` instead - see onMappingChange.
  requiredFields?: string[];
  // A mapping decision the caller can't make without knowing when
  // confirmDisabled already covers everything required - this is only the
  // top-off for extra, non-column conditions (an external fallback field,
  // etc). true here disables Confirm on top of requiredFields' own check,
  // never overrides it the other way.
  confirmDisabled?: boolean;
  // Fired on every column's mapping change, including the initial guess -
  // the only way the caller observes the live mapping to compute its own
  // extra condition for confirmDisabled above.
  onMappingChange?: (mapping: Record<string, string>) => void;
  // rows: each row as the sheet's own header-keyed object (XLSX.utils.
  // sheet_to_json's own shape) - unopinionated on purpose, since what a
  // cell value becomes (a number, a date, a looked-up id) is entirely the
  // caller's domain logic.
  onConfirm: (rows: Record<string, unknown>[], mapping: Record<string, string>) => void;
  onCancel: () => void;

  title?: string;
  description?: string;
  ignoreLabel?: string;
  columnHeaderLabel?: string;
  fieldHeaderLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  invalidFileMessage?: string;
  emptyFileMessage?: string;
}

// Case-insensitive exact-or-partial match against a field's own label - the
// only guessing this component does on its own. No synonyms, no other
// languages: that needs knowing the domain, which is exactly what
// `guessField` is for. This is just the fallback for whatever it leaves
// unmapped.
function basicGuess(header: string, fields: ExcelColumnMapperField[]): string | undefined {
  const h = header.trim().toLowerCase();
  if (!h) return undefined;
  const exact = fields.find(f => f.label.trim().toLowerCase() === h);
  if (exact) return exact.key;
  const partial = fields.find(f => {
    const label = f.label.trim().toLowerCase();
    return label.length > 2 && (h.includes(label) || label.includes(h));
  });
  return partial?.key;
}

// Reads an Excel file, guesses each column's field from its header, and
// lets the user correct that mapping before handing back the parsed rows
// alongside the final mapping. Knows nothing about what the rows are FOR -
// see `fields`/`guessField`/`onConfirm` for where the domain comes in.
export function ExcelColumnMapper({
  file, fields, guessField, requiredFields = [], confirmDisabled = false,
  onMappingChange, onConfirm, onCancel,
  title = 'Map the columns',
  description = "Check that each column goes to the right field. Unmapped columns are ignored.",
  ignoreLabel = 'Ignore',
  columnHeaderLabel = 'Column',
  fieldHeaderLabel = 'Field',
  confirmLabel = 'Import',
  cancelLabel = 'Cancel',
  invalidFileMessage = 'Could not read this file. Make sure it is a valid .xlsx file.',
  emptyFileMessage = 'This file has no rows.',
}: ExcelColumnMapperProps) {
  const [headers, setHeaders] = useState<string[] | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) {
      setHeaders(null);
      setRows([]);
      setMapping({});
      setError('');
      return;
    }
    let cancelled = false;
    file.arrayBuffer()
      .then(data => {
        if (cancelled) return;
        const wb = XLSX.read(data);
        const parsedRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]]);
        if (!parsedRows.length) { setError(emptyFileMessage); return; }
        const fileHeaders = Object.keys(parsedRows[0]);
        // Two columns never start out mapped to the same field - whichever
        // header matches first (file order) keeps the guess, the rest fall
        // back to unmapped rather than silently doubling up on one field.
        const guessed: Record<string, string> = {};
        const guessedKeys = new Set<string>();
        for (const h of fileHeaders) {
          const guess = guessField?.(h) || basicGuess(h, fields) || '';
          if (guess && !guessedKeys.has(guess)) {
            guessed[h] = guess;
            guessedKeys.add(guess);
          } else {
            guessed[h] = '';
          }
        }
        setHeaders(fileHeaders);
        setRows(parsedRows);
        setMapping(guessed);
        onMappingChange?.(guessed);
      })
      .catch(() => { if (!cancelled) setError(invalidFileMessage); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const satisfiesRequired = useMemo(
    () => requiredFields.every(key => Object.values(mapping).includes(key)),
    [mapping, requiredFields],
  );

  function setHeaderField(header: string, key: string) {
    setMapping(prev => {
      const next = { ...prev, [header]: key };
      onMappingChange?.(next);
      return next;
    });
  }

  if (!file || (!headers && !error)) return null;

  return (
    <Modal onClose={onCancel} maxWidth="max-w-lg" title={title}>
      {error ? (
        <>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button variant="secondary" size="md" className="w-full justify-center" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span className="flex-1">{columnHeaderLabel}</span>
              <span className="w-48">{fieldHeaderLabel}</span>
            </div>
            {headers!.map(h => {
              const current = mapping[h]
                ? { id: mapping[h], label: fields.find(f => f.key === mapping[h])?.label ?? mapping[h] }
                : null;
              // A field already claimed by another column drops out of
              // every other picker's list - the same field can't go to two
              // columns at once, so once it's taken there's nothing useful
              // left to pick it into here. This column's own current pick
              // stays listed (it's not "another" column).
              const takenElsewhere = new Set(
                Object.entries(mapping).filter(([header, key]) => header !== h && key).map(([, key]) => key),
              );
              const availableFields = fields.filter(f => !takenElsewhere.has(f.key));
              return (
                <div key={h} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-gray-800 dark:text-gray-100 truncate" title={h}>{h}</span>
                  <div className="w-48 shrink-0" title={`${fieldHeaderLabel}: ${h}`}>
                    <SearchPicker
                      groups={[{ items: availableFields.map(f => ({ id: f.key, label: f.label })) }]}
                      placeholder={ignoreLabel}
                      value={current}
                      onChange={item => setHeaderField(h, item?.id ?? '')}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-6">
            <Button
              variant="primary"
              size="md"
              className="flex-1 justify-center"
              disabled={!satisfiesRequired || confirmDisabled}
              onClick={() => onConfirm(rows, mapping)}
            >
              {confirmLabel}
            </Button>
            <Button variant="secondary" size="md" className="flex-1 justify-center" onClick={onCancel}>
              {cancelLabel}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
