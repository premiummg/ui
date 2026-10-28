import { useEffect, useMemo, useState } from 'react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { useToast } from '../Toaster';
import { ModalLoading, ModalLoadError, SelectAllRow, BatchFailures, useIdSelection } from '../RipplingBulk/shared';
import type { RipplingBulkFillPreview, RipplingBulkFillResult } from '../RipplingBulk/types';

export interface RipplingBulkFillModalLabels {
  heading: string;
  body: string;
  loading: string;
  loadError: string;
  retry: string;
  failedNote: (n: number) => string;
  truncatedNote: (shown: number, total: number) => string;
  nothingMissing: string;
  selectAll: (n: number) => string;
  fieldsCount: (n: number) => string;
  fill: (n: number) => string;
  filling: string;
  close: string;
  done: string;
  resultFilled: (n: number) => string;
  resultSkipped: (n: number) => string;
  skipCodes: Record<string, string>;
  fillError: string;
}

export interface RipplingBulkFillModalProps {
  // What Rippling has and each linked employee lacks.
  loadPreview: () => Promise<RipplingBulkFillPreview>;
  // Fills the chosen employees. The server recomputes what is missing at the moment of applying.
  onApply: (employeeIds: string[]) => Promise<RipplingBulkFillResult>;
  // The visible name of a field key ("phone" becomes "Phone").
  fieldLabel: (field: string) => string;
  // Runs whenever something was filled.
  onFilled: () => void;
  onClose: () => void;
  errorMessage?: (err: unknown) => string | null | undefined;
  labels: RipplingBulkFillModalLabels;
}

// The single-employee "Fill missing info from Rippling" for everyone linked at
// once. A field filled in since the preview was shown is never overwritten,
// because the app recomputes what is missing when it applies.
export function RipplingBulkFillModal({ loadPreview, onApply, fieldLabel, onFilled, onClose, errorMessage, labels: t }: RipplingBulkFillModalProps) {
  const { toast } = useToast();
  const [data, setData] = useState<RipplingBulkFillPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const selection = useIdSelection();
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<RipplingBulkFillResult | null>(null);

  function load() {
    setLoading(true);
    setLoadFailed(false);
    loadPreview()
      .then((res) => {
        setData(res);
        selection.reset(res.rows.map((r) => r.employee_id));
      })
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  const rows = data?.rows ?? [];
  const rowIds = useMemo(() => rows.map((r) => r.employee_id), [rows]);
  const allSelected = rows.length > 0 && rows.every((r) => selection.selected.has(r.employee_id));
  const nameById = useMemo(() => new Map(rows.map((r) => [r.employee_id, r.employee_name])), [rows]);

  async function handleFill() {
    const ids = rows.filter((r) => selection.selected.has(r.employee_id)).map((r) => r.employee_id);
    if (!ids.length) return;
    setApplying(true);
    try {
      const res = await onApply(ids);
      setResult(res);
      onFilled();
      if (res.skipped.length === 0) {
        toast(t.resultFilled(res.filled.length), 'success');
        onClose();
      }
    } catch (err) {
      toast(errorMessage?.(err) || t.fillError, 'error');
    } finally {
      setApplying(false);
    }
  }

  return (
    <Modal onClose={applying ? () => {} : onClose} maxWidth="max-w-4xl">
      <div className="p-8">
        <h3 className="mb-2 font-heading text-base font-semibold text-gray-900 dark:text-gray-100">{t.heading}</h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{t.body}</p>

        {loading && <ModalLoading text={t.loading} />}
        {loadFailed && <ModalLoadError message={t.loadError} retryLabel={t.retry} onRetry={load} />}

        {data && result && (
          <div className="space-y-3 py-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t.resultFilled(result.filled.length)}
              {result.skipped.length > 0 && <> · {t.resultSkipped(result.skipped.length)}</>}
            </p>
            <BatchFailures
              items={result.skipped.map((s) => ({
                key: s.employee_id,
                name: nameById.get(s.employee_id) ?? s.employee_id,
                message: t.skipCodes[s.code] ?? s.code,
              }))}
            />
            <div className="flex justify-end pt-2">
              <Button onClick={onClose}>{t.done}</Button>
            </div>
          </div>
        )}

        {data && !result && (
          <>
            {data.failed > 0 && <p className="mb-3 text-xs text-amber-600 dark:text-amber-400">{t.failedNote(data.failed)}</p>}
            {data.truncated > 0 && <p className="mb-3 text-xs text-amber-600 dark:text-amber-400">{t.truncatedNote(data.truncated, data.total)}</p>}
            {rows.length === 0 && <p className="py-6 text-center text-sm text-gray-400">{t.nothingMissing}</p>}

            {rows.length > 0 && (
              <>
                <SelectAllRow checked={allSelected} onChange={() => selection.toggleAll(rowIds)} label={t.selectAll(rows.length)} />
                <div className="max-h-[50vh] divide-y divide-gray-100 overflow-y-auto border-t border-gray-200 dark:divide-white/10 dark:border-white/20">
                  {rows.map((row) => {
                    const entries = Object.entries(row.fields);
                    return (
                      <label key={row.employee_id} className="flex cursor-pointer items-start gap-3 py-3 hover:bg-gray-50 dark:hover:bg-white/5">
                        <input
                          type="checkbox"
                          checked={selection.selected.has(row.employee_id)}
                          onChange={() => selection.toggle(row.employee_id)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded accent-red-600"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                            {row.employee_name}
                            <span className="ml-2 text-xs font-normal text-gray-400">{t.fieldsCount(entries.length)}</span>
                          </span>
                          <span className="mt-1 grid grid-cols-1 gap-x-6 gap-y-0.5 sm:grid-cols-2">
                            {entries.map(([field, value]) => (
                              <span key={field} className="flex items-baseline gap-2 text-xs">
                                <span className="pmg-eyebrow shrink-0 text-gray-400 dark:text-gray-500">{fieldLabel(field)}</span>
                                <span className="truncate text-gray-800 dark:text-gray-100">{value}</span>
                              </span>
                            ))}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}

            <div className="mt-6 flex gap-2">
              {rows.length > 0 && (
                <Button onClick={handleFill} disabled={applying || selection.selected.size === 0} className="flex-1 justify-center">
                  {applying ? t.filling : t.fill(selection.selected.size)}
                </Button>
              )}
              <Button variant="secondary" onClick={onClose} disabled={applying} className={rows.length > 0 ? 'flex-1 justify-center' : 'w-full justify-center'}>
                {t.close}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
