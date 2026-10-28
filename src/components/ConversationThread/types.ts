// Canonical shape both ConversationThread and BroadcastInbox speak - deliberately
// not tied to any one app's API response shape. Every consuming app maps its own
// API response into this before handing it to either component, and maps this
// back out on write (see each app's own chat adapter). Field names are
// camelCase throughout, independent of whatever each backend actually returns.

// An image that came with a message. Its URL is fetched on demand (signed and short-lived).
export interface ChatAttachment {
  id: string;
  name: string;
  mimeType: string;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string | null;
  body: string;
  createdAt: string;
  // Only meaningful on a message YOU authored - has anyone else in the
  // conversation read it yet (the tick marks). Omit/undefined for a message
  // that isn't yours, or when the consumer doesn't track read receipts.
  read?: boolean;
  attachments?: ChatAttachment[];
}

export interface ChatParticipant {
  id: string;
  name: string;
}

// One person a broadcast was sent to. respondedAt is set once they've answered
// (or sent their first message); openedAt is when they last looked at it.
export interface ChatRecipient {
  participant: ChatParticipant;
  respondedAt: string | null;
  openedAt?: string | null;
}

// One broadcast: the root message, the shared conversation everyone involved
// reads and writes, and who it went to. Received side: recipients is just you.
export interface ChatBroadcast {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  closedAt: string | null;
  createdBy: string;
  senderName: string | null;
  requiresReply: boolean;
  messages: ChatMessage[];
  recipients: ChatRecipient[];
  // Whether the current viewer has unseen activity in this conversation.
  unread: boolean;
  // Generic "this message is about X" link (e.g. timesheet's own submission,
  // a certificate, a case) - the component only ever renders the label/icon
  // and calls onClick, it never knows what X is.
  contextLink?: { label: string; onClick: () => void } | null;
  // When set, nobody can write into this conversation and this text is shown
  // where the composer would be (e.g. anonymous feedback has no one to answer).
  locked?: string | null;
  // Feedback about the app. With BroadcastInbox's `showFeedback` these get
  // their own tab instead of living in Sent/Received.
  isFeedback?: boolean;
  // Images sent with the root message.
  attachments?: ChatAttachment[];
}
