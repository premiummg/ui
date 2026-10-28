import { useEffect, useMemo, useState } from 'react';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { StatusBadge } from '../StatusBadge';
import { useToast } from '../Toaster';
import { RipplingLinkModal } from '../RipplingLinkModal';
import type { RipplingCandidate, RipplingLinkModalLabels } from '../RipplingLinkModal';
import { ModalLoading, ModalLoadError, SelectAllRow, BatchFailures, useIdSelection } from '../RipplingBulk/shared';
import type { RipplingBulkSuggestions, RipplingBulkLinkResult } from '../RipplingBulk/types';

export interface RipplingBulkLinkModalLabels {
  heading: string;
  body: string;
  loading: string;
  loadError: string;
  retry: string;
  summary: (suggested: number, unmatched: number, freeWorkers: number) => string;
  nothingToMatch: string;
  selectAll: (n: number) => string;
  colEmployee: string;
  colWorker: string;
  colMatch: string;
  high: string;
  possible: string;
  // Label of each reason code the backend can send; an unknown code is shown as is.
  reasons: Record<string, string>;
  // Label of each Rippling worker status; an unknown status is shown as is.
  workerStatus: Record<string, string>;
  skipCodes: Record<string, string>;
  replacesId: (id: string) => string;
  noMatchHeading: (n: number) => string;
  noMatchHint: string;
  findInRippling: string;
  change: string;
  changeTitle: string;
  link: (n: number) => string;
  linking: string;
  close: string;
  done: string;
  resultLinked: (n: number) => string;
  resultSkipped: (n: number) => string;
  linkError: string;
}

export interface RipplingBulkLinkModalProps {
  // The suggested worker for every employee the automatic match could not link.
  loadSuggestions: () => Promise<RipplingBulkSuggestions>;
  // Links the ticked pairs in one go.
  onLinkBulk: (links: { employee_id: string; worker_id: string }[]) => Promise<RipplingBulkLinkResult>;
  // Matching one employee by hand opens the single search dialog.
  linkOne: {
    loadCandidates: () => Promise<RipplingCandidate[]>;
    onLink: (employeeId: string, candidate: RipplingCandidate) => Promise<unknown>;
    labels: RipplingLinkModalLabels;
    errorMessage?: (err: unknown) => string | null | undefined;
  };
  // Runs whenever something was linked (the list behind the dialog may have changed).
  onLinked: () => void;
  onClose: () => void;
  errorMessage?: (err: unknown) => string | null | undefined;
  labels: RipplingBulkLinkModalLabels;
}

