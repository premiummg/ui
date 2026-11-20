import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
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
import type { BroadcastInboxProps, BroadcastInboxStrings, BroadcastPage, BroadcastSide, BroadcastStatus } from './types';
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
          {...(unread ? { role: 'img', 'aria-label': strings.unreadMarkLabel ?? 'Unread', title: strings.unreadMarkLabel ?? 'Unread' } : { 'aria-hidden': true })}
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
type InboxView = BroadcastSide | 'unread' | 'feedback' | 'divisionSent';
// The tab the inbox was last on, kept outside the component because the component is unmounted while a
// conversation is open. It belongs to the person: somebody else signing in on the same screen starts on the default.
let lastInbox: { user: string | undefined; view: InboxView } | null = null;
// For tests: start the next inbox on its default tab.
export function forgetInboxView(): void {
  lastInbox = null;
}

// A fetcher answers a plain array (a list with nothing more) or a page with its total.
const asPage = (r: ChatBroadcast[] | BroadcastPage): BroadcastPage => (Array.isArray(r) ? { items: r } : r);

// Whether a page has older conversations after it: what the app says, or else what the total says of the ones loaded.
const morePages = (page: BroadcastPage, loaded: number): boolean => page.more ?? (page.total !== undefined && loaded < page.total);

// The newest page of a list replaces the start of what is on screen; the older ones that were loaded after it stay.
// A newest page that came back empty only empties the list when there is nothing after it either: an app that took
// every conversation of that page out (its own ones, say) still has older ones, and those already loaded stay.
function withFirstPage(prev: ChatBroadcast[], first: ChatBroadcast[], page?: BroadcastPage): ChatBroadcast[] {
  if (!first.length) return page && morePages(page, 0) ? prev : [];
  const oldest = new Date(first[first.length - 1].createdAt).getTime();
  const firstIds = new Set(first.map((b) => b.id));
  return [...first, ...prev.filter((b) => !firstIds.has(b.id) && new Date(b.createdAt).getTime() <= oldest)];
}

const BADGE_CAP = 99;
const defaultListCount = (n: number, total?: number) =>
  total !== undefined && total > n ? `${n} of ${total} conversations` : `${n} ${n === 1 ? 'conversation' : 'conversations'}`;
const capBadge = (n: number) => (n > BADGE_CAP ? `${BADGE_CAP}+` : String(n));

// Each person gets an inbox of their own: when the person signed in changes while the inbox stays on screen (a sign out
// and sign in, another tab), it starts empty instead of keeping the lists, cursors and older pages of the one before.
export function BroadcastInbox(props: BroadcastInboxProps) {
  return <InboxOfOnePerson key={props.currentUserId ?? ''} {...props} />;
}

