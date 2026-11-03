import type { DatePickerProps } from '../DatePicker';
import type { ConversationThreadStrings } from '../ConversationThread/ConversationThread';
import type { ChatBroadcast, ChatMessage } from '../ConversationThread/types';

export interface BroadcastInboxStrings extends ConversationThreadStrings {
  sentTabLabel: string;
  receivedTabLabel: string;
  // Only needed when the inbox is given `showFeedback`.
  feedbackTabLabel?: string;
  noFeedbackYet?: string;
  // Only needed when the inbox is given `fetchDivisionSent`.
  otherSentTabLabel?: string;
  noOtherSentYet?: string;
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
  // Optional: the date picker falls back to its English defaults.
  dateClearLabel?: string;
  dateTodayLabel?: string;
  clearFiltersLabel: string;
  noResultsLabel: string;
  backToMessagesLabel: string;
  notFoundLabel: string;
}

export type BroadcastSide = 'sent' | 'received';

export type BroadcastStatus = 'needsReply' | 'waiting' | 'answered' | 'closed';

export interface BroadcastDataProps {
  // Omit entirely when canSendMessages is false - the Sent tab never renders. Always the caller's OWN sent
  // messages, whatever their role - see fetchDivisionSent below for the rest of a division's.
  fetchSent?: () => Promise<ChatBroadcast[]>;
  fetchReceived: () => Promise<ChatBroadcast[]>;
  // What the rest of a division sent, not the caller's own - its own "Other sent" tab, so it's never mistaken
  // for messages the caller actually wrote themself. Omit entirely for a role that doesn't manage a division's
  // messages (the tab never renders); an app wires this to an admin-all-only endpoint.
  fetchDivisionSent?: () => Promise<ChatBroadcast[]>;
  // One shared conversation per broadcast - every reply and every follow-up
  // goes into it, from either side.
  onSendMessage: (broadcastId: string, body: string, files?: File[]) => Promise<ChatMessage>;
  // Turns on images in the conversation (see ConversationThread).
  getAttachmentUrl?: (attachmentId: string) => Promise<string>;
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
  // Return true while polling should wait (an app that was told "too many requests" says so here). The regular
  // checks skip their turn; the next one after it returns false runs as usual.
  pausePolling?: () => boolean;
}

export interface BroadcastInboxProps extends BroadcastDataProps {
  // Opens one conversation on its own screen - the app routes to
  // BroadcastDetail for that id.
  onOpen: (broadcastId: string) => void;
  onCompose?: () => void;
  // Adds a Feedback tab (broadcasts flagged isFeedback) and keeps those out of
  // Sent and Received. For the people who read the app's feedback.
  showFeedback?: boolean;
  // date-fns locale for the From/To date pickers (month and weekday names).
  dateLocale?: DatePickerProps['locale'];
}

export interface BroadcastDetailProps extends BroadcastDataProps {
  broadcastId: string;
  onBack: () => void;
}
