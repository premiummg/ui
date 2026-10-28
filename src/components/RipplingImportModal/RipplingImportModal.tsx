import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Button } from '../Button';
import { FormLabel } from '../FormLabel';
import { Modal } from '../Modal';
import { useToast } from '../Toaster';
import { copyToClipboard } from '../../lib/clipboard';
import { ModalLoading, ModalLoadError, SelectAllRow, BatchFailures, useIdSelection } from '../RipplingBulk/shared';
import type { RipplingImportCandidates, RipplingImportOutcome } from '../RipplingBulk/types';

export interface RipplingImportSkipCounts {
  knownEmail: number;
  identityAccount: number;
  terminated: number;
  likelyMatch: number;
  noEmail: number;
}

export interface RipplingImportModalLabels {
  heading: string;
  body: string;
  loading: string;
  loadError: string;
  retry: string;
  // Why other free workers are not offered. Empty when there is nothing to say.
  skippedNote: (counts: RipplingImportSkipCounts) => string;
  truncatedNote: (shown: number, totalEligible: number) => string;
  nothingToImport: string;
  role: string;
  division: string;
  chooseDivision: string;
  manager: string;
  selectAll: (n: number) => string;
  colWorker: string;
  colRole: string;
  colStart: string;
  // Label of each Rippling worker status; an unknown status shows inactiveHint.
  statusLabels: Record<string, string>;
  inactiveHint: string;
  create: (n: number) => string;
  creating: string;
  close: string;
  done: string;
  resultCreated: (n: number) => string;
  resultFailed: (n: number) => string;
  notEligible: string;
  createError: string;
  tempPasswordsHeading: string;
  copyPasswords: string;
  copiedPasswords: string;
}

export interface RipplingImportApplyPayload {
  worker_ids: string[];
  role: string;
  division_id: string;
  manager_id: string | null;
}

export interface RipplingImportModalProps {
  // The Rippling workers that have no account here.
  loadCandidates: () => Promise<RipplingImportCandidates>;
  // Creates an account for each chosen worker.
  onApply: (payload: RipplingImportApplyPayload) => Promise<RipplingImportOutcome[]>;
  // Choices for the shared fields. The app loads them its own way.
  roles: string[];
  roleLabel: (role: string) => string;
  divisions: { id: string; name: string }[];
  // The roles that can be created without a manager.
  managerOptionalRoles: string[];
  // The app's own manager picker (it knows how to list its managers).
  renderManagerField: (props: { value: string; onChange: (id: string) => void }) => ReactNode;
  // How a worker's start date reads.
  formatDate: (iso: string) => string;
  // Runs once at least one account was created.
  onImported: () => void;
  onClose: () => void;
  errorMessage?: (err: unknown) => string | null | undefined;
  labels: RipplingImportModalLabels;
}

// Pre-start workers (hired, accepted) and anything but an active worker start
// unticked; the admin decides.
function isActive(status: string | null): boolean {
  return !status || status.toUpperCase() === 'ACTIVE';
}

