import type { DatePickerProps } from '../DatePicker';
import type { ConversationThreadStrings } from '../ConversationThread/ConversationThread';
import type { ChatBroadcast, ChatMessage } from '../ConversationThread/types';

export interface BroadcastInboxStrings extends ConversationThreadStrings {
  sentTabLabel: string;
  receivedTabLabel: string;
  // Only needed when the inbox is given `showFeedback`.
  feedbackTabLabel?: string;
  // Name of the dot beside a conversation with something new in it (read by screen readers and shown on hover).
  unreadMarkLabel?: string;
  noFeedbackYet?: string;
  // Only needed when the inbox is given `fetchDivisionSent`.
  otherSentTabLabel?: string;
  noOtherSentYet?: string;
  newMessageLabel: string;
  unreadOnlyLabel: (count: number) => string;
  // Over the list, how many conversations it shows and, when the list has more than were loaded, how many there
  // are in all: "50 of 164 conversations".
  listCountLabel?: (count: number, total?: number) => string;
  // The button that brings the next older ones.
  loadMoreLabel?: string;
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

// A page of a list: the conversations, and how many there are in all when the app knows (a list that has more
// than a page). A fetcher may return the plain array instead, which is a list with nothing more to load.
export interface BroadcastPage {
  items: ChatBroadcast[];
  total?: number;
  // Whether there are older ones after this page. When the app does not say, it is read from `total`.
  more?: boolean;
  // The cursor that asks for the page after this one. An app that takes conversations out of a page before handing it
  // over (its own ones from Received, say) gives the cursor of the page as the server sent it: the last one left on
  // screen is not where the server stopped, and a page it emptied would ask for the same page again and again. Without
  // it, the cursor of the last conversation of the list is used.
  nextCursor?: string;
}

export type BroadcastStatus = 'needsReply' | 'waiting' | 'answered' | 'closed';

export interface BroadcastDataProps {
  // Omit entirely when canSendMessages is false - the Sent tab never renders. Always the caller's OWN sent
  // messages, whatever their role - see fetchDivisionSent below for the rest of a division's.
  // Each takes the `cursor` of the last conversation it was given to return the ones after it (the next older page).
  fetchSent?: (before?: string) => Promise<ChatBroadcast[] | BroadcastPage>;
  fetchReceived: (before?: string) => Promise<ChatBroadcast[] | BroadcastPage>;
  // What the rest of a division sent, not the caller's own - its own "Other sent" tab, so it's never mistaken
  // for messages the caller actually wrote themself. Omit entirely for a role that doesn't manage a division's
  // messages (the tab never renders); an app wires this to an admin-all-only endpoint.
  fetchDivisionSent?: (before?: string) => Promise<ChatBroadcast[] | BroadcastPage>;
  // The feedback list, paged on its own so feedback is not pushed out of the newest page by other messages. Used
  // when `showFeedback` is on; without it the Feedback tab only has the feedback found in Sent and Received.
  fetchFeedback?: (before?: string) => Promise<ChatBroadcast[] | BroadcastPage>;
  // One conversation by its id, from the side the caller is on, or null when there is none for them. When given, the
  // screen of a conversation reads it from here and not by looking for it in the lists, which have a size: an older
  // conversation is found, and one pushed out of the newest page by newer ones is not lost.
  fetchOne?: (broadcastId: string) => Promise<{ broadcast: ChatBroadcast; side: BroadcastSide } | null>;
  // One shared conversation per broadcast - every reply and every follow-up
  // goes into it, from either side.
  onSendMessage: (broadcastId: string, body: string, files?: File[]) => Promise<ChatMessage>;
  // Turns on images in the conversation (see ConversationThread).
  getAttachmentUrl?: (attachmentId: string) => Promise<string>;
  // `lastMessageId` is the last message the screen showed: the look is of that much, so a message that arrived
  // while the request was on its way is still new.
  onMarkRead: (broadcastId: string, lastMessageId?: string) => Promise<void>;
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
