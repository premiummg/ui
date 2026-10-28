import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../Modal';
import { SearchInput } from '../SearchInput';
import { Button } from '../Button';
import { TextButton } from '../TextButton';
import { useToast } from '../Toaster';

// A real Rippling account could grow into the thousands of workers, with no
// pagination or virtualization in this list: rendering every match unbounded
// would mean a growing number of rows re-rendered on every keystroke. This cap
// is a ceiling for whenever that happens, with a hint to narrow the search
// instead of a wall of results.
const MAX_RESULTS = 50;

export interface RipplingCandidate {
  worker_id: string;
  name: string;
  email: string;
  title?: string | null;
  status?: string | null;
}

export interface RipplingLinkModalLabels {
  heading: string;
  body: (employeeName: string) => string;
  searchPlaceholder: string;
  loading: string;
  loadError: string;
  retry: string;
  noMatches: string;
  moreResults: (hidden: number) => string;
  link: string;
  linking: string;
  close: string;
  linkedToast: (workerName: string) => string;
  linkError: string;
}

export interface RipplingLinkModalProps {
  employeeName: string;
  // Where the Rippling workers come from. Each app wires its own endpoint.
  loadCandidates: () => Promise<RipplingCandidate[]>;
  // Saves the link. Reject (throw) to report a failure.
  onLink: (candidate: RipplingCandidate) => Promise<unknown>;
  onClose: () => void;
  // Runs after a successful link, before the modal closes.
  onLinked?: (candidate: RipplingCandidate) => void;
  // When given, only these workers are offered (the bulk flow passes the ones nobody is linked to yet).
  onlyWorkerIds?: Set<string>;
  // Turns a failed link into the message to show; falls back to labels.linkError.
  errorMessage?: (err: unknown) => string | null | undefined;
  labels: RipplingLinkModalLabels;
  // Lets it open on top of another modal.
  zIndex?: string;
}

// Finds the Rippling worker that matches one employee and links them. The
// search starts filled with the employee's own name: the usual case is a near
// exact match the automatic email sync could not make, so it narrows to the
// right person at once.
export function RipplingLinkModal({
  employeeName, loadCandidates, onLink, onClose, onLinked, onlyWorkerIds, errorMessage, labels: t, zIndex,
}: RipplingLinkModalProps) {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<RipplingCandidate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [search, setSearch] = useState(employeeName);
  const [linking, setLinking] = useState<RipplingCandidate | null>(null);

  function load() {
    setLoading(true);
    setLoadFailed(false);
    loadCandidates()
      .then(setCandidates)
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  const matches = useMemo(() => {
    if (!candidates) return [];
    const pool = onlyWorkerIds ? candidates.filter((c) => onlyWorkerIds.has(c.worker_id)) : candidates;
    const q = search.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [candidates, search, onlyWorkerIds]);
  const shown = matches.slice(0, MAX_RESULTS);
  const hiddenCount = matches.length - shown.length;

  async function handleLink(candidate: RipplingCandidate) {
    setLinking(candidate);
    try {
      await onLink(candidate);
      toast(t.linkedToast(candidate.name), 'success');
      onLinked?.(candidate);
      onClose();
    } catch (err) {
      toast(errorMessage?.(err) || t.linkError, 'error');
    } finally {
      setLinking(null);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg" zIndex={zIndex}>
      <div className="p-8">
        <h3 className="mb-2 font-heading text-base font-semibold text-gray-900 dark:text-gray-100">{t.heading}</h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{t.body(employeeName)}</p>

        <SearchInput value={search} onChange={setSearch} placeholder={t.searchPlaceholder} className="mb-3 w-full" />

        <div className="max-h-[50vh] divide-y divide-gray-100 overflow-y-auto dark:divide-white/10">
          {loading && <p className="py-3 text-sm text-gray-400">{t.loading}</p>}
          {loadFailed && (
            <div className="flex items-center justify-between gap-3 py-6">
              <p className="text-sm text-red-500">{t.loadError}</p>
              <TextButton onClick={load}>{t.retry}</TextButton>
            </div>
          )}
          {!loading && !loadFailed && shown.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">{t.noMatches}</p>
          )}
          {shown.map((c) => (
            <div key={c.worker_id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{c.name || c.email}</div>
                <div className="truncate text-xs text-gray-400">
                  {c.email}
                  {c.title ? ` \u00b7 ${c.title}` : ''}
                  {c.status ? ` \u00b7 ${c.status}` : ''}
                </div>
              </div>
              <Button size="xs" className="shrink-0" onClick={() => handleLink(c)} disabled={linking !== null}>
                {linking?.worker_id === c.worker_id ? t.linking : t.link}
              </Button>
            </div>
          ))}
          {hiddenCount > 0 && (
            <p className="py-2 text-center text-xs text-gray-400">{t.moreResults(hiddenCount)}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}>{t.close}</Button>
        </div>
      </div>
    </Modal>
  );
}