// Bulk "Match with Rippling": a suggested worker for every active employee the
// automatic email sync could not link. Confident matches start ticked, doubtful
// ones start unticked; the admin reviews and links the ticked ones in one go, or
// searches Rippling by hand for any employee.
export function RipplingBulkLinkModal({ loadSuggestions, onLinkBulk, linkOne, onLinked, onClose, errorMessage, labels: t }: RipplingBulkLinkModalProps) {
  const { toast } = useToast();
  const [data, setData] = useState<RipplingBulkSuggestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const selection = useIdSelection();
  const [linking, setLinking] = useState(false);
  const [result, setResult] = useState<RipplingBulkLinkResult | null>(null);
  // The employee being matched by hand through the search dialog.
  const [searching, setSearching] = useState<{ id: string; name: string } | null>(null);

  function load() {
    setLoading(true);
    setLoadFailed(false);
    loadSuggestions()
      .then((res) => {
        setData(res);
        selection.reset(res.suggestions.filter((s) => s.confidence === 'high').map((s) => s.employee_id));
      })
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  const suggestions = data?.suggestions ?? [];
  const suggestionIds = useMemo(() => suggestions.map((s) => s.employee_id), [suggestions]);
  const allSelected = suggestions.length > 0 && suggestions.every((s) => selection.selected.has(s.employee_id));
  const nameById = useMemo(() => new Map(suggestions.map((s) => [s.employee_id, s.employee_name])), [suggestions]);
  const freeWorkerIds = useMemo(() => new Set(data?.free_worker_ids ?? []), [data]);

  // An employee was linked by hand from the search dialog. They and the worker
  // they got leave the lists, and anyone who was suggested that same worker
  // goes back to "no match" so they are not silently lost.
  function handleManuallyLinked(employeeId: string, workerId: string) {
    setData((prev) => {
      if (!prev) return prev;
      const orphaned = prev.suggestions.filter((s) => s.worker_id === workerId && s.employee_id !== employeeId);
      return {
        ...prev,
        suggestions: prev.suggestions.filter((s) => s.employee_id !== employeeId && s.worker_id !== workerId),
        unmatched: [
          ...prev.unmatched.filter((u) => u.employee_id !== employeeId),
          ...orphaned.map((s) => ({ employee_id: s.employee_id, employee_name: s.employee_name, employee_email: s.employee_email })),
        ],
        unlinked_workers: Math.max(0, prev.unlinked_workers - 1),
        free_worker_ids: prev.free_worker_ids.filter((id) => id !== workerId),
      };
    });
    selection.remove([employeeId]);
    onLinked();
  }

  async function handleLink() {
    const links = suggestions
      .filter((s) => selection.selected.has(s.employee_id))
      .map((s) => ({ employee_id: s.employee_id, worker_id: s.worker_id }));
    if (!links.length) return;
    setLinking(true);
    try {
      const res = await onLinkBulk(links);
      setResult(res);
      onLinked();
      if (res.skipped.length === 0) {
        toast(t.resultLinked(res.linked.length), 'success');
        onClose();
      }
    } catch (err) {
      toast(errorMessage?.(err) || t.linkError, 'error');
    } finally {
      setLinking(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="max-w-4xl">
      <div className="p-8">
        <h3 className="mb-2 font-heading text-base font-semibold text-gray-900 dark:text-gray-100">{t.heading}</h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{t.body}</p>

        {loading && <ModalLoading text={t.loading} />}
        {loadFailed && <ModalLoadError message={t.loadError} retryLabel={t.retry} onRetry={load} />}

        {data && result && (
          <div className="space-y-3 py-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t.resultLinked(result.linked.length)}
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
            <p className="mb-3 text-xs text-gray-400">{t.summary(data.suggestions.length, data.unmatched.length, data.unlinked_workers)}</p>

            {suggestions.length === 0 && data.unmatched.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">{t.nothingToMatch}</p>
            )}

            {suggestions.length > 0 && (
              <>
                <SelectAllRow checked={allSelected} onChange={() => selection.toggleAll(suggestionIds)} label={t.selectAll(suggestions.length)} />
                <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-x-4 border-b border-gray-200 pb-2 dark:border-white/20">
                  <span className="w-4" />
                  <span className="pmg-eyebrow text-gray-400 dark:text-gray-500">{t.colEmployee}</span>
                  <span className="pmg-eyebrow text-gray-400 dark:text-gray-500">{t.colWorker}</span>
                  <span className="pmg-eyebrow text-gray-400 dark:text-gray-500">{t.colMatch}</span>
                  <span className="w-16" />
                </div>
                <div className="max-h-[45vh] divide-y divide-gray-100 overflow-y-auto dark:divide-white/10">
                  {suggestions.map((s) => (
                    <label key={s.employee_id} className="grid cursor-pointer grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-x-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={selection.selected.has(s.employee_id)}
                        onChange={() => selection.toggle(s.employee_id)}
                        className="h-4 w-4 rounded accent-red-600"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">{s.employee_name}</span>
                        <span className="block truncate text-xs text-gray-400">{s.employee_email}</span>
                        {s.previous_rippling_id && (
                          <span className="block text-[11px] text-amber-600 dark:text-amber-400">{t.replacesId(s.previous_rippling_id)}</span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">{s.worker_name || s.worker_email}</span>
                        <span className="block truncate text-xs text-gray-400">
                          {s.worker_email}
                          {s.worker_title ? ` · ${s.worker_title}` : ''}
                          {s.worker_status ? ` · ${t.workerStatus[s.worker_status.toUpperCase()] ?? s.worker_status}` : ''}
                        </span>
                      </span>
                      <span className="flex flex-col items-end gap-1">
                        <StatusBadge
                          label={s.confidence === 'high' ? t.high : t.possible}
                          colorClass={s.confidence === 'high' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}
                        />
                        <span className="text-right text-[11px] text-gray-400">{s.reasons.map((r) => t.reasons[r] ?? r).join(' · ')}</span>
                      </span>
                      <Button
                        variant="secondary"
                        size="xs"
                        title={t.changeTitle}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSearching({ id: s.employee_id, name: s.employee_name }); }}
                      >
                        {t.change}
                      </Button>
                    </label>
                  ))}
                </div>
              </>
            )}

            {data.unmatched.length > 0 && (
              <div className="mt-5 border-t border-gray-100 pt-4 dark:border-white/10">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.noMatchHeading(data.unmatched.length)}</p>
                <p className="mb-2 text-xs text-gray-400">{t.noMatchHint}</p>
                <div className="max-h-[28vh] divide-y divide-gray-100 overflow-y-auto dark:divide-white/10">
                  {data.unmatched.map((u) => (
                    <div key={u.employee_id} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-gray-900 dark:text-gray-100">{u.employee_name}</span>
                        <span className="block truncate text-xs text-gray-400">{u.employee_email}</span>
                      </span>
                      <Button variant="secondary" size="xs" onClick={() => setSearching({ id: u.employee_id, name: u.employee_name })} className="shrink-0">
                        {t.findInRippling}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              {suggestions.length > 0 && (
                <Button onClick={handleLink} disabled={linking || selection.selected.size === 0} className="flex-1 justify-center">
                  {linking ? t.linking : t.link(selection.selected.size)}
                </Button>
              )}
              <Button variant="secondary" onClick={onClose} className={suggestions.length > 0 ? 'flex-1 justify-center' : 'w-full justify-center'}>
                {t.close}
              </Button>
            </div>
          </>
        )}
      </div>
      {searching && data && (
        <RipplingLinkModal
          employeeName={searching.name}
          loadCandidates={linkOne.loadCandidates}
          onLink={(candidate) => linkOne.onLink(searching.id, candidate)}
          onlyWorkerIds={freeWorkerIds}
          zIndex="z-[60]"
          errorMessage={linkOne.errorMessage}
          labels={linkOne.labels}
          onClose={() => setSearching(null)}
          onLinked={(candidate) => handleManuallyLinked(searching.id, candidate.worker_id)}
        />
      )}
    </Modal>
  );
}
