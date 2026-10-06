import type { ConversationThreadStrings } from '../ConversationThread/ConversationThread';
import type { ChatBroadcast, ChatMessage } from '../ConversationThread/types';

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
  searchLabel: string;
  searchPlaceholder: string;
  statusFilterLabel: string;
  statusAllLabel: string;
  statusNeedsReplyLabel: string;
  statusWaitingLabel: string;
  statusAnsweredLabel: string;
  statusClosedLabel: string;
  dateFromLabel: string;
  dateToLabel: string;
  personFilterLabel: string;
  personFilterPlaceholder: string;
  clearFiltersLabel: string;
  noResultsLabel: string;
  backToMessagesLabel: string;
  notFoundLabel: string;
}

export type BroadcastSide = 'sent' | 'received';

export type BroadcastStatus = 'needsReply' | 'waiting' | 'answered' | 'closed';

export interface BroadcastDataProps {
  // Omit entirely when canSendMessages is false - the Sent tab never renders.
  fetchSent?: () => Promise<ChatBroadcast[]>;
  fetchReceived: () => Promise<ChatBroadcast[]>;
  // One shared conversation per broadcast - every reply and every follow-up
  // goes into it, from either side.
  onSendMessage: (broadcastId: string, body: string) => Promise<ChatMessage>;
  onMarkRead: (broadcastId: string) => Promise<void>;
  onClose: (broadcastId: string) => Promise<void>;
  onDelete: (broadcastId: string) => Promise<void>;
  currentUserId: string | undefined;
  canSendMessages: boolean;
  // Gates the delete/close controls on a specific broadcast (e.g. a foreman
  // may only manage their own; an admin-all may manage every division's).
  // Omitting it means nobody sees those controls.
  canManageBroadcast?: (broadcast: ChatBroadcast) => boolean;
  onAuthorClick?: (authorId: string) => void;
  strings: BroadcastInboxStrings;
  pollIntervalMs?: number;
}

export interface BroadcastInboxProps extends BroadcastDataProps {
  // Opens one conversation on its own screen - the app routes to
  // BroadcastDetail for that id.
  onOpen: (broadcastId: string) => void;
  onCompose?: () => void;
}

export interface BroadcastDetailProps extends BroadcastDataProps {
  broadcastId: string;
  onBack: () => void;
}
