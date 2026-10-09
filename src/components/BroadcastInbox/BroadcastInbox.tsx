import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { FiMessageSquare, FiPlus, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import type { ChatBroadcast } from '../ConversationThread/types';
import { Card } from '../Card';
import { ConfirmDialog } from '../ConfirmDialog';
import type { BroadcastInboxProps, BroadcastInboxStrings, BroadcastSide, BroadcastStatus } from './types';
import { StatusPill, broadcastStatus, peopleOf } from './broadcastParts';

export type { BroadcastInboxProps, BroadcastInboxStrings, BroadcastDetailProps } from './types';

type StatusFilter = BroadcastStatus | 'all';

function localDay(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function Field({ id, label, children, className = '' }: { id: string; label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}

// text-base (16px), not text-xs - the search/date/person inputs below are
// real text-entry fields, and iOS Safari auto-zooms the page on focus for
// any of those under 16px (and doesn't reliably zoom back out on blur). The
// <select> sharing this class isn't actually at risk itself (its own native
// picker doesn't trigger that zoom), but splitting it into a second,
// near-identical constant just to keep it 4px smaller isn't worth it.
const CONTROL =
  'rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-(--premium-red) dark:border-white/15 dark:bg-white/5 dark:text-gray-100 dark:[color-scheme:dark]';

function BroadcastRow({
  broadcast,
  side,
  currentUserId,
  strings,
  canManage,
  onOpen,
  onDeleteClick,
}: {
  broadcast: ChatBroadcast;
  side: BroadcastSide;
  currentUserId: string | undefined;
  strings: BroadcastInboxStrings;
  canManage: boolean;
  onOpen: () => void;
  onDeleteClick: () => void;
}) {
  const unread = broadcast.unread;
  const mine = broadcast.createdBy === currentUserId;
  const recipients = broadcast.recipients.map((r) => r.participant.name).join(', ');
  const subline =
    side === 'sent'
      ? `${mine ? strings.sentByYou : strings.sentBy(broadcast.senderName ?? strings.sentBySomeoneElse)} · ${recipients}`
      : broadcast.senderName ?? strings.sentBySomeoneElse;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-gray-50 dark:hover:bg-white/5">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${unread ? 'bg-(--premium-red)' : 'bg-transparent'}`}
        />
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm text-gray-900 dark:text-gray-100 ${unread ? 'font-bold' : 'font-semibold'}`}>{broadcast.title}</span>
          <span className="block truncate text-xs text-gray-400">{subline}</span>
        </span>
      </button>
      <span className="hidden shrink-0 text-xs text-gray-400 sm:block">{formatShortDate(broadcast.createdAt)}</span>
      <StatusPill broadcast={broadcast} side={side} currentUserId={currentUserId} strings={strings} />
      {canManage && (
        <button
          type="button"
          onClick={onDeleteClick}
          title={strings.deleteConversation}
          className="shrink-0 rounded-lg p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-600 dark:text-gray-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <FiTrash2 size={13} />
        </button>
      )}
    </div>
  );
}

// The Sent/Received inbox: a compact list with search and filters. Opening a
// conversation hands off to BroadcastDetail through onOpen. All filtering runs
// on the lists already loaded, so there are no extra requests per keystroke.
export function BroadcastInbox({
  fetchSent,
  fetchReceived,
  onDelete,
  currentUserId,
  canSendMessages,
  canManageBroadcast,
  onOpen,
  onCompose,
  strings,
  pollIntervalMs = 15_000,
}: BroadcastInboxProps) {
  const canReadSent = canSendMessages && !!fetchSent;
  const [tab, setTab] = useState<BroadcastSide>(canReadSent ? 'sent' : 'received');
  const [sent, setSent] = useState<ChatBroadcast[]>([]);
  const [received, setReceived] = useState<ChatBroadcast[]>([]);
  const [loadingSent, setLoadingSent] = useState(canReadSent);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [person, setPerson] = useState<{ id: string; name: string } | null>(null);
  const [personQuery, setPersonQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const ids = {
    search: useId(),
    status: useId(),
    from: useId(),
    to: useId(),
    person: useId(),
  };

  useEffect(() => {
    function refresh() {
      if (document.visibilityState === 'hidden') return;
      if (canReadSent) fetchSent!().then(setSent).catch(() => {});
      fetchReceived().then(setReceived).catch(() => {});
    }
    if (canReadSent) fetchSent!().then(setSent).catch(() => {}).finally(() => setLoadingSent(false));
    fetchReceived().then(setReceived).catch(() => {}).finally(() => setLoadingReceived(false));
    const interval = setInterval(refresh, pollIntervalMs);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canReadSent, pollIntervalMs]);

  const items = tab === 'sent' ? sent : received;
  const loadingItems = tab === 'sent' ? loadingSent : loadingReceived;

  const people = useMemo(() => {
    const byId = new Map<string, string>();
    for (const b of items) for (const p of peopleOf(b, tab)) if (p.name && !byId.has(p.id)) byId.set(p.id, p.name);
    return [...byId].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [items, tab]);

  const personSuggestions = useMemo(() => {
    const q = personQuery.trim().toLowerCase();
    if (!q || person) return [];
    return people.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [people, personQuery, person]);

  const filtersActive = !!query.trim() || status !== 'all' || !!from || !!to || !!person || unreadOnly;

  function matchesFilters(b: ChatBroadcast): boolean {
    if (unreadOnly && !b.unread) return false;
    if (status !== 'all' && broadcastStatus(b, tab, currentUserId) !== status) return false;
    const day = localDay(b.createdAt);
    if (from && day < from) return false;
    if (to && day > to) return false;
    if (person && !peopleOf(b, tab).some((p) => p.id === person.id)) return false;
    const q = query.trim().toLowerCase();
    if (q) {
      const haystack = [b.title, ...peopleOf(b, tab).map((p) => p.name)].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  }

  const visible = items.filter(matchesFilters);
  const sentUnread = sent.filter((b) => b.unread).length;
  const receivedUnread = received.filter((b) => b.unread).length;
  const deletingBroadcast = sent.find((b) => b.id === deletingId);

  function clearFilters() {
    setQuery('');
    setStatus('all');
    setFrom('');
    setTo('');
    setPerson(null);
    setPersonQuery('');
    setUnreadOnly(false);
  }

  async function confirmDelete() {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await onDelete(deletingId);
      setSent((prev) => prev.filter((b) => b.id !== deletingId));
      setDeletingId(null);
    } finally {
      setDeleting(false);
    }
  }

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: strings.statusAllLabel },
    { value: 'needsReply', label: strings.statusNeedsReplyLabel },
    { value: 'waiting', label: strings.statusWaitingLabel },
    { value: 'answered', label: strings.statusAnsweredLabel },
    { value: 'closed', label: strings.statusClosedLabel },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {canReadSent ? (
            ([
              ['sent', strings.sentTabLabel, sent.length] as const,
              ['received', strings.receivedTabLabel, received.length] as const,
            ]).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  tab === key ? 'text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
                }`}
                style={tab === key ? { backgroundColor: 'var(--premium-red)' } : {}}
              >
                {label} <span className={tab === key ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}>{count}</span>
              </button>
            ))
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUnreadOnly((v) => !v)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              unreadOnly ? 'text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
            }`}
            style={unreadOnly ? { backgroundColor: 'var(--premium-red)' } : {}}
          >
            {strings.unreadOnlyLabel(tab === 'sent' && canReadSent ? sentUnread : receivedUnread)}
          </button>
          {onCompose && (
            <button
              type="button"
              onClick={onCompose}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition"
              style={{ backgroundColor: 'var(--premium-red)' }}
            >
              <FiPlus size={13} /> {strings.newMessageLabel}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
        <Field id={ids.search} label={strings.searchLabel} className="min-w-[200px] flex-[2]">
          <div className="relative">
            <FiSearch size={13} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-gray-400" />
            <input
              id={ids.search}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={strings.searchPlaceholder}
              className={`${CONTROL} w-full pl-7`}
            />
          </div>
        </Field>
        <Field id={ids.status} label={strings.statusFilterLabel} className="min-w-[150px]">
          <select id={ids.status} value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className={CONTROL}>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field id={ids.from} label={strings.dateFromLabel} className="min-w-[140px]">
          <input id={ids.from} type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={CONTROL} />
        </Field>
        <Field id={ids.to} label={strings.dateToLabel} className="min-w-[140px]">
          <input id={ids.to} type="date" value={to} onChange={(e) => setTo(e.target.value)} className={CONTROL} />
        </Field>
        <Field id={ids.person} label={strings.personFilterLabel} className="relative min-w-[180px] flex-[1.5]">
          <input
            id={ids.person}
            type="text"
            value={person ? person.name : personQuery}
            onChange={(e) => {
              setPersonQuery(e.target.value);
              setPerson(null);
            }}
            placeholder={strings.personFilterPlaceholder}
            autoComplete="off"
            className={CONTROL}
          />
          {personSuggestions.length > 0 && (
            <ul className="absolute top-full right-0 left-0 z-10 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-white/15 dark:bg-(--premium-dark-grey)">
              {personSuggestions.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPerson(p);
                      setPersonQuery(p.name);
                    }}
                    className="block w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10"
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Field>
        {filtersActive && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
          >
            <FiX size={12} /> {strings.clearFiltersLabel}
          </button>
        )}
      </div>

      {!items.length ? (
        loadingItems ? (
          <Card padding><p className="text-center text-sm text-gray-400">{strings.loadingLabel}</p></Card>
        ) : (
          <Card padding className="py-10 text-center">
            <FiMessageSquare size={26} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{tab === 'sent' ? strings.noSentYet : strings.noReceivedYet}</p>
          </Card>
        )
      ) : !visible.length ? (
        <Card padding className="py-8 text-center">
          <p className="text-sm text-gray-400">{strings.noResultsLabel}</p>
        </Card>
      ) : (
        <Card padding={false} className="divide-y divide-gray-100 overflow-hidden dark:divide-white/10">
          {visible.map((b) => (
            <BroadcastRow
              key={b.id}
              broadcast={b}
              side={tab}
              currentUserId={currentUserId}
              strings={strings}
              canManage={tab === 'sent' && (canManageBroadcast?.(b) ?? false)}
              onOpen={() => onOpen(b.id)}
              onDeleteClick={() => setDeletingId(b.id)}
            />
          ))}
        </Card>
      )}

      <ConfirmDialog
        open={!!deletingId}
        icon={FiTrash2}
        title={strings.deleteConfirmTitle}
        message={strings.deleteConfirmBody(deletingBroadcast?.title ?? '')}
        confirmLabel={strings.deleteLabel}
        confirmDisabled={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
