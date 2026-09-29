// Canonical shape both ConversationThread and BroadcastInbox speak - deliberately
// not tied to any one app's API response shape. Every consuming app maps its own
// API response into this before handing it to either component, and maps this
// back out on write (see each app's own chat adapter). Field names are
// camelCase throughout, independent of whatever each backend actually returns.

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string | null;
  body: string;
  createdAt: string;
  // Only meaningful on a message YOU authored - has the other party read it
  // yet (the tick marks). Omit/undefined for a message that isn't yours, or
  // when the consumer doesn't track read receipts at all.
  read?: boolean;
}

export interface ChatParticipant {
  id: string;
  name: string;
}

// One thread: either "my own" (ReceivedCard's single thread) or one specific
// recipient's (a row inside a BroadcastInbox's Sent side). authorId/authorName
// on each message already say who wrote what - this is just the thread's own
// metadata, not a duplicate of the message list.
export interface ChatThread {
  participant: ChatParticipant;
  messages: ChatMessage[];
  respondedAt: string | null;
  // When the participant last opened THEIR OWN thread - only meaningful from
  // the Sent side, where the viewer isn't the participant. Omit on the
  // Received side, where "opened" is just "you're looking at it right now".
  openedAt?: string | null;
  // Whether the CURRENT viewer has unseen activity in this specific thread.
  unread: boolean;
}

// One broadcast: the root message plus every participant's thread.
// A ConversationThread only ever renders one ChatThread's messages/composer;
// a BroadcastInbox renders one ChatBroadcast's root message plus N
// ConversationThreads, one per entry in `threads`.
export interface ChatBroadcast {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  closedAt: string | null;
  createdBy: string;
  senderName: string | null;
  requiresReply: boolean;
  // Sent side: every recipient. Received side: just the viewer's own, length 1.
  threads: ChatThread[];
  // Generic "this message is about X" link (e.g. timesheet's own submission,
  // a certificate, a case) - the component only ever renders the label/icon
  // and calls onClick, it never knows what X is.
  contextLink?: { label: string; onClick: () => void } | null;
}
