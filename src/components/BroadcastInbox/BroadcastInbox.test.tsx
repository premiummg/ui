import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BroadcastInbox } from './BroadcastInbox';
import { BroadcastDetail } from './BroadcastDetail';
import { strings, broadcast, baseProps } from './testFixtures';

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
    await waitFor(() => expect(screen.getByText(/Sent by Another Admin/)).toBeInTheDocument());
    expect(screen.queryByText(/Sent by you/)).not.toBeInTheDocument();
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
    await waitFor(() => expect(screen.getByText(/Sent by you/)).toBeInTheDocument());
  });

  test('clicking a row opens that conversation by id', async () => {
    const onOpen = vi.fn();
    render(<BroadcastInbox {...baseProps} onOpen={onOpen} fetchSent={async () => [broadcast()]} currentUserId="admin-1" canSendMessages />);
    await waitFor(() => expect(screen.getByText('Confirm your hours')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Confirm your hours'));
    expect(onOpen).toHaveBeenCalledWith('b1');
  });

  test('search matches the subject and recipient names, and hides the rest', async () => {
    const sent = [
      broadcast({ id: 'b1', title: 'Confirm your hours' }),
      broadcast({
        id: 'b2',
        title: 'Safety briefing',
        recipients: [{ participant: { id: 'worker-2', name: 'Ana Ruiz' }, respondedAt: null, openedAt: null }],
      }),
    ];
    render(<BroadcastInbox {...baseProps} fetchSent={async () => sent} currentUserId="admin-1" canSendMessages />);
    await waitFor(() => expect(screen.getByText('Confirm your hours')).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText('Search'), 'ruiz');
    expect(screen.getByText('Safety briefing')).toBeInTheDocument();
    expect(screen.queryByText('Confirm your hours')).not.toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Search'));
    await userEvent.type(screen.getByLabelText('Search'), 'nothing matches');
    expect(screen.getByText(strings.noResultsLabel)).toBeInTheDocument();
  });

  test('status filter keeps only broadcasts in that state', async () => {
    const sent = [
      broadcast({ id: 'b1', title: 'Waiting one' }),
      broadcast({
        id: 'b2',
        title: 'Needs answer',
        recipients: [{ participant: { id: 'worker-2', name: 'Ana Ruiz' }, respondedAt: null, openedAt: null }],
        messages: [{ id: 'm1', authorId: 'worker-2', authorName: 'Ana Ruiz', body: 'Question?', createdAt: new Date().toISOString() }],
      }),
    ];
    render(<BroadcastInbox {...baseProps} fetchSent={async () => sent} currentUserId="admin-1" canSendMessages />);
    await waitFor(() => expect(screen.getByText('Waiting one')).toBeInTheDocument());

    await userEvent.selectOptions(screen.getByLabelText('Status'), 'needsReply');
    expect(screen.getByText('Needs answer')).toBeInTheDocument();
    expect(screen.queryByText('Waiting one')).not.toBeInTheDocument();
  });

  test('person filter autocompletes a name and keeps only that person', async () => {
    const sent = [
      broadcast({ id: 'b1', title: 'For Carlos' }),
      broadcast({
        id: 'b2',
        title: 'For Ana',
        recipients: [{ participant: { id: 'worker-2', name: 'Ana Ruiz' }, respondedAt: null, openedAt: null }],
      }),
    ];
    render(<BroadcastInbox {...baseProps} fetchSent={async () => sent} currentUserId="admin-1" canSendMessages />);
    await waitFor(() => expect(screen.getByText('For Carlos')).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText('Person'), 'ana');
    const suggestions = screen.getByRole('list');
    await userEvent.click(within(suggestions).getByRole('button', { name: 'Ana Ruiz' }));
    expect(screen.getByText('For Ana')).toBeInTheDocument();
    expect(screen.queryByText('For Carlos')).not.toBeInTheDocument();
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

describe('BroadcastDetail', () => {
  test('renders the conversation and its recipients', async () => {
    render(
      <BroadcastDetail
        {...baseProps}
        broadcastId="b1"
        onBack={vi.fn()}
        fetchSent={async () => [broadcast()]}
        currentUserId="admin-1"
        canSendMessages
      />,
    );
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Confirm your hours' })).toBeInTheDocument());
    expect(screen.getByText('Carlos Vidana')).toBeInTheDocument();
  });

  test('back button calls onBack', async () => {
    const onBack = vi.fn();
    render(
      <BroadcastDetail
        {...baseProps}
        broadcastId="b1"
        onBack={onBack}
        fetchSent={async () => [broadcast()]}
        currentUserId="admin-1"
        canSendMessages
      />,
    );
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Confirm your hours' })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Back to messages' }));
    expect(onBack).toHaveBeenCalled();
  });

  test("replies from others show their avatar, and the root message shows its time", async () => {
    render(
      <BroadcastDetail
        {...baseProps}
        broadcastId="b1"
        onBack={vi.fn()}
        fetchSent={async () => [broadcast({
          messages: [{ id: "m1", authorId: "worker-1", authorName: "Carlos Vidana", body: "Got it", createdAt: new Date().toISOString() }],
          recipients: [{ participant: { id: "worker-1", name: "Carlos Vidana" }, respondedAt: new Date().toISOString(), openedAt: null }],
        })]}
        currentUserId="admin-1"
        canSendMessages
      />,
    );
    await waitFor(() => expect(screen.getByRole("heading", { name: "Confirm your hours" })).toBeInTheDocument());
    expect(screen.getAllByText("CV").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\d{1,2}:\d{2}/).length).toBeGreaterThan(0);
  });

  test('a conversation with several recipients has one composer, not one per person', async () => {
    render(
      <BroadcastDetail
        {...baseProps}
        broadcastId="b1"
        onBack={vi.fn()}
        fetchSent={async () => [broadcast({
          recipients: [
            { participant: { id: 'worker-1', name: 'Carlos Vidana' }, respondedAt: null, openedAt: null },
            { participant: { id: 'worker-2', name: 'Ana Ruiz' }, respondedAt: null, openedAt: null },
          ],
        })]}
        currentUserId="admin-1"
        canSendMessages
        canManageBroadcast={() => true}
      />,
    );
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Confirm your hours' })).toBeInTheDocument());
    expect(screen.getAllByPlaceholderText('Type a message…')).toHaveLength(1);
  });

  test('a reply from the received side goes into the shared conversation', async () => {
    const onSendMessage = vi.fn().mockResolvedValue({ id: 'm2', authorId: 'worker-1', authorName: 'Carlos Vidana', body: 'Yes', createdAt: new Date().toISOString() });
    render(
      <BroadcastDetail
        {...baseProps}
        onSendMessage={onSendMessage}
        broadcastId="b1"
        onBack={vi.fn()}
        fetchReceived={async () => [broadcast({ createdBy: 'admin-1', recipients: [{ participant: { id: 'worker-1', name: 'Carlos Vidana' }, respondedAt: null }] })]}
        currentUserId="worker-1"
        canSendMessages={false}
      />,
    );
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Confirm your hours' })).toBeInTheDocument());
    await userEvent.type(screen.getByPlaceholderText('Type a message…'), 'Yes');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(onSendMessage).toHaveBeenCalledWith('b1', 'Yes'));
  });

  test('shows a not-found message when the id is not in either list', async () => {
    render(
      <BroadcastDetail
        {...baseProps}
        broadcastId="missing"
        onBack={vi.fn()}
        fetchSent={async () => [broadcast()]}
        currentUserId="admin-1"
        canSendMessages
      />,
    );
    await waitFor(() => expect(screen.getByText(strings.notFoundLabel)).toBeInTheDocument());
  });
});
