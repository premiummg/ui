import { useEffect, useState } from 'react';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { ConversationThread } from '../ConversationThread/ConversationThread';
import type { ChatBroadcast } from '../ConversationThread/types';
import { Card } from '../Card';
import { ConfirmDialog } from '../ConfirmDialog';
import type { BroadcastDetailProps, BroadcastSide } from './types';
import { ContextLink, RecipientChips, RootMessageBubble, StatusPill, formatDateTime } from './broadcastParts';

// One conversation on its own screen: the root message, every reply from every
// person involved in one shared timeline, and a single composer. Finds the
// broadcast by id in the same Sent/Received lists the inbox uses, so a deep
// link or a refresh works without a per-id endpoint.
export function BroadcastDetail({
  broadcastId,
  fetchSent,
  fetchReceived,
  onSendMessage,
  onMarkRead,
  onClose,
  onDelete,
  currentUserId,
  canSendMessages,
  canManageBroadcast,
  onAuthorClick,
  onBack,
  strings,
  pollIntervalMs = 15_000,
}: BroadcastDetailProps) {
  const canReadSent = canSendMessages && !!fetchSent;
  const [found, setFound] = useState<{ broadcast: ChatBroadcast; side: BroadcastSide } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [closing, setClosing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (document.visibilityState === 'hidden') return;
      const sentList = canReadSent ? await fetchSent!().catch(() => null) : null;
      const receivedList = await fetchReceived().catch(() => null);
      if (cancelled) return;
      const sentHit = sentList?.find((b) => b.id === broadcastId);
      const receivedHit = receivedList?.find((b) => b.id === broadcastId);
      setFound(sentHit ? { broadcast: sentHit, side: 'sent' } : receivedHit ? { broadcast: receivedHit, side: 'received' } : null);
      setLoaded(true);
    }
    load();
    const interval = setInterval(load, pollIntervalMs);
    document.addEventListener('visibilitychange', load);
    window.addEventListener('focus', load);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', load);
      window.removeEventListener('focus', load);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broadcastId, canReadSent, pollIntervalMs]);

  const backLink = (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition hover:text-(--premium-red) dark:text-gray-400"
    >
      <FiArrowLeft size={12} /> {strings.backToMessagesLabel}
    </button>
  );

  if (!loaded) {
    return (
      <div className="space-y-4">
        {backLink}
        <Card padding><p className="text-center text-sm text-gray-400">{strings.loadingLabel}</p></Card>
      </div>
    );
  }

  if (!found) {
    return (
      <div className="space-y-4">
        {backLink}
        <Card padding><p className="py-6 text-center text-sm text-gray-400">{strings.notFoundLabel}</p></Card>
      </div>
    );
  }

  const { broadcast, side } = found;
  const mine = broadcast.createdBy === currentUserId;
  const canManage = canManageBroadcast?.(broadcast) ?? false;
  // Anyone on the received side can reply; the sending side can reply only
  // when the app's permission rule says so.
  const canReply = side === 'received' || canManage;
  const pending = broadcast.recipients.filter((r) => !r.respondedAt).length;

  async function handleClose() {
    setClosing(true);
    try {
      await onClose(broadcast.id);
      setFound((prev) => prev && { ...prev, broadcast: { ...prev.broadcast, closedAt: new Date().toISOString() } });
    } finally {
      setClosing(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await onDelete(broadcast.id);
      onBack();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {backLink}
      <Card padding={false} className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/10">
          <div className="min-w-0">
            <h2 className="break-words text-base font-bold text-gray-900 dark:text-gray-100">{broadcast.title}</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {side === 'sent' && (mine ? strings.sentByYou : strings.sentBy(broadcast.senderName ?? strings.sentBySomeoneElse))}
              {side === 'received' && (broadcast.senderName ?? strings.sentBySomeoneElse)}
              {' · '}{formatDateTime(broadcast.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusPill broadcast={broadcast} side={side} currentUserId={currentUserId} strings={strings} />
            {side === 'sent' && canManage && (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                title={strings.deleteConversation}
                className="rounded-lg p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-600 dark:text-gray-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <FiTrash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {side === 'sent' && (
          <div className="border-b border-gray-100 px-5 py-3 dark:border-white/10">
            <RecipientChips broadcast={broadcast} strings={strings} onAuthorClick={onAuthorClick} />
          </div>
        )}

        <div className="space-y-4 px-5 py-4">
          <div>
            <RootMessageBubble broadcast={broadcast} mine={side === 'sent' && mine} onAuthorClick={onAuthorClick} />
            <ContextLink broadcast={broadcast} />
          </div>
          <ConversationThread
            fetchFn={async () => broadcast.messages}
            onSend={(body) => onSendMessage(broadcast.id, body)}
            onMarkRead={() => onMarkRead(broadcast.id)}
            currentUserId={currentUserId}
            strings={strings}
            pollIntervalMs={pollIntervalMs}
            disabled={!!broadcast.closedAt || !canReply}
            onAuthorClick={onAuthorClick}
          />
        </div>

        {side === 'sent' && !broadcast.closedAt && canManage && (
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-2.5 dark:border-white/10">
            <p className="text-xs text-gray-400">
              {pending === 0 ? strings.everyoneAnswered : pending === 1 ? strings.onePersonWaiting : strings.peopleWaiting(pending)}
            </p>
            <button
              type="button"
              disabled={closing}
              onClick={handleClose}
              className="text-xs font-semibold text-gray-500 transition hover:text-gray-700 disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {pending > 0 ? strings.stopAskingLabel : strings.closeConversationLabel}
            </button>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmingDelete}
        icon={FiTrash2}
        title={strings.deleteConfirmTitle}
        message={strings.deleteConfirmBody(broadcast.title)}
        confirmLabel={strings.deleteLabel}
        confirmDisabled={deleting}
        onConfirm={confirmDelete}
        onClose={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
