import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiClock, FiExternalLink, FiMessageSquare, FiPlus, FiSlash, FiTrash2 } from 'react-icons/fi';
import { ConversationThread } from '../ConversationThread/ConversationThread';
import type { ConversationThreadStrings } from '../ConversationThread/ConversationThread';
import type { ChatBroadcast, ChatMessage, ChatThread } from '../ConversationThread/types';
import { Avatar } from '../ConversationThread/avatar';
import { Card } from '../Card';
import { ConfirmDialog } from '../ConfirmDialog';

export interface BroadcastInboxStrings extends ConversationThreadStrings {
  sentTabLabel: string;
  receivedTabLabel: string;
  newMessageLabel: string;
  unreadOnlyLabel: (count: number) => string;
  noSentYet: string;
  noReceivedYet: string;
  nothingUnread: string;
  sentByYou: string;
  sentBy: (name: string) => string;
  sentBySomeoneElse: string;
  notOpened: string;
  readNoReply: string;
  replied: string;
  repliedOn: (date: string) => string;
  allAnswered: string;
  waitingOn: (count: number) => string;
  needsReplyCount: (count: number) => string;
  closedLabel: string;
  withdrawnLabel: string;
  waitingOnYou: string;
  answeredLabel: string;
  deleteConversation: string;
  deleteConfirmTitle: string;
  deleteConfirmBody: (title: string) => string;
  deleteLabel: string;
  cancelLabel: string;
  closeConversationLabel: string;
  stopAskingLabel: string;
  everyoneAnswered: string;
  onePersonWaiting: string;
  peopleWaiting: (count: number) => string;
  loadingLabel: string;
}

export interface BroadcastInboxProps {
  // Omit entirely when canSendMessages is false - the Sent tab never renders.
  fetchSent?: () => Promise<ChatBroadcast[]>;
  fetchReceived: () => Promise<ChatBroadcast[]>;
  // participantId is null for "my own" thread (the Received side, or a
  // broadcast's implicit thread before any recipient-specific reply exists).
  onSendToThread: (broadcastId: string, participantId: string | null, body: string) => Promise<ChatMessage>;
  onMarkThreadRead: (broadcastId: string, participantId: string | null) => Promise<void>;
  onClose: (broadcastId: string) => Promise<void>;
  onDelete: (broadcastId: string) => Promise<void>;
  currentUserId: string;
  canSendMessages: boolean;
  // Gates the delete/close controls on a specific broadcast (e.g. a foreman
  // may only manage their own; an admin-all may manage every division's).
  // Omitting it means nobody sees those controls.
  canManageBroadcast?: (broadcast: ChatBroadcast) => boolean;
  onAuthorClick?: (authorId: string) => void;
  onCompose?: () => void;
  strings: BroadcastInboxStrings;
  pollIntervalMs?: number;
  // Opens and scroll-highlights one specific broadcast on mount - for a
  // navbar dropdown's "jump to this conversation" link.
  deepLinkId?: string;
}

function threadState(thread: ChatThread): 'replied' | 'read' | 'unopened' {
  if (thread.respondedAt || thread.messages.some((m) => m.authorId === thread.participant.id)) return 'replied';
  return thread.openedAt ? 'read' : 'unopened';
}

function needsSenderReply(thread: ChatThread): boolean {
  const last = thread.messages[thread.messages.length - 1];
  return !!last && last.authorId === thread.participant.id;
}

