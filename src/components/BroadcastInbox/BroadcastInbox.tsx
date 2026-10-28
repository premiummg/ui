import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { FiPlus, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import type { ChatBroadcast } from '../ConversationThread/types';
import { Button } from '../Button';
import { Card } from '../Card';
import { ConfirmDialog } from '../ConfirmDialog';
import { DatePicker } from '../DatePicker';
import { FilterLabel } from '../FilterLabel';
import { IconButton } from '../IconButton';
import { SegmentedControl } from '../SegmentedControl';
import { TextButton } from '../TextButton';
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
    <div className={`flex min-w-0 flex-col ${className}`}>
      <FilterLabel text={label} htmlFor={id} />
      {children}
    </div>
  );
}

// The shared .input-field already carries the 16px size iOS Safari needs (it
// auto-zooms on focus for text entry under 16px) and its own dark styling.
const CONTROL = 'input-field';

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
          <span className={`block truncate text-sm text-gray-900 dark:text-gray-100 ${unread ? 'font-semibold' : 'font-medium'}`}>{broadcast.title}</span>
          <span className="block truncate text-xs text-gray-400">{subline}</span>
        </span>
      </button>
      <span className="hidden shrink-0 text-xs text-gray-500 dark:text-gray-400 sm:block">{formatShortDate(broadcast.createdAt)}</span>
      <StatusPill broadcast={broadcast} side={side} currentUserId={currentUserId} strings={strings} />
      {canManage && (
        <IconButton tone="danger" aria-label={strings.deleteConversation} onClick={onDeleteClick} className="shrink-0">
          <FiTrash2 size={14} />
        </IconButton>
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
  dateLocale,
  pollIntervalMs = 15_000,
}: BroadcastInboxProps) {
  const canReadSent = canSendMessages && !!fetchSent;
  // Sent, Received, or every conversation with something new from both.
  const [view, setView] = useState<BroadcastSide | 'unread'>(canReadSent ? 'sent' : 'received');
  const [sent, setSent] = useState<ChatBroadcast[]>([]);
  const [received, setReceived] = useState<ChatBroadcast[]>([]);
  const [loadingSent, setLoadingSent] = useState(canReadSent);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const ids = {
    search: useId(),
    status: useId(),
    from: useId(),
    to: useId(),
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

  // Each row carries the side it belongs to: the status and the people shown
  // depend on it, and the unread view mixes both.
  const rows = useMemo<{ b: ChatBroadcast; side: BroadcastSide }[]>(() => {
    if (view === 'sent') return sent.map((b) => ({ b, side: 'sent' as const }));
    if (view === 'received') return received.map((b) => ({ b, side: 'received' as const }));
    const unreadSent = sent.filter((b) => b.unread);
    const seen = new Set(unreadSent.map((b) => b.id));
    return [
      ...unreadSent.map((b) => ({ b, side: 'sent' as const })),
      ...received.filter((b) => b.unread && !seen.has(b.id)).map((b) => ({ b, side: 'received' as const })),
    ];
  }, [view, sent, received]);
  const loadingItems = (view !== 'received' && canReadSent && loadingSent) || (view !== 'sent' && loadingReceived);

  const filtersActive = !!query.trim() || status !== 'all' || !!from || !!to;

  function matchesFilters({ b, side }: { b: ChatBroadcast; side: BroadcastSide }): boolean {
    if (status !== 'all' && broadcastStatus(b, side, currentUserId) !== status) return false;
    const day = localDay(b.createdAt);
    if (from && day < from) return false;
    if (to && day > to) return false;
    const q = query.trim().toLowerCase();
    if (q) {
      const haystack = [b.title, ...peopleOf(b, side).map((p) => p.name)].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  }

  const visible = rows.filter(matchesFilters);
  const unreadCount = new Set([...(canReadSent ? sent : []), ...received].filter((b) => b.unread).map((b) => b.id)).size;
  const deletingBroadcast = sent.find((b) => b.id === deletingId);

  function clearFilters() {
    setQuery('');
    setStatus('all');
    setFrom('');
    setTo('');
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
        <SegmentedControl
          options={[
            ...(canReadSent ? [{ value: 'sent' as const, label: `${strings.sentTabLabel} ${sent.length}` }] : []),
            { value: 'received' as const, label: `${strings.receivedTabLabel} ${received.length}` },
            { value: 'unread' as const, label: strings.unreadOnlyLabel(unreadCount) },
          ]}
          value={view}
          onChange={setView}
        />
        <div className="flex items-center gap-2">
          {onCompose && (
            <Button size="sm" onClick={onCompose}>
              <FiPlus size={14} /> {strings.newMessageLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-white/10 dark:bg-black/40">
        <Field id={ids.search} label={strings.searchLabel} className="min-w-[200px] flex-[2]">
          <div className="relative">
            <FiSearch size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              id={ids.search}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={strings.searchPlaceholder}
              className={`${CONTROL} pl-8`}
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
          <DatePicker
            id={ids.from}
            value={from}
            onChange={setFrom}
            placeholder={strings.dateFromLabel}
            locale={dateLocale}
            clearLabel={strings.dateClearLabel}
            todayLabel={strings.dateTodayLabel}
            className="[&>button]:py-3"
          />
        </Field>
        <Field id={ids.to} label={strings.dateToLabel} className="min-w-[140px]">
          <DatePicker
            id={ids.to}
            value={to}
            onChange={setTo}
            placeholder={strings.dateToLabel}
            locale={dateLocale}
            clearLabel={strings.dateClearLabel}
            todayLabel={strings.dateTodayLabel}
            className="[&>button]:py-3"
          />
        </Field>
        {filtersActive && (
          <TextButton onClick={clearFilters} className="pb-3">
            <FiX size={12} /> {strings.clearFiltersLabel}
          </TextButton>
        )}
      </div>

      {!rows.length ? (
        loadingItems ? (
          <Card padding><p className="text-center text-sm text-gray-500 dark:text-gray-400">{strings.loadingLabel}</p></Card>
        ) : (
          <Card padding className="py-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{view === 'sent' ? strings.noSentYet : view === 'received' ? strings.noReceivedYet : strings.noResultsLabel}</p>
          </Card>
        )
      ) : !visible.length ? (
        <Card padding className="py-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">{strings.noResultsLabel}</p>
        </Card>
      ) : (
        <Card padding={false} className="divide-y divide-gray-100 overflow-hidden dark:divide-white/10">
          {visible.map(({ b, side }) => (
            <BroadcastRow
              key={b.id}
              broadcast={b}
              side={side}
              currentUserId={currentUserId}
              strings={strings}
              canManage={side === 'sent' && (canManageBroadcast?.(b) ?? false)}
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
