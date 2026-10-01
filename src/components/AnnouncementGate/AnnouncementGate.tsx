import { FiAlertCircle } from 'react-icons/fi';
import { useState } from 'react';
import { Avatar } from '../Avatar';

export interface AnnouncementSubmissionSummaryRow {
  project_number: string | number;
  project_name: string;
  task_label?: string | null;
  took_lunch?: boolean;
  hours: number | string;
}

// Raised from a timesheet submission's own thread, shown ABOVE the message -
// optional, since not every consumer has a concept of submissions at all
// (an intranet app with no timesheets has nothing to put here, and the card
// simply never renders).
export interface AnnouncementSubmissionSummary {
  work_date: string;
  status: string;
  rows: AnnouncementSubmissionSummaryRow[];
}

export interface AnnouncementItem {
  id: string;
  sender_name?: string | null;
  title: string;
  message: string;
  requires_reply: boolean;
  submission_summary?: AnnouncementSubmissionSummary | null;
}

export interface AnnouncementGateLabels {
  messageFrom: string;
  // Shown instead of a blank byline when sender_name is missing.
  defaultSender: string;
  queuePosition: (total: number) => string;
  replyLabel: string;
  replyPlaceholder: string;
  replyRequiredError: string;
  // Fallback shown when onRespond rejects without its own message.
  sendError: string;
  sending: string;
  sendReply: string;
  gotIt: string;
  needsReplyNotice: string;
  confirmReadNotice: string;
  waitingBehind: (n: number) => string;
  // Only used inside a submission-summary card - omit both if no item in
  // `queue` will ever carry one.
  noTask?: string;
  lunch?: string;
  // Passed to `Date.toLocaleDateString` for a submission summary's date
  // line (e.g. 'en-CA'/'fr-CA'). Defaults to the browser's own locale.
  dateLocale?: string;
}

export interface AnnouncementGateProps {
  // The pending queue, earliest-owed first - only `queue[0]` renders. Keeping
  // this fresh (polling, refetch-on-focus, a query library's own mechanism)
  // is entirely the host's own concern; this component has no network code
  // of its own.
  queue: AnnouncementItem[];
  // Resolves once the response is accepted (the caller advances its own
  // queue state), rejects with an Error whose message displays as-is,
  // falling back to labels.sendError. `reply` is the trimmed textarea value,
  // '' when the sender didn't require one.
  onRespond: (id: string, reply: string) => Promise<void>;
  labels: AnnouncementGateLabels;
}

// Blocks the app while the signed-in user owes someone an answer - pulled out
// of timesheet-payroll-system and pmg-intranet, which had each hand-written
// their own version (pmg's: ~half as developed - no queue-position dots, no
// submission-summary card). Deliberately has no dismiss path at all: no close
// button, no Escape handler, no backdrop click - the whole point is that it
// cannot be dismissed without responding.
export function AnnouncementGate({ queue, onRespond, labels: t }: AnnouncementGateProps) {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const current = queue[0];
  if (!current) return null;

  async function submit() {
    if (!current) return;
    if (current.requires_reply && !reply.trim()) {
      setError(t.replyRequiredError);
      return;
    }
    setSending(true);
    setError('');
    try {
      await onRespond(current.id, reply.trim());
      setReply('');
    } catch (err: any) {
      setError(err?.message || t.sendError);
    } finally {
      setSending(false);
    }
  }

  const sender = current.sender_name ?? t.defaultSender;

  return (
    // Scroll on the BACKDROP, not the card: centring a taller-than-viewport
    // dialog clips its top, and this is the one dialog with no way out - a
    // long message on a phone could put the button somewhere unreachable.
    <div className="fixed inset-0 z-200 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl overflow-hidden bg-white dark:bg-(--premium-dark-grey) shadow-2xl border border-gray-100 dark:border-white/10">

          {/* The sender leads. The difference between "the system is asking"
              and "your foreman is asking" decides how seriously this gets
              taken. */}
          <div className="relative pmg-field px-6 py-4">
            <div className="absolute inset-0 pmg-bars pointer-events-none" />
            <div className="relative flex items-center gap-3.5">
              <Avatar fullName={sender} size={44} color="rgba(255,255,255,0.15)" />
              <div className="min-w-0">
                <p className="pmg-eyebrow text-white/70 mb-1">{t.messageFrom}</p>
                <p className="font-heading font-black text-lg text-white leading-none truncate">{sender}</p>
              </div>

              {/* Queue position, out of the byline and into its own control.
                  "1 of 3" as a trailing sentence fragment is the difference
                  between answering one message and discovering two more
                  behind it. */}
              {queue.length > 1 && (
                <div className="ml-auto shrink-0 text-right">
                  <p className="pmg-eyebrow text-white/70 mb-1.5">{t.queuePosition(queue.length)}</p>
                  <div className="flex gap-1 justify-end">
                    {queue.map((q, i) => (
                      <span key={q.id} className={`h-1.5 rounded-full ${i === 0 ? 'w-5 bg-white' : 'w-1.5 bg-white/35'}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="pmg-stripe h-0.75" />

          <div className="px-6 py-5">
            <h2 className="font-heading font-extrabold text-lg text-gray-900 dark:text-gray-100 mb-4">{current.title}</h2>

            {/* Shown ABOVE the message so a worker asked to confirm their
                hours sees what they actually logged first, then reads the
                question about it. */}
            {current.submission_summary && (
              <div className="mb-4 rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2 bg-gray-50 dark:bg-white/5">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {new Date(current.submission_summary.work_date).toLocaleDateString(t.dateLocale, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <span className="text-[11px] font-medium capitalize text-gray-400">{current.submission_summary.status}</span>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {current.submission_summary.rows.map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 px-3.5 py-2 text-sm">
                      <div className="min-w-0">
                        <p className="text-gray-800 dark:text-gray-100 truncate">#{r.project_number} {r.project_name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {r.task_label ?? t.noTask}{r.took_lunch ? ` · ${t.lunch}` : ''}
                        </p>
                      </div>
                      <span className="pmg-figure text-sm text-gray-900 dark:text-gray-100 shrink-0">{r.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* whitespace-pre-wrap so the sender's own line breaks survive */}
            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap mb-5">{current.message}</p>

            {current.requires_reply && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t.replyLabel}<span className="text-red-500 ml-0.5">*</span>
                </label>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  autoFocus
                  className="input-field resize-none"
                  placeholder={t.replyPlaceholder}
                />
                <p className="text-xs text-gray-400 mt-1.5 text-right">
                  <span className="pmg-figure">{reply.length}</span> / <span className="pmg-figure">2000</span>
                </p>
              </div>
            )}

            {error && <p className="mb-3 text-sm" style={{ color: 'var(--premium-red)' }}>{error}</p>}

            <button
              onClick={submit}
              disabled={sending}
              className="btn-primary w-full py-2.5 text-sm disabled:opacity-60"
            >
              {sending ? t.sending : current.requires_reply ? t.sendReply : t.gotIt}
            </button>

            {/* Amber and boxed: "you cannot leave yet" is a standing
                condition, which is what the amber channel means everywhere
                else here. */}
            <div
              className="flex items-start gap-2.5 mt-3 rounded-lg px-3 py-2.5 border"
              style={{ borderColor: 'rgba(250,173,0,0.45)', backgroundColor: 'rgba(250,173,0,0.10)' }}
            >
              <FiAlertCircle size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--premium-orange)' }} />
              <p className="text-xs text-gray-700 dark:text-gray-200">
                {current.requires_reply ? t.needsReplyNotice : t.confirmReadNotice}
                {queue.length > 1 && t.waitingBehind(queue.length - 1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
