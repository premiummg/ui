import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  deleteConversation: 'Delete conversation',
  deleteConfirmTitle: 'Delete this conversation?',
  deleteConfirmBody: (title) => `Permanently delete "${title}"?`,
  deleteLabel: 'Delete',
  cancelLabel: 'Cancel',
  closeConversationLabel: 'Close conversation',
  stopAskingLabel: 'Stop asking',
  everyoneAnswered: 'Everyone has answered.',
  onePersonWaiting: '1 person still owes a reply.',
  peopleWaiting: (n) => `${n} people still owe a reply.`,
  loadingLabel: 'Loading…',
};

function broadcast(overrides: Partial<ChatBroadcast> = {}): ChatBroadcast {
  return {
    id: 'b1',
    title: 'Confirm your hours',
    body: 'Please confirm your hours.',
    createdAt: new Date().toISOString(),
    closedAt: null,
    createdBy: 'admin-1',
    senderName: 'Dev Admin',
    requiresReply: true,
    threads: [{ participant: { id: 'worker-1', name: 'Carlos Vidana' }, messages: [], respondedAt: null, openedAt: null, unread: false }],
    ...overrides,
  };
}

const baseProps = {
  fetchReceived: async () => [] as ChatBroadcast[],
  onSendToThread: vi.fn(),
  onMarkThreadRead: vi.fn(),
  onClose: vi.fn(),
  onDelete: vi.fn(),
  strings,
};

describe('BroadcastInbox', () => {
  // The bug this session fixed: the Sent tab is a shared mailbox, so the
  // viewer isn't necessarily who actually wrote a given broadcast - it must
  // never be hardcoded to render as "your own message".
  test('shows the real sender name for a broadcast someone else sent, in a shared Sent list', async () => {
    render(
      <BroadcastInbox
        {...baseProps}
        fetchSent={async () => [broadcast({ createdBy: 'admin-2', senderName: 'Another Admin' })]}
        currentUserId="admin-1"
        canSendMessages
      />,
    );
    await waitFor(() => expect(screen.getByText('Sent by Another Admin')).toBeInTheDocument());
    expect(screen.queryByText('Sent by you')).not.toBeInTheDocument();
  });

  test('shows "Sent by you" for your own broadcast', async () => {
    render(
      <BroadcastInbox
        {...baseProps}
        fetchSent={async () => [broadcast({ createdBy: 'admin-1' })]}
        currentUserId="admin-1"
        canSendMessages
      />,
    );
    await waitFor(() => expect(screen.getByText('Sent by you')).toBeInTheDocument());
  });

  test('clicking a recipient name calls onAuthorClick with their id', async () => {
    const onAuthorClick = vi.fn();
    render(
      <BroadcastInbox
        {...baseProps}
        fetchSent={async () => [broadcast()]}
        currentUserId="admin-1"
        canSendMessages
        onAuthorClick={onAuthorClick}
      />,
    );
    await waitFor(() => expect(screen.getByText('Confirm your hours')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Confirm your hours'));
    await waitFor(() => expect(screen.getByText('Carlos Vidana')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Carlos Vidana'));
    expect(onAuthorClick).toHaveBeenCalledWith('worker-1');
  });

  test('delete requires confirmation before calling onDelete', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <BroadcastInbox
        {...baseProps}
        onDelete={onDelete}
        fetchSent={async () => [broadcast()]}
        currentUserId="admin-1"
        canSendMessages
        canManageBroadcast={() => true}
      />,
    );
    await waitFor(() => expect(screen.getByTitle('Delete conversation')).toBeInTheDocument());
    await userEvent.click(screen.getByTitle('Delete conversation'));
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('b1'));
  });

  test('without canSendMessages, only the Received list renders (no tab switch)', async () => {
    render(
      <BroadcastInbox
        {...baseProps}
        fetchReceived={async () => [broadcast()]}
        currentUserId="worker-1"
        canSendMessages={false}
      />,
    );
    expect(screen.queryByText('Sent')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Confirm your hours')).toBeInTheDocument());
  });
});
