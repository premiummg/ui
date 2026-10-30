import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const seed: ChatMessage[] = [
  { id: '1', authorId: 'admin-1', authorName: 'Dev Admin', body: 'Hello there', createdAt: new Date().toISOString() },
];

describe('ConversationThread', () => {
  test('marking the thread read happens once, not again each time the parent hands in a new fetch function', async () => {
    const onMarkRead = vi.fn().mockResolvedValue(undefined);
    const messages = [{ id: '1', authorId: 'a', authorName: 'Ana', body: 'Hi', createdAt: new Date().toISOString() }];
    const view = (fetchFn: () => Promise<ChatMessage[]>) => (
      <ConversationThread fetchFn={fetchFn} onSend={vi.fn()} onMarkRead={onMarkRead} currentUserId="w" strings={strings} />
    );
    const { rerender } = render(view(async () => messages));
    await waitFor(() => expect(screen.getByText('Hi')).toBeInTheDocument());
    const afterFirst = onMarkRead.mock.calls.length;
    for (let i = 0; i < 5; i++) rerender(view(async () => messages));
    await new Promise((r) => setTimeout(r, 20));
    expect(onMarkRead.mock.calls.length).toBe(afterFirst);
  });

  test('a slow answer for a conversation that was swapped out does not overwrite the new one', async () => {
    let releaseOld: (m: ChatMessage[]) => void = () => {};
    const oldFetch = () => new Promise<ChatMessage[]>((resolve) => { releaseOld = resolve; });
    const newFetch = async () => [{ id: '9', authorId: 'a', authorName: 'Ana', body: 'New conversation', createdAt: new Date().toISOString() }];
    const { rerender } = render(<ConversationThread fetchFn={oldFetch} onSend={vi.fn()} currentUserId="w" strings={strings} />);
    rerender(<ConversationThread fetchFn={newFetch} onSend={vi.fn()} currentUserId="w" strings={strings} />);
    await waitFor(() => expect(screen.getByText('New conversation')).toBeInTheDocument());
    releaseOld([{ id: '1', authorId: 'a', authorName: 'Ana', body: 'Old conversation', createdAt: new Date().toISOString() }]);
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByText('Old conversation')).not.toBeInTheDocument();
    expect(screen.getByText('New conversation')).toBeInTheDocument();
  });

  test('fetches on mount and renders every message with its author name', async () => {
    render(
      <ConversationThread fetchFn={async () => seed} onSend={vi.fn()} currentUserId="worker-1" strings={strings} />,
    );
    await waitFor(() => expect(screen.getByText('Hello there')).toBeInTheDocument());
    expect(screen.getByText('Dev Admin')).toBeInTheDocument();
  });

  // The bug this session fixed twice in the two apps this was ported from:
  // "unlabeled = you" only holds for exactly one possible viewer. Both an
  // authored-by-you message and one from someone else must show a name.
  test('shows the author name even on the viewer\'s own message', async () => {
    const mine: ChatMessage[] = [{ id: '2', authorId: 'worker-1', authorName: 'Carlos Vidana', body: 'My own message', createdAt: new Date().toISOString() }];
    render(
      <ConversationThread fetchFn={async () => mine} onSend={vi.fn()} currentUserId="worker-1" strings={strings} />,
    );
    await waitFor(() => expect(screen.getByText('My own message')).toBeInTheDocument());
    expect(screen.getByText('Carlos Vidana')).toBeInTheDocument();
  });

  test('sending appends the returned message without waiting for the next poll', async () => {
    const sent: ChatMessage = { id: '3', authorId: 'worker-1', authorName: 'Carlos Vidana', body: 'New reply', createdAt: new Date().toISOString() };
    const onSend = vi.fn().mockResolvedValue(sent);
    render(
      <ConversationThread fetchFn={async () => []} onSend={onSend} currentUserId="worker-1" strings={strings} />,
    );
    await waitFor(() => expect(screen.getByPlaceholderText(strings.placeholder)).toBeInTheDocument());
    await userEvent.type(screen.getByPlaceholderText(strings.placeholder), 'New reply');
    await userEvent.click(screen.getByLabelText(strings.send));
    expect(onSend).toHaveBeenCalledWith('New reply');
    await waitFor(() => expect(screen.getByText('New reply')).toBeInTheDocument());
  });

  test('a failed check keeps the messages already on screen and says so above them', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      let fail = false;
      const fetchFn = async () => { if (fail) throw new Error('down'); return seed; };
      render(<ConversationThread fetchFn={fetchFn} onSend={vi.fn()} currentUserId="w" strings={strings} pollIntervalMs={1000} />);
      await waitFor(() => expect(screen.getByText('Hello there')).toBeInTheDocument());
      fail = true;
      await vi.advanceTimersByTimeAsync(1100);
      await waitFor(() => expect(screen.getByText(strings.loadError)).toBeInTheDocument());
      expect(screen.getByText('Hello there')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  test('a message sent while a check was in flight stays on screen', async () => {
    let releaseCheck: (m: ChatMessage[]) => void = () => {};
    let calls = 0;
    const fetchFn = () => (++calls === 1 ? Promise.resolve([]) : new Promise<ChatMessage[]>((resolve) => { releaseCheck = resolve; }));
    const sent: ChatMessage = { id: '7', authorId: 'w', authorName: 'Wen', body: 'Sent during a check', createdAt: new Date().toISOString() };
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      render(<ConversationThread fetchFn={fetchFn} onSend={vi.fn().mockResolvedValue(sent)} currentUserId="w" strings={strings} pollIntervalMs={1000} />);
      await waitFor(() => expect(screen.getByPlaceholderText(strings.placeholder)).toBeInTheDocument());
      await vi.advanceTimersByTimeAsync(1100);
      await userEvent.type(screen.getByPlaceholderText(strings.placeholder), 'Sent during a check');
      await userEvent.click(screen.getByLabelText(strings.send));
      await waitFor(() => expect(screen.getByText('Sent during a check')).toBeInTheDocument());
      // The slow check started before the send and does not know the message yet.
      releaseCheck([]);
      await vi.advanceTimersByTimeAsync(50);
      expect(screen.getByText('Sent during a check')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  test('disabled hides the composer and shows disabledMessage instead', async () => {
    render(
      <ConversationThread
        fetchFn={async () => []}
        onSend={vi.fn()}
        currentUserId="worker-1"
        strings={strings}
        disabled
        disabledMessage="This conversation is closed."
      />,
    );
    await waitFor(() => expect(screen.getByText('This conversation is closed.')).toBeInTheDocument());
    expect(screen.queryByPlaceholderText(strings.placeholder)).not.toBeInTheDocument();
  });

  test('calls onMarkRead on mount when the tab is focused', async () => {
    // jsdom's document.hasFocus() is false by default (no real window focus) -
    // the component correctly defers onMarkRead until it believes the tab is
    // actually being looked at, same guard both apps' own originals had.
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    const onMarkRead = vi.fn();
    render(
      <ConversationThread fetchFn={async () => seed} onSend={vi.fn()} onMarkRead={onMarkRead} currentUserId="worker-1" strings={strings} />,
    );
    await waitFor(() => expect(onMarkRead).toHaveBeenCalled());
  });
});
