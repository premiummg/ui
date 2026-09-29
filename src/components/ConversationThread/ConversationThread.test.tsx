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
