import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BroadcastInbox } from './BroadcastInbox';
import { BroadcastDetail } from './BroadcastDetail';
import { RecipientChips } from './broadcastParts';
import { strings, broadcast, baseProps } from './testFixtures';

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

describe('BroadcastInbox filters', () => {
  test('unread-only keeps just the conversations with new activity', async () => {
    const sent = [
      broadcast({ id: 'b1', title: 'Has news', unread: true }),
      broadcast({ id: 'b2', title: 'Nothing new', unread: false }),
    ];
    render(<BroadcastInbox {...baseProps} fetchSent={async () => sent} currentUserId="admin-1" canSendMessages />);
    await waitFor(() => expect(screen.getByText('Nothing new')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /Unread \(/ }));
    expect(screen.getByText('Has news')).toBeInTheDocument();
    expect(screen.queryByText('Nothing new')).not.toBeInTheDocument();
  });

  test('date range keeps only conversations created inside it', async () => {
    const sent = [
      broadcast({ id: 'b1', title: 'Recent one', createdAt: daysAgo(1) }),
      broadcast({ id: 'b2', title: 'Old one', createdAt: daysAgo(30) }),
    ];
    render(<BroadcastInbox {...baseProps} fetchSent={async () => sent} currentUserId="admin-1" canSendMessages />);
    await waitFor(() => expect(screen.getByText('Old one')).toBeInTheDocument());

    const from = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    await userEvent.type(screen.getByLabelText('From'), from);
    expect(screen.getByText('Recent one')).toBeInTheDocument();
    expect(screen.queryByText('Old one')).not.toBeInTheDocument();
  });

  test('clear filters brings the full list back', async () => {
    const sent = [
      broadcast({ id: 'b1', title: 'Confirm your hours' }),
      broadcast({ id: 'b2', title: 'Safety briefing' }),
    ];
    render(<BroadcastInbox {...baseProps} fetchSent={async () => sent} currentUserId="admin-1" canSendMessages />);
    await waitFor(() => expect(screen.getByText('Confirm your hours')).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText('Search'), 'safety');
    expect(screen.queryByText('Confirm your hours')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByText('Confirm your hours')).toBeInTheDocument();
    expect(screen.getByText('Safety briefing')).toBeInTheDocument();
  });

  test('a received conversation is found by the sender\'s name', async () => {
    const received = [
      broadcast({ id: 'b1', title: 'From Dev Admin', senderName: 'Dev Admin', createdBy: 'admin-1' }),
      broadcast({ id: 'b2', title: 'From Another', senderName: 'Another Admin', createdBy: 'admin-2' }),
    ];
    render(<BroadcastInbox {...baseProps} fetchReceived={async () => received} currentUserId="worker-1" canSendMessages={false} />);
    await waitFor(() => expect(screen.getByText('From Dev Admin')).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText('Search'), 'another');
    expect(screen.getByText('From Another')).toBeInTheDocument();
    expect(screen.queryByText('From Dev Admin')).not.toBeInTheDocument();
  });
});

describe('BroadcastDetail actions', () => {
  test('stop asking is shown while someone still owes a reply, and calls onClose', async () => {
    const onClose = vi.fn().mockResolvedValue(undefined);
    render(
      <BroadcastDetail
        {...baseProps}
        onClose={onClose}
        broadcastId="b1"
        onBack={vi.fn()}
        fetchSent={async () => [broadcast({ recipients: [{ participant: { id: 'w1', name: 'Carlos Vidana' }, respondedAt: null, openedAt: null }] })]}
        currentUserId="admin-1"
        canSendMessages
        canManageBroadcast={() => true}
      />,
    );
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Confirm your hours' })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Stop asking' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith('b1'));
  });

  test('close conversation is shown once everyone has answered', async () => {
    render(
      <BroadcastDetail
        {...baseProps}
        broadcastId="b1"
        onBack={vi.fn()}
        fetchSent={async () => [broadcast({ recipients: [{ participant: { id: 'w1', name: 'Carlos Vidana' }, respondedAt: new Date().toISOString(), openedAt: null }] })]}
        currentUserId="admin-1"
        canSendMessages
        canManageBroadcast={() => true}
      />,
    );
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Confirm your hours' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Close conversation' })).toBeInTheDocument();
  });

  test('deleting from the detail confirms first, then calls onDelete and goes back to the list', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onBack = vi.fn();
    render(
      <BroadcastDetail
        {...baseProps}
        onDelete={onDelete}
        broadcastId="b1"
        onBack={onBack}
        fetchSent={async () => [broadcast()]}
        currentUserId="admin-1"
        canSendMessages
        canManageBroadcast={() => true}
      />,
    );
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Confirm your hours' })).toBeInTheDocument());
    await userEvent.click(screen.getByTitle('Delete conversation'));
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('b1'));
    await waitFor(() => expect(onBack).toHaveBeenCalled());
  });

  test('a closed conversation has no composer', async () => {
    render(
      <BroadcastDetail
        {...baseProps}
        broadcastId="b1"
        onBack={vi.fn()}
        fetchReceived={async () => [broadcast({ closedAt: new Date().toISOString(), createdBy: 'admin-1' })]}
        currentUserId="worker-1"
        canSendMessages={false}
      />,
    );
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Confirm your hours' })).toBeInTheDocument());
    expect(screen.queryByPlaceholderText('Type a message…')).not.toBeInTheDocument();
  });

  test('a sender who cannot manage the broadcast gets no composer on the sent side', async () => {
    render(
      <BroadcastDetail
        {...baseProps}
        broadcastId="b1"
        onBack={vi.fn()}
        fetchSent={async () => [broadcast({ createdBy: 'admin-2' })]}
        currentUserId="admin-1"
        canSendMessages
        canManageBroadcast={() => false}
      />,
    );
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Confirm your hours' })).toBeInTheDocument());
    expect(screen.queryByPlaceholderText('Type a message…')).not.toBeInTheDocument();
  });
});

describe('RecipientChips', () => {
  test('shows replied, read-without-reply, and not-opened for each person', () => {
    const b = broadcast({
      recipients: [
        { participant: { id: 'a', name: 'Ana Ruiz' }, respondedAt: new Date().toISOString(), openedAt: null },
        { participant: { id: 'b', name: 'Bruno Diaz' }, respondedAt: null, openedAt: new Date().toISOString() },
        { participant: { id: 'c', name: 'Carla Soto' }, respondedAt: null, openedAt: null },
      ],
    });
    render(<RecipientChips broadcast={b} strings={strings} />);
    const ana = screen.getByText('Ana Ruiz').closest('li')!;
    const bruno = screen.getByText('Bruno Diaz').closest('li')!;
    const carla = screen.getByText('Carla Soto').closest('li')!;
    expect(within(ana).getByText(strings.replied)).toBeInTheDocument();
    expect(within(bruno).getByText(strings.readNoReply)).toBeInTheDocument();
    expect(within(carla).getByText(strings.notOpened)).toBeInTheDocument();
  });
});