function isAwaitingViewerReply(thread: ChatThread, viewerId: string): boolean {
  if (!thread.messages.length) return !thread.respondedAt;
  return thread.messages[thread.messages.length - 1].authorId !== viewerId;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function Pill({ tone, icon, children }: { tone: 'amber' | 'green' | 'gray'; icon: React.ReactNode; children: React.ReactNode }) {
  const classes = {
    amber: 'bg-[#FAAD00]/15 text-[#7A5300] dark:text-[#FAAD00]',
    green: 'bg-green-500/15 text-green-700 dark:text-green-400',
    gray: 'bg-gray-400/15 text-gray-600 dark:text-gray-300',
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${classes}`}>
      {icon}
      {children}
    </span>
  );
}

// The broadcast's own root message, rendered once per open card - separate
// from ConversationThread's own MessageBubble since it isn't a reply turn in
// any one thread, it's the thing every thread is replying to. Styled by
// actual authorship, not by which tab it's showing in: a division-wide Sent
// list can show someone ELSE's broadcast to an admin who didn't write it.
function RootMessageBubble({
  broadcast,
  mine,
  onAuthorClick,
}: {
  broadcast: ChatBroadcast;
  mine: boolean;
  onAuthorClick?: (authorId: string) => void;
}) {
  if (mine) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2.5" style={{ backgroundColor: 'var(--premium-red)' }}>
          <p className="whitespace-pre-wrap text-sm text-white">{broadcast.body}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <Avatar name={broadcast.senderName} onClick={onAuthorClick ? () => onAuthorClick(broadcast.createdBy) : undefined} />
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-3.5 py-2.5 dark:border-white/20 dark:bg-(--premium-steel-grey)">
        <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">{broadcast.body}</p>
      </div>
    </div>
  );
}

function ContextLink({ broadcast }: { broadcast: ChatBroadcast }) {
  if (!broadcast.contextLink) return null;
  return (
    <button
      type="button"
      onClick={broadcast.contextLink.onClick}
      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-(--premium-red) dark:text-gray-400"
    >
      <FiExternalLink size={11} /> {broadcast.contextLink.label}
    </button>
  );
}

function ThreadRow({
  thread,
  broadcastId,
  canReply,
  closed,
  currentUserId,
  strings,
  pollIntervalMs,
  onAuthorClick,
  onSendToThread,
  onMarkThreadRead,
}: {
  thread: ChatThread;
  broadcastId: string;
  canReply: boolean;
  closed: boolean;
  currentUserId: string;
  strings: BroadcastInboxStrings;
  pollIntervalMs?: number;
  onAuthorClick?: (authorId: string) => void;
  onSendToThread: BroadcastInboxProps['onSendToThread'];
  onMarkThreadRead: BroadcastInboxProps['onMarkThreadRead'];
}) {
  const state = threadState(thread);
  return (
    <div className="flex items-start gap-2">
      <Avatar name={thread.participant.name} onClick={onAuthorClick ? () => onAuthorClick(thread.participant.id) : undefined} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onAuthorClick?.(thread.participant.id)}
            className="truncate text-xs font-medium text-gray-600 transition hover:text-(--premium-red) hover:underline dark:text-gray-300"
          >
            {thread.participant.name}
          </button>
          {state === 'unopened' ? (
            <Pill tone="amber" icon={<FiClock size={11} />}>{strings.notOpened}</Pill>
          ) : state === 'read' ? (
            <Pill tone="gray" icon={<FiCheck size={11} />}>{strings.readNoReply}</Pill>
          ) : (
            <Pill tone="green" icon={<FiCheck size={11} />}>{strings.replied}</Pill>
          )}
          {thread.respondedAt && <span className="ml-auto shrink-0 text-[11px] text-gray-400">{strings.repliedOn(formatDate(thread.respondedAt))}</span>}
        </div>
        <ConversationThread
          fetchFn={async () => thread.messages}
          onSend={(body) => onSendToThread(broadcastId, thread.participant.id, body)}
          onMarkRead={() => onMarkThreadRead(broadcastId, thread.participant.id)}
          currentUserId={currentUserId}
          strings={strings}
          pollIntervalMs={pollIntervalMs}
          disabled={closed || !canReply}
          onAuthorClick={onAuthorClick}
        />
      </div>
    </div>
  );
}

function SentCard({
  broadcast,
  currentUserId,
  canManage,
  strings,
  pollIntervalMs,
  open,
  onToggle,
  onAuthorClick,
  onSendToThread,
  onMarkThreadRead,
  onCloseClick,
  onDeleteClick,
  highlighted,
}: {
  broadcast: ChatBroadcast;
  currentUserId: string;
  canManage: boolean;
  strings: BroadcastInboxStrings;
  pollIntervalMs?: number;
  open: boolean;
  onToggle: () => void;
  onAuthorClick?: (authorId: string) => void;
  onSendToThread: BroadcastInboxProps['onSendToThread'];
  onMarkThreadRead: BroadcastInboxProps['onMarkThreadRead'];
  onCloseClick: () => void;
  onDeleteClick: () => void;
  highlighted: boolean;
}) {
  const pending = broadcast.threads.length - broadcast.threads.filter((t) => t.respondedAt).length;
  const needsReply = broadcast.threads.filter(needsSenderReply).length;
  const fullyAnswered = broadcast.threads.length > 0 && pending === 0;
  const mine = broadcast.createdBy === currentUserId;

  return (
    <Card padding={false} className={`overflow-hidden ${highlighted ? 'ring-2 ring-(--premium-red)' : ''}`}>
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{broadcast.title}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              <span>{mine ? strings.sentByYou : strings.sentBy(broadcast.senderName ?? strings.sentBySomeoneElse)}</span>
              {' · '}{formatDate(broadcast.createdAt)}
            </p>
          </button>
          <div className="flex shrink-0 items-center gap-1.5">
            {broadcast.closedAt ? (
              fullyAnswered ? (
                <Pill tone="gray" icon={<FiCheck size={11} />}>{strings.closedLabel}</Pill>
              ) : (
                <Pill tone="gray" icon={<FiSlash size={11} />}>{strings.withdrawnLabel}</Pill>
              )
            ) : needsReply > 0 ? (
              <Pill tone="amber" icon={<FiClock size={11} />}>{strings.needsReplyCount(needsReply)}</Pill>
            ) : pending > 0 ? (
              <Pill tone="amber" icon={<FiClock size={11} />}>{strings.waitingOn(pending)}</Pill>
            ) : (
              <Pill tone="green" icon={<FiCheck size={11} />}>{strings.allAnswered}</Pill>
            )}
            {canManage && (
              <button
                type="button"
                onClick={onDeleteClick}
                title={strings.deleteConversation}
                className="rounded-lg p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-600 dark:text-gray-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <FiTrash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <>
          <div className="space-y-5 border-t border-gray-100 bg-gray-50/50 px-4 py-4 dark:border-white/10 dark:bg-black/20">
            <div>
              <RootMessageBubble broadcast={broadcast} mine={mine} onAuthorClick={onAuthorClick} />
              <ContextLink broadcast={broadcast} />
            </div>
            <div className="space-y-4">
              {broadcast.threads.map((t) => (
                <ThreadRow
                  key={t.participant.id}
                  thread={t}
                  broadcastId={broadcast.id}
                  canReply={canManage}
                  closed={!!broadcast.closedAt}
                  currentUserId={currentUserId}
                  strings={strings}
                  pollIntervalMs={pollIntervalMs}
                  onAuthorClick={onAuthorClick}
                  onSendToThread={onSendToThread}
                  onMarkThreadRead={onMarkThreadRead}
                />
              ))}
            </div>
          </div>
          {!broadcast.closedAt && canManage && (
            <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-2.5 dark:border-white/10">
              <p className="text-xs text-gray-400">
                {pending === 0 ? strings.everyoneAnswered : pending === 1 ? strings.onePersonWaiting : strings.peopleWaiting(pending)}
              </p>
              <button type="button" onClick={onCloseClick} className="text-xs font-semibold text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                {pending > 0 ? strings.stopAskingLabel : strings.closeConversationLabel}
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function ReceivedCard({
  broadcast,
  currentUserId,
  strings,
  pollIntervalMs,
  open,
  onToggle,
  onAuthorClick,
  onSendToThread,
  onMarkThreadRead,
  highlighted,
}: {
  broadcast: ChatBroadcast;
  currentUserId: string;
  strings: BroadcastInboxStrings;
  pollIntervalMs?: number;
  open: boolean;
  onToggle: () => void;
  onAuthorClick?: (authorId: string) => void;
  onSendToThread: BroadcastInboxProps['onSendToThread'];
  onMarkThreadRead: BroadcastInboxProps['onMarkThreadRead'];
  highlighted: boolean;
}) {
  const thread = broadcast.threads[0];
  return (
    <Card padding={false} className={`overflow-hidden ${highlighted ? 'ring-2 ring-(--premium-red)' : ''}`}>
      {/* A div, not a button - the sender name below has to be its own real
          button (nested <button>s are invalid HTML and React warns loudly
          about it), so this toggle area is keyboard-activatable by hand
          instead. */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        className="w-full cursor-pointer px-4 py-3 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{broadcast.title}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAuthorClick?.(broadcast.createdBy); }}
                className="font-medium hover:text-(--premium-red) hover:underline"
              >
                {broadcast.senderName ?? strings.sentBySomeoneElse}
              </button>
              {' · '}{formatDate(broadcast.createdAt)}
            </p>
          </div>
          <div className="shrink-0">
            {broadcast.closedAt ? (
              thread?.respondedAt ? (
                <Pill tone="gray" icon={<FiCheck size={11} />}>{strings.closedLabel}</Pill>
              ) : (
                <Pill tone="gray" icon={<FiSlash size={11} />}>{strings.withdrawnLabel}</Pill>
              )
            ) : !thread?.respondedAt || isAwaitingViewerReply(thread, currentUserId) ? (
              <Pill tone="amber" icon={<FiClock size={11} />}>{strings.waitingOnYou}</Pill>
            ) : (
              <Pill tone="green" icon={<FiCheck size={11} />}>{strings.answeredLabel}</Pill>
            )}
          </div>
        </div>
      </div>

      {open && thread && (
        <div className="space-y-3 border-t border-gray-100 bg-gray-50/50 px-4 py-4 dark:border-white/10 dark:bg-black/20">
          <div>
            <RootMessageBubble broadcast={broadcast} mine={false} onAuthorClick={onAuthorClick} />
            <ContextLink broadcast={broadcast} />
          </div>
          <ConversationThread
            fetchFn={async () => thread.messages}
            onSend={(body) => onSendToThread(broadcast.id, null, body)}
            onMarkRead={() => onMarkThreadRead(broadcast.id, null)}
            currentUserId={currentUserId}
            strings={strings}
            pollIntervalMs={pollIntervalMs}
            disabled={!!broadcast.closedAt}
            onAuthorClick={onAuthorClick}
          />
        </div>
      )}
    </Card>
  );
}

// Today's exact Sent/Received pattern (one message broadcast to many
// recipients, each with their own reply thread), composed from
// ConversationThread. Self-fetches and polls both lists, same as
// ConversationThread does for one thread's messages.
export function BroadcastInbox({
  fetchSent,
  fetchReceived,
  onSendToThread,
  onMarkThreadRead,
  onClose,
  onDelete,
  currentUserId,
  canSendMessages,
  canManageBroadcast,
  onAuthorClick,
  onCompose,
  strings,
  pollIntervalMs = 15_000,
  deepLinkId,
}: BroadcastInboxProps) {
  const canReadSent = canSendMessages && !!fetchSent;
  const [tab, setTab] = useState<'sent' | 'received'>(canReadSent ? 'sent' : 'received');
  const [sent, setSent] = useState<ChatBroadcast[]>([]);
  const [received, setReceived] = useState<ChatBroadcast[]>([]);
  const [loadingSent, setLoadingSent] = useState(canReadSent);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [openSentId, setOpenSentId] = useState<string | null>(null);
  const [openReceivedId, setOpenReceivedId] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const didDeepLink = useRef(false);

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

  useEffect(() => {
    if (!deepLinkId || didDeepLink.current) return;
    const isSent = sent.some((b) => b.id === deepLinkId);
    const isReceived = !isSent && received.some((b) => b.id === deepLinkId);
    if (!isSent && !isReceived) return;
    didDeepLink.current = true;
    if (isSent) setOpenSentId(deepLinkId); else setOpenReceivedId(deepLinkId);
    setTab(isSent ? 'sent' : 'received');
    setHighlightId(deepLinkId);
    document.getElementById(`broadcast-${deepLinkId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = setTimeout(() => setHighlightId(null), 2500);
    return () => clearTimeout(timer);
  }, [deepLinkId, sent, received]);

  async function handleClose(id: string) {
    setClosingId(id);
    try {
      await onClose(id);
      setSent((prev) => prev.map((b) => (b.id === id ? { ...b, closedAt: new Date().toISOString() } : b)));
    } finally {
      setClosingId(null);
    }
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

  const sentUnread = sent.filter((b) => b.threads.some((t) => t.unread)).length;
  const receivedUnread = received.filter((b) => b.threads.some((t) => t.unread)).length;
  const visibleSent = unreadOnly ? sent.filter((b) => b.threads.some((t) => t.unread)) : sent;
  const visibleReceived = unreadOnly ? received.filter((b) => b.threads.some((t) => t.unread)) : received;
  const deletingBroadcast = sent.find((b) => b.id === deletingId);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {canReadSent ? (
            <>
              {([
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
              ))}
            </>
          ) : <div />}
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
        <button
          type="button"
          onClick={() => setUnreadOnly((v) => !v)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
            unreadOnly ? 'text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
          }`}
          style={unreadOnly ? { backgroundColor: 'var(--premium-red)' } : {}}
        >
          {strings.unreadOnlyLabel(canReadSent && tab === 'sent' ? sentUnread : receivedUnread)}
        </button>
      </div>

      {canReadSent && tab === 'sent' && (
        !sent.length ? (
          loadingSent ? (
            <Card padding><p className="text-center text-sm text-gray-400">{strings.loadingLabel}</p></Card>
          ) : (
            <Card padding className="py-10 text-center">
              <FiMessageSquare size={26} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">{strings.noSentYet}</p>
            </Card>
          )
        ) : !visibleSent.length ? (
          <Card padding><p className="py-6 text-center text-sm text-gray-400">{strings.nothingUnread}</p></Card>
        ) : (
          <div className="space-y-3">
            {visibleSent.map((b) => (
              <div key={b.id} id={`broadcast-${b.id}`}>
                <SentCard
                  broadcast={b}
                  currentUserId={currentUserId}
                  canManage={canManageBroadcast?.(b) ?? false}
                  strings={strings}
                  pollIntervalMs={pollIntervalMs}
                  open={openSentId === b.id}
                  onToggle={() => setOpenSentId((prev) => (prev === b.id ? null : b.id))}
                  onAuthorClick={onAuthorClick}
                  onSendToThread={onSendToThread}
                  onMarkThreadRead={onMarkThreadRead}
                  onCloseClick={() => handleClose(b.id)}
                  onDeleteClick={() => setDeletingId(b.id)}
                  highlighted={highlightId === b.id}
                />
                {closingId === b.id && <p className="mt-1 text-center text-[11px] text-gray-400">…</p>}
              </div>
            ))}
          </div>
        )
      )}

      {(!canReadSent || tab === 'received') && (
        !received.length ? (
          loadingReceived ? (
            <Card padding><p className="text-center text-sm text-gray-400">{strings.loadingLabel}</p></Card>
          ) : (
            <Card padding className="py-10 text-center">
              <FiMessageSquare size={26} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">{strings.noReceivedYet}</p>
            </Card>
          )
        ) : !visibleReceived.length ? (
          <Card padding><p className="py-6 text-center text-sm text-gray-400">{strings.nothingUnread}</p></Card>
        ) : (
          <div className="space-y-3">
            {visibleReceived.map((b) => (
              <div key={b.id} id={`broadcast-${b.id}`}>
                <ReceivedCard
                  broadcast={b}
                  currentUserId={currentUserId}
                  strings={strings}
                  pollIntervalMs={pollIntervalMs}
                  open={openReceivedId === b.id}
                  onToggle={() => setOpenReceivedId((prev) => (prev === b.id ? null : b.id))}
                  onAuthorClick={onAuthorClick}
                  onSendToThread={onSendToThread}
                  onMarkThreadRead={onMarkThreadRead}
                  highlighted={highlightId === b.id}
                />
              </div>
            ))}
          </div>
        )
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