function InboxOfOnePerson({
  fetchSent,
  fetchReceived,
  fetchDivisionSent,
  fetchFeedback,
  onDelete,
  currentUserId,
  canSendMessages,
  canManageBroadcast,
  onOpen,
  onCompose,
  showFeedback = false,
  strings,
  dateLocale,
  pollIntervalMs = 15_000,
  pausePolling,
}: BroadcastInboxProps) {
  const canReadSent = canSendMessages && !!fetchSent;
  const canReadDivisionSent = !!fetchDivisionSent;
  // Sent, Received, Other sent, or every conversation with something new from Sent/Received. Opening a conversation
  // takes the inbox off the screen, so the tab it was on is remembered for when the person comes back to the list.
  const [view, setViewState] = useState<InboxView>(() => {
    const back = lastInbox && lastInbox.user === currentUserId ? lastInbox.view : null;
    const available = back === 'sent' ? canReadSent : back === 'feedback' ? showFeedback : back === 'divisionSent' ? canReadDivisionSent : !!back;
    return back && available ? back : canReadSent ? 'sent' : 'received';
  });
  const setView = (next: InboxView) => {
    lastInbox = { user: currentUserId, view: next };
    setViewState(next);
  };
  // The role or the features can arrive after the first render: a tab that is not there (any more) is not stayed on.
  useEffect(() => {
    const available = view === 'sent' ? canReadSent : view === 'feedback' ? showFeedback : view === 'divisionSent' ? canReadDivisionSent : true;
    if (!available) setViewState(canReadSent ? 'sent' : 'received');
  }, [view, canReadSent, showFeedback, canReadDivisionSent]);
  // The latest fetchers, so a new function (another person, a closure over a filter) is used by the next poll
  // without tearing the timer down.
  const fetchers = useRef({ fetchSent, fetchReceived, fetchDivisionSent, fetchFeedback });
  fetchers.current = { fetchSent, fetchReceived, fetchDivisionSent, fetchFeedback };
  const ownFeedbackList = showFeedback && !!fetchFeedback;
  const [feedbackList, setFeedbackList] = useState<ChatBroadcast[]>([]);
  const [sent, setSent] = useState<ChatBroadcast[]>([]);
  const [received, setReceived] = useState<ChatBroadcast[]>([]);
  const [divisionSent, setDivisionSent] = useState<ChatBroadcast[]>([]);
  // How many there are in all in each list, when the app says (the page loaded is not always all of it).
  const [sentTotal, setSentTotal] = useState<number | undefined>(undefined);
  const [receivedTotal, setReceivedTotal] = useState<number | undefined>(undefined);
  const [divisionSentTotal, setDivisionSentTotal] = useState<number | undefined>(undefined);
  // Whether each list has older conversations to load, and whether one was loaded already: from then on the check of
  // the newest page no longer says whether there are more, only the last page asked for does.
  const [more, setMore] = useState<Record<'sent' | 'received' | 'divisionSent' | 'feedback', boolean>>({ sent: false, received: false, divisionSent: false, feedback: false });
  const olderLoaded = useRef<Record<'sent' | 'received' | 'divisionSent' | 'feedback', boolean>>({ sent: false, received: false, divisionSent: false, feedback: false });
  // The cursor the app gave with the last page of each list (BroadcastPage.nextCursor), when it gives one.
  const nextCursors = useRef<Record<'sent' | 'received' | 'divisionSent' | 'feedback', string | undefined>>({ sent: undefined, received: undefined, divisionSent: undefined, feedback: undefined });
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSent, setLoadingSent] = useState(canReadSent);
  const [loadingDivisionSent, setLoadingDivisionSent] = useState(canReadDivisionSent);
  const pausePollingRef = useRef(pausePolling);
  pausePollingRef.current = pausePolling;
  const [loadingReceived, setLoadingReceived] = useState(true);
  // The feedback tab of its own list: until its first page arrives it says "loading", not "no feedback yet".
  const [loadingFeedback, setLoadingFeedback] = useState(showFeedback && !!fetchFeedback);
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
    // Only the latest request of each list may write to the screen, and none after this effect is
    // torn down (unmounted, or fetchers swapped): an older, slower answer would otherwise bring back
    // rows that a newer one (or a delete) had already removed.
    let live = true;
    let sentSeq = 0;
    let receivedSeq = 0;
    let divisionSentSeq = 0;
    const loadSent = () => {
      const seq = ++sentSeq;
      return fetchers.current.fetchSent!().then((r) => {
        if (!live || seq !== sentSeq) return;
        const page = asPage(r);
        setSent((prev) => withFirstPage(prev, page.items, page));
        setSentTotal(page.total);
        if (!olderLoaded.current.sent) { setMore((m) => ({ ...m, sent: morePages(page, page.items.length) })); nextCursors.current.sent = page.nextCursor; }
      }).catch(() => {});
    };
    const loadReceived = () => {
      const seq = ++receivedSeq;
      return fetchers.current.fetchReceived().then((r) => {
        if (!live || seq !== receivedSeq) return;
        const page = asPage(r);
        setReceived((prev) => withFirstPage(prev, page.items, page));
        setReceivedTotal(page.total);
        if (!olderLoaded.current.received) { setMore((m) => ({ ...m, received: morePages(page, page.items.length) })); nextCursors.current.received = page.nextCursor; }
      }).catch(() => {});
    };
    const loadDivisionSent = () => {
      const seq = ++divisionSentSeq;
      return fetchers.current.fetchDivisionSent!().then((r) => {
        if (!live || seq !== divisionSentSeq) return;
        const page = asPage(r);
        setDivisionSent((prev) => withFirstPage(prev, page.items, page));
        setDivisionSentTotal(page.total);
        if (!olderLoaded.current.divisionSent) { setMore((m) => ({ ...m, divisionSent: morePages(page, page.items.length) })); nextCursors.current.divisionSent = page.nextCursor; }
      }).catch(() => {});
    };
    let feedbackSeq = 0;
    const loadFeedback = () => {
      const seq = ++feedbackSeq;
      return fetchers.current.fetchFeedback!().then((r) => {
        if (!live || seq !== feedbackSeq) return;
        const page = asPage(r);
        setFeedbackList((prev) => withFirstPage(prev, page.items, page));
        if (!olderLoaded.current.feedback) { setMore((m) => ({ ...m, feedback: morePages(page, page.items.length) })); nextCursors.current.feedback = page.nextCursor; }
      }).catch(() => {});
    };
    // Coming back to the tab fires visibilitychange and focus together: one refresh, not two.
    let lastRun = 0;
    function refresh() {
      if (document.visibilityState === 'hidden' || pausePollingRef.current?.()) return;
      if (Date.now() - lastRun < 10_000) return;
      lastRun = Date.now();
      if (canReadSent) loadSent();
      if (canReadDivisionSent) loadDivisionSent();
      if (ownFeedbackList) loadFeedback();
      loadReceived();
    }
    if (ownFeedbackList) loadFeedback().finally(() => { if (live) setLoadingFeedback(false); });
    if (canReadSent) loadSent().finally(() => { if (live) setLoadingSent(false); });
    if (canReadDivisionSent) loadDivisionSent().finally(() => { if (live) setLoadingDivisionSent(false); });
    loadReceived().finally(() => { if (live) setLoadingReceived(false); });
    // The timer is the regular pace (hidden tabs are skipped inside refresh), so it is never held back by the gap.
    const interval = setInterval(() => { lastRun = 0; refresh(); }, pollIntervalMs);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      live = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canReadSent, canReadDivisionSent, ownFeedbackList, pollIntervalMs, currentUserId]);

  // The older ones of a list: what comes after the last conversation on screen, which its cursor says.
  type ListName = 'sent' | 'received' | 'divisionSent' | 'feedback';
  const listsOfView: ListName[] =
    view === 'sent' ? ['sent'] : view === 'received' ? ['received'] : view === 'divisionSent' ? ['divisionSent']
      : view === 'feedback' && ownFeedbackList ? ['feedback']
        // The unread view shows the feedback of its own list too, so it pages it as well.
        : [...(canReadSent ? ['sent' as const] : []), 'received' as const, ...(view === 'unread' && ownFeedbackList ? ['feedback' as const] : [])];
  const itemsOf = (list: ListName) => (list === 'sent' ? sent : list === 'received' ? received : list === 'feedback' ? feedbackList : divisionSent);
  // Where the server stopped, when the app said (BroadcastPage.nextCursor); else the last conversation on screen.
  const cursorOf = (list: ListName) => nextCursors.current[list] ?? itemsOf(list)[itemsOf(list).length - 1]?.cursor;
  const moreOf = (list: ListName) => more[list] && !!cursorOf(list);
  const moreAvailable = listsOfView.some(moreOf);
  async function loadMore() {
    setLoadingMore(true);
    try {
      await Promise.all(listsOfView.filter(moreOf).map(async (list) => {
        const items = itemsOf(list);
        const fetcher = list === 'sent' ? fetchers.current.fetchSent : list === 'received' ? fetchers.current.fetchReceived : list === 'feedback' ? fetchers.current.fetchFeedback : fetchers.current.fetchDivisionSent;
        const page = asPage(await fetcher!(cursorOf(list)));
        olderLoaded.current[list] = true;
        nextCursors.current[list] = page.nextCursor;
        setMore((m) => ({ ...m, [list]: morePages(page, items.length + page.items.length) }));
        const append = (prev: ChatBroadcast[]) => {
          const have = new Set(prev.map((b) => b.id));
          return [...prev, ...page.items.filter((b) => !have.has(b.id))];
        };
        if (list === 'sent') { setSent(append); if (page.total !== undefined) setSentTotal(page.total); }
        else if (list === 'received') { setReceived(append); if (page.total !== undefined) setReceivedTotal(page.total); }
        else if (list === 'feedback') setFeedbackList(append);
        else { setDivisionSent(append); if (page.total !== undefined) setDivisionSentTotal(page.total); }
      }));
    } catch { /* the button stays, and a later try asks again */ }
    finally { setLoadingMore(false); }
  }

  // With a Feedback tab, feedback lives there and not in Sent or Received.
  const inSentReceived = (b: ChatBroadcast) => !(showFeedback && b.isFeedback);
  // The Feedback tab counts what is still unread, so the number goes down as feedback is opened.
  const feedbackUnreadCount = new Set([...feedbackList, ...received, ...sent].filter((b) => b.isFeedback && b.unread).map((b) => b.id)).size;

  // Each row carries the side it belongs to: the status and the people shown
  // depend on it, and the unread view mixes both.
  const rows = useMemo<{ b: ChatBroadcast; side: BroadcastSide }[]>(() => {
    if (view === 'feedback') {
      const seenFeedback = new Set<string>();
      return [...feedbackList, ...received, ...sent]
        .filter((b) => b.isFeedback && !seenFeedback.has(b.id) && !!seenFeedback.add(b.id))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((b) => ({ b, side: 'received' as const }));
    }
    if (view === 'sent') return sent.filter(inSentReceived).map((b) => ({ b, side: 'sent' as const }));
    if (view === 'received') return received.filter(inSentReceived).map((b) => ({ b, side: 'received' as const }));
    // Tagged as the 'sent' side, not a new side of its own: a division-mate's broadcast reads exactly like a
    // sent one (recipients, waiting/answered status) - just not written by the caller, same as BroadcastRow's
    // own mine check already handles for an admin-all viewing their own Sent tab.
    if (view === 'divisionSent') return divisionSent.filter(inSentReceived).map((b) => ({ b, side: 'sent' as const }));
    const unreadSent = sent.filter((b) => b.unread);
    const seen = new Set(unreadSent.map((b) => b.id));
    return [
      ...unreadSent.map((b) => ({ b, side: 'sent' as const })),
      ...[...received, ...(ownFeedbackList ? feedbackList : [])]
        .filter((b, i, all) => b.unread && !seen.has(b.id) && all.findIndex((x) => x.id === b.id) === i)
        .map((b) => ({ b, side: 'received' as const })),
    ];
  }, [view, sent, received, divisionSent, feedbackList, showFeedback, ownFeedbackList]);
  const loadingItems =
    (view !== 'received' && view !== 'divisionSent' && canReadSent && loadingSent)
    || (view !== 'sent' && view !== 'divisionSent' && loadingReceived)
    || (view === 'divisionSent' && canReadDivisionSent && loadingDivisionSent)
    || ((view === 'feedback' || view === 'unread') && ownFeedbackList && loadingFeedback);

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
  // The total of the open list, said only when it is the list as it is: a search or a status narrows it, and a
  // Feedback tab takes feedback out of Sent and Received, so then it would not be the number on screen.
  const listTotal = filtersActive || (showFeedback && view !== 'divisionSent') ? undefined
    : view === 'sent' ? sentTotal : view === 'received' ? receivedTotal : view === 'divisionSent' ? divisionSentTotal : undefined;
  const unreadCount = new Set([...(canReadSent ? sent : []), ...received, ...(ownFeedbackList ? feedbackList : [])].filter((b) => b.unread).map((b) => b.id)).size;
  // What a tab says about itself is only what is NEW in it (nothing when nothing is), capped at 99+: the row is a
  // prompt to go and read, not an inventory. Sent has no "new" of its own, so it never carries a number. How many
  // conversations a tab holds is said inside it, over its list.
  const tabLabel = (label: string, unread?: number) => (unread ? `${label} ${capBadge(unread)}` : label);
  // Unread is app-worded ("Unread (3)", "Non lus (3)"): past the cap it is worded with the cap and gets the +.
  const unreadTabLabel = unreadCount > BADGE_CAP
    ? (() => { const l = strings.unreadOnlyLabel(BADGE_CAP); const at = l.lastIndexOf(String(BADGE_CAP)); return at < 0 ? l : `${l.slice(0, at + 2)}+${l.slice(at + 2)}`; })()
    : strings.unreadOnlyLabel(unreadCount);
  const deletingBroadcast = [...sent, ...received, ...divisionSent, ...feedbackList].find((b) => b.id === deletingId);

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
      setReceived((prev) => prev.filter((b) => b.id !== deletingId));
      setFeedbackList((prev) => prev.filter((b) => b.id !== deletingId));
      setDivisionSent((prev) => prev.filter((b) => b.id !== deletingId));
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
            ...(canReadSent ? [{ value: 'sent' as const, label: strings.sentTabLabel }] : []),
            { value: 'received' as const, label: tabLabel(strings.receivedTabLabel, received.filter((b) => inSentReceived(b) && b.unread).length) },
            { value: 'unread' as const, label: unreadTabLabel },
            ...(showFeedback ? [{ value: 'feedback' as const, label: tabLabel(strings.feedbackTabLabel ?? 'Feedback', feedbackUnreadCount) }] : []),
            ...(canReadDivisionSent ? [{ value: 'divisionSent' as const, label: tabLabel(strings.otherSentTabLabel ?? 'Other sent', divisionSent.filter((b) => inSentReceived(b) && b.unread).length) }] : []),
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
            <p className="text-sm text-gray-500 dark:text-gray-400">{view === 'sent' ? strings.noSentYet : view === 'received' ? strings.noReceivedYet : view === 'feedback' ? strings.noFeedbackYet ?? strings.noResultsLabel : view === 'divisionSent' ? strings.noOtherSentYet ?? strings.noResultsLabel : strings.noResultsLabel}</p>
          </Card>
        )
      ) : !visible.length ? (
        <Card padding className="py-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">{strings.noResultsLabel}</p>
        </Card>
      ) : (
        <>
        <p className="px-1 text-xs text-gray-500 dark:text-gray-400">
          {(strings.listCountLabel ?? defaultListCount)(visible.length, listTotal)}
        </p>
        <Card padding={false} className="divide-y divide-gray-100 overflow-hidden dark:divide-white/10">
          {visible.map(({ b, side }) => (
            <BroadcastRow
              key={b.id}
              broadcast={b}
              side={side}
              currentUserId={currentUserId}
              strings={strings}
              // Feedback is managed by whoever reads it, even though it sits on the received side.
              canManage={(side === 'sent' || !!b.isFeedback) && (canManageBroadcast?.(b) ?? false)}
              onOpen={() => onOpen(b.id)}
              onDeleteClick={() => setDeletingId(b.id)}
            />
          ))}
        </Card>
        {moreAvailable && (
          <div className="flex justify-center pt-1">
            <Button size="sm" variant="secondary" onClick={loadMore} disabled={loadingMore}>
              {strings.loadMoreLabel ?? 'Load more'}
            </Button>
          </div>
        )}
        </>
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