// Creates an account for each selected Rippling worker that has none here,
// linked to that worker. The app re-checks eligibility and runs each account
// through the same validation as its own add-employee form.
export function RipplingImportModal({
  loadCandidates, onApply, roles, roleLabel, divisions, managerOptionalRoles, renderManagerField, formatDate, onImported, onClose, errorMessage, labels: t,
}: RipplingImportModalProps) {
  const { toast } = useToast();
  const [data, setData] = useState<RipplingImportCandidates | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const selection = useIdSelection();

  const [role, setRole] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [managerId, setManagerId] = useState('');

  const [creating, setCreating] = useState(false);
  const [outcomes, setOutcomes] = useState<RipplingImportOutcome[] | null>(null);
  const [copied, setCopied] = useState(false);

  function load() {
    setLoading(true);
    setLoadFailed(false);
    loadCandidates()
      .then((res) => {
        setData(res);
        selection.reset(res.candidates.filter((c) => isActive(c.status)).map((c) => c.worker_id));
      })
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  // Default to a worker when that role exists, else the first one listed:
  // never a value the select cannot show.
  useEffect(() => {
    setRole((prev) => prev || (roles.includes('worker') ? 'worker' : roles[0] ?? ''));
  }, [roles]);

  const candidates = data?.candidates ?? [];
  const candidateIds = useMemo(() => candidates.map((c) => c.worker_id), [candidates]);
  const allSelected = candidates.length > 0 && candidates.every((c) => selection.selected.has(c.worker_id));
  const managerRequired = !managerOptionalRoles.includes(role);
  const ready = selection.selected.size > 0 && !!role && !!divisionId && (!managerRequired || !!managerId);

  async function handleCreate() {
    if (!ready) return;
    setCreating(true);
    try {
      const res = await onApply({
        worker_ids: candidates.filter((c) => selection.selected.has(c.worker_id)).map((c) => c.worker_id),
        role,
        division_id: divisionId,
        manager_id: managerId || null,
      });
      setOutcomes(res);
      if (res.some((o) => o.status === 'created')) onImported();
    } catch (err) {
      toast(errorMessage?.(err) || t.createError, 'error');
    } finally {
      setCreating(false);
    }
  }

  const created = outcomes?.filter((o) => o.status === 'created') ?? [];
  const notCreated = outcomes?.filter((o) => o.status !== 'created') ?? [];
  const withPassword = created.filter((o) => o.temporary_password);

  function copyPasswords() {
    copyToClipboard(withPassword.map((o) => `${o.email}\t${o.temporary_password}`).join('\n'));
    setCopied(true);
  }

  const skippedNote = data
    ? t.skippedNote({
        knownEmail: data.skipped_known_email, identityAccount: data.skipped_identity_account, terminated: data.skipped_terminated,
        likelyMatch: data.skipped_likely_match, noEmail: data.skipped_no_email,
      })
    : '';

  return (
    <Modal onClose={creating ? () => {} : onClose} maxWidth="max-w-4xl">
      <div className="p-8">
        <h3 className="mb-2 font-heading text-base font-semibold text-gray-900 dark:text-gray-100">{t.heading}</h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{t.body}</p>

        {loading && <ModalLoading text={t.loading} />}
        {loadFailed && <ModalLoadError message={t.loadError} retryLabel={t.retry} onRetry={load} />}

        {data && outcomes && (
          <div className="space-y-4 py-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t.resultCreated(created.length)}
              {notCreated.length > 0 && <> · {t.resultFailed(notCreated.length)}</>}
            </p>
            <BatchFailures
              items={notCreated.map((o) => ({
                key: o.worker_id,
                name: o.name || o.worker_id,
                message: o.message ?? (o.code === 'not_eligible' ? t.notEligible : t.createError),
              }))}
            />
            {withPassword.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.tempPasswordsHeading}</p>
                  <Button variant="secondary" size="xs" onClick={copyPasswords}>{copied ? t.copiedPasswords : t.copyPasswords}</Button>
                </div>
                <div className="max-h-[30vh] divide-y divide-gray-100 overflow-y-auto dark:divide-white/10">
                  {withPassword.map((o) => (
                    <div key={o.worker_id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="text-gray-900 dark:text-gray-100">{o.name}</span>
                      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{o.temporary_password}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button onClick={onClose}>{t.done}</Button>
            </div>
          </div>
        )}

        {data && !outcomes && (
          <>
            {skippedNote && <p className="mb-3 text-xs text-gray-400">{skippedNote}</p>}
            {data.truncated > 0 && <p className="mb-3 text-xs text-amber-600 dark:text-amber-400">{t.truncatedNote(candidates.length, data.total_eligible)}</p>}
            {candidates.length === 0 && <p className="py-6 text-center text-sm text-gray-400">{t.nothingToImport}</p>}

            {candidates.length > 0 && (
              <>
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <FormLabel required htmlFor="rippling-import-role" text={t.role} />
                    <select id="rippling-import-role" value={role} onChange={(e) => setRole(e.target.value)} className="input-field w-full">
                      {roles.map((r) => (
                        <option key={r} value={r}>{roleLabel(r)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FormLabel required htmlFor="rippling-import-division" text={t.division} />
                    <select id="rippling-import-division" value={divisionId} onChange={(e) => setDivisionId(e.target.value)} className="input-field w-full">
                      <option value="">{t.chooseDivision}</option>
                      {divisions.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FormLabel required={managerRequired} optional={!managerRequired} text={t.manager} />
                    {renderManagerField({ value: managerId, onChange: setManagerId })}
                  </div>
                </div>

                <SelectAllRow checked={allSelected} onChange={() => selection.toggleAll(candidateIds)} label={t.selectAll(candidates.length)} />
                <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-x-4 border-b border-gray-200 pb-2 dark:border-white/20">
                  <span className="w-4" />
                  <span className="pmg-eyebrow text-gray-400 dark:text-gray-500">{t.colWorker}</span>
                  <span className="pmg-eyebrow text-gray-400 dark:text-gray-500">{t.colRole}</span>
                  <span className="pmg-eyebrow text-gray-400 dark:text-gray-500">{t.colStart}</span>
                </div>
                <div className="max-h-[35vh] divide-y divide-gray-100 overflow-y-auto dark:divide-white/10">
                  {candidates.map((c) => (
                    <label key={c.worker_id} className="grid cursor-pointer grid-cols-[auto_1fr_1fr_auto] items-center gap-x-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={selection.selected.has(c.worker_id)}
                        onChange={() => selection.toggle(c.worker_id)}
                        className="h-4 w-4 rounded accent-red-600"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
                        <span className="block truncate text-xs text-gray-400">{c.email}</span>
                      </span>
                      <span className="min-w-0 truncate text-sm text-gray-700 dark:text-gray-300">
                        {c.title ?? '—'}
                        {!isActive(c.status) && (
                          <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">{t.statusLabels[(c.status ?? '').toUpperCase()] ?? t.inactiveHint}</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-400">{c.start_date ? formatDate(c.start_date) : '—'}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            <div className="mt-6 flex gap-2">
              {candidates.length > 0 && (
                <Button onClick={handleCreate} disabled={creating || !ready} className="flex-1 justify-center">
                  {creating ? t.creating : t.create(selection.selected.size)}
                </Button>
              )}
              <Button variant="secondary" onClick={onClose} disabled={creating} className={candidates.length > 0 ? 'flex-1 justify-center' : 'w-full justify-center'}>
                {t.close}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
