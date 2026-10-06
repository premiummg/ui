import type { Meta, StoryObj } from '@storybook/react';
import { BroadcastInbox } from './BroadcastInbox';
import type { BroadcastInboxStrings } from './BroadcastInbox';
import type { ChatBroadcast } from '../ConversationThread/types';

const strings: BroadcastInboxStrings = {
  placeholder: 'Type a message…',
  send: 'Send',
  readTooltipRead: 'Read',
  readTooltipUnread: 'Not read yet',
  loadError: 'Could not load messages.',
  sendError: 'Could not send. Try again.',
  sentTabLabel: 'Sent',
  receivedTabLabel: 'Received',
  newMessageLabel: 'New Message',
  unreadOnlyLabel: (n) => `Unread (${n})`,
  noSentYet: "You haven't sent any messages yet.",
  noReceivedYet: 'Nothing sent to you yet.',
  nothingUnread: 'Nothing unread.',
  sentByYou: 'Sent by you',
  sentBy: (name) => `Sent by ${name}`,
  sentBySomeoneElse: 'Someone else',
  notOpened: 'Not opened',
  readNoReply: 'Read, no reply',
  replied: 'Replied',
  repliedOn: (date) => `Replied ${date}`,
  allAnswered: 'All answered',
  waitingOn: (n) => `Waiting on ${n}`,
  needsReplyCount: (n) => `${n} need a reply`,
  closedLabel: 'Closed',
  withdrawnLabel: 'Withdrawn',
  waitingOnYou: 'Waiting on you',
  answeredLabel: 'Answered',
  deleteConversation: 'Delete',
  deleteConfirmTitle: 'Delete this conversation?',
  deleteConfirmBody: (title) => `Permanently delete "${title}"? This cannot be undone.`,
  deleteLabel: 'Delete',
  cancelLabel: 'Cancel',
  closeConversationLabel: 'Close conversation',
  stopAskingLabel: 'Stop asking',
  everyoneAnswered: 'Everyone has answered.',
  onePersonWaiting: '1 person still owes a reply.',
  peopleWaiting: (n) => `${n} people still owe a reply.`,
  loadingLabel: 'Loading…',
  searchLabel: 'Search',
  searchPlaceholder: 'Subject or person…',
  statusFilterLabel: 'Status',
  statusAllLabel: 'All statuses',
  statusNeedsReplyLabel: 'Needs reply',
  statusWaitingLabel: 'Waiting',
  statusAnsweredLabel: 'Answered',
  statusClosedLabel: 'Closed',
  dateFromLabel: 'From',
  dateToLabel: 'To',
  personFilterLabel: 'Person',
  personFilterPlaceholder: 'Type a name…',
  clearFiltersLabel: 'Clear filters',
  noResultsLabel: 'No conversations match these filters.',
  backToMessagesLabel: 'Back to messages',
  notFoundLabel: 'This conversation is no longer available.',
};

const sentSeed: ChatBroadcast[] = [
  {
    id: 'b1',
    title: 'Confirm your hours',
    body: 'Please confirm your hours for this week.',
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    closedAt: null,
    createdBy: 'admin-1',
    senderName: 'Dev Admin',
    requiresReply: true,
    messages: [
      { id: 'm1', authorId: 'worker-1', authorName: 'Carlos Vidana', body: 'Looks good, confirmed.', createdAt: new Date(Date.now() - 1800_000).toISOString() },
    ],
    recipients: [
      { participant: { id: 'worker-1', name: 'Carlos Vidana' }, respondedAt: new Date(Date.now() - 1800_000).toISOString(), openedAt: new Date(Date.now() - 2000_000).toISOString() },
      { participant: { id: 'worker-2', name: 'Jane Doe' }, respondedAt: null, openedAt: null },
    ],
    unread: false,
  },
];

const receivedSeed: ChatBroadcast[] = [
  {
    id: 'b1',
    title: 'Confirm your hours',
    body: 'Please confirm your hours for this week.',
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    closedAt: null,
    createdBy: 'admin-1',
    senderName: 'Dev Admin',
    requiresReply: true,
    messages: [],
    recipients: [{ participant: { id: 'worker-1', name: 'Carlos Vidana' }, respondedAt: null, openedAt: null }],
    unread: true,
  },
];

const meta: Meta<typeof BroadcastInbox> = {
  title: 'Components/BroadcastInbox',
  component: BroadcastInbox,
  parameters: {
    docs: {
      description: {
        component:
          "Today's exact Sent/Received broadcast pattern (one message to many recipients, each with " +
          'their own reply thread), composed from `ConversationThread`. Self-fetches/polls both lists. ' +
          'Every string is supplied via the `strings` prop - see this story\'s source for a full example.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof BroadcastInbox>;

export const AdminView: Story = {
  args: {
    fetchSent: async () => sentSeed,
    fetchReceived: async () => [],
    onSendMessage: async (_broadcastId, body) => ({
      id: String(Math.random()),
      authorId: 'admin-1',
      authorName: 'Dev Admin',
      body,
      createdAt: new Date().toISOString(),
    }),
    onMarkRead: async () => {},
    onClose: async () => {},
    onDelete: async () => {},
    currentUserId: 'admin-1',
    canSendMessages: true,
    canManageBroadcast: () => true,
    onOpen: () => {},
    strings,
  },
};

export const WorkerView: Story = {
  args: {
    ...AdminView.args,
    fetchReceived: async () => receivedSeed,
    currentUserId: 'worker-1',
    canSendMessages: false,
    fetchSent: undefined,
  },
};
