import type { Meta, StoryObj } from '@storybook/react';
import { ConversationThread } from './ConversationThread';
import type { ChatMessage } from './types';

const strings = {
  placeholder: 'Type a message…',
  send: 'Send',
  readTooltipRead: 'Read',
  readTooltipUnread: 'Not read yet',
  loadError: 'Could not load messages.',
  sendError: 'Could not send. Try again.',
};

const seedMessages: ChatMessage[] = [
  { id: '1', authorId: 'admin-1', authorName: 'Dev Admin', body: 'Please confirm your hours for this week.', createdAt: new Date(Date.now() - 3600_000).toISOString(), read: true },
  { id: '2', authorId: 'worker-1', authorName: 'Carlos Vidana', body: 'Looks good, confirmed.', createdAt: new Date(Date.now() - 1800_000).toISOString() },
];

const meta: Meta<typeof ConversationThread> = {
  title: 'Components/ConversationThread',
  component: ConversationThread,
  parameters: {
    docs: {
      description: {
        component:
          'A single thread of messages - fetches and polls its own data via `fetchFn`, renders every ' +
          'turn (always labelled with the real author, not just "unlabeled = you"), and offers a ' +
          'composer. No react-router/auth-context/i18n-system dependency - see `BroadcastInbox` for ' +
          'the layer that composes several of these into a Sent/Received broadcast inbox.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ConversationThread>;

export const Default: Story = {
  args: {
    fetchFn: async () => seedMessages,
    onSend: async (body: string) => ({
      id: String(Math.random()),
      authorId: 'worker-1',
      authorName: 'Carlos Vidana',
      body,
      createdAt: new Date().toISOString(),
    }),
    currentUserId: 'worker-1',
    strings,
  },
};

export const Closed: Story = {
  args: {
    ...Default.args,
    disabled: true,
    disabledMessage: 'This conversation is closed.',
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    fetchFn: async () => [],
  },
};
