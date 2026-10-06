import type { ReactNode } from 'react';
import { FiCheck, FiClock, FiExternalLink, FiSlash } from 'react-icons/fi';
import type { ChatBroadcast } from '../ConversationThread/types';
import { Avatar } from '../ConversationThread/avatar';
import type { BroadcastInboxStrings, BroadcastSide, BroadcastStatus } from './types';

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

// Who needs to act next, from the shared conversation. Received side: waiting
// on you when the latest word is someone else's (or nobody has answered yet).
// Sent side: waiting on you when a recipient wrote last; waiting on them while
// anyone still hasn't answered.
export function broadcastStatus(broadcast: ChatBroadcast, side: BroadcastSide, currentUserId: string | undefined): BroadcastStatus {
  if (broadcast.closedAt) return 'closed';
  const last = broadcast.messages[broadcast.messages.length - 1];
  if (side === 'received') {
    const answered = last ? last.authorId === currentUserId : !!broadcast.recipients[0]?.respondedAt;
    return answered ? 'answered' : 'needsReply';
  }
  if (last && last.authorId !== broadcast.createdBy) return 'needsReply';
  if (broadcast.recipients.some((r) => !r.respondedAt)) return 'waiting';
  return 'answered';
}

// People a broadcast involves, for the search box and the person filter.
// Sent: everyone it went to. Received: the one who sent it to you.
export function peopleOf(broadcast: ChatBroadcast, side: BroadcastSide): { id: string; name: string }[] {
  if (side === 'sent') return broadcast.recipients.map((r) => r.participant);
  return [{ id: broadcast.createdBy, name: broadcast.senderName ?? '' }];
}

export function Pill({ tone, icon, children }: { tone: 'amber' | 'green' | 'gray'; icon: ReactNode; children: ReactNode }) {
  const classes = {
    amber: 'bg-[#FAAD00]/15 text-[#7A5300] dark:text-[#FAAD00]',
    green: 'bg-green-500/15 text-green-700 dark:text-green-400',
    gray: 'bg-gray-400/15 text-gray-600 dark:text-gray-300',
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${classes}`}>
      {icon}
      {children}
    </span>
  );
}

export function StatusPill({
  broadcast,
  side,
  currentUserId,
  strings,
}: {
  broadcast: ChatBroadcast;
  side: BroadcastSide;
  currentUserId: string | undefined;
  strings: BroadcastInboxStrings;
}) {
  const status = broadcastStatus(broadcast, side, currentUserId);
  if (status === 'closed') {
    const everyoneAnswered = broadcast.recipients.length > 0 && broadcast.recipients.every((r) => r.respondedAt);
    if (side === 'received' ? broadcast.recipients[0]?.respondedAt : everyoneAnswered) {
      return <Pill tone="gray" icon={<FiCheck size={11} />}>{strings.closedLabel}</Pill>;
    }
    return <Pill tone="gray" icon={<FiSlash size={11} />}>{strings.withdrawnLabel}</Pill>;
  }
  if (status === 'needsReply') return <Pill tone="amber" icon={<FiClock size={11} />}>{strings.waitingOnYou}</Pill>;
  if (status === 'waiting') {
    const pending = broadcast.recipients.filter((r) => !r.respondedAt).length;
    return <Pill tone="amber" icon={<FiClock size={11} />}>{strings.waitingOn(pending)}</Pill>;
  }
  if (side === 'received') return <Pill tone="green" icon={<FiCheck size={11} />}>{strings.answeredLabel}</Pill>;
  return <Pill tone="green" icon={<FiCheck size={11} />}>{strings.allAnswered}</Pill>;
}

// The broadcast's own root message, rendered once at the top of the
// conversation. Styled by actual authorship, not by which tab it's showing in:
// a division-wide Sent list can show someone ELSE's broadcast to an admin who
// didn't write it.
export function RootMessageBubble({
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
      <div className="flex flex-col items-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2.5" style={{ backgroundColor: 'var(--premium-red)' }}>
          <p className="whitespace-pre-wrap text-sm text-white">{broadcast.body}</p>
        </div>
        <p className="mt-0.5 text-[10px] text-gray-400">{timeOf(broadcast.createdAt)}</p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <Avatar name={broadcast.senderName} onClick={onAuthorClick ? () => onAuthorClick(broadcast.createdBy) : undefined} />
      <div className="min-w-0 max-w-[85%]">
        <p className="mb-0.5 text-[11px] text-gray-400">{broadcast.senderName ?? '?'}</p>
        <div className="inline-block rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-3.5 py-2.5 dark:border-white/20 dark:bg-(--premium-steel-grey)">
          <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">{broadcast.body}</p>
        </div>
        <p className="mt-0.5 text-[10px] text-gray-400">{timeOf(broadcast.createdAt)}</p>
      </div>
    </div>
  );
}

export function ContextLink({ broadcast }: { broadcast: ChatBroadcast }) {
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

// Who it went to and where each person stands - one row, not a card each.
export function RecipientChips({
  broadcast,
  strings,
  onAuthorClick,
}: {
  broadcast: ChatBroadcast;
  strings: BroadcastInboxStrings;
  onAuthorClick?: (authorId: string) => void;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {broadcast.recipients.map((r) => (
        <li key={r.participant.id} className="flex items-center gap-2 rounded-full border border-gray-100 py-1 pr-2.5 pl-1 dark:border-white/10">
          <Avatar name={r.participant.name} onClick={onAuthorClick ? () => onAuthorClick(r.participant.id) : undefined} />
          <button
            type="button"
            onClick={() => onAuthorClick?.(r.participant.id)}
            className="truncate text-xs font-medium text-gray-600 transition hover:text-(--premium-red) hover:underline dark:text-gray-300"
          >
            {r.participant.name}
          </button>
          {r.respondedAt ? (
            <Pill tone="green" icon={<FiCheck size={11} />}>{strings.replied}</Pill>
          ) : r.openedAt ? (
            <Pill tone="gray" icon={<FiCheck size={11} />}>{strings.readNoReply}</Pill>
          ) : (
            <Pill tone="amber" icon={<FiClock size={11} />}>{strings.notOpened}</Pill>
          )}
        </li>
      ))}
    </ul>
  );
}
