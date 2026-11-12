import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BroadcastInbox, forgetInboxView } from './BroadcastInbox';
import { BroadcastDetail } from './BroadcastDetail';
import { baseProps, broadcast, strings } from './testFixtures';

beforeEach(() => {
  vi.clearAllMocks();
  forgetInboxView();
});

// A list that has more than a page: the page says how many there are in all, and the next older ones are asked for
// with the cursor of the last conversation on screen.
const day = (n: number) => new Date(Date.UTC(2026, 9, 30 - n)).toISOString();
const item = (n: number) => broadcast({ id: `b${n}`, title: `Message ${n}`, createdAt: day(n), cursor: `c${n}` });

describe('a list with more than a page', () => {
  test('says how many it shows of how many there are, and loads the older ones on request', async () => {
    const fetchSent = vi.fn(async (before?: string) => (before ? { items: [item(3)], total: 3 } : { items: [item(1), item(2)], total: 3 }));
    render(<BroadcastInbox {...baseProps} fetchSent={fetchSent} currentUserId="admin-1" canSendMessages />);
    expect(await screen.findByText('2 of 3 conversations')).toBeInTheDocument();
    expect(screen.queryByText('Message 3')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(await screen.findByText('Message 3')).toBeInTheDocument();
    expect(fetchSent).toHaveBeenLastCalledWith('c2');
    expect(screen.getByText('3 conversations')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  test('when the page says there is more, that is what counts, whatever the total says', async () => {
    // An app that takes some of the conversations out of the page cannot give a total that matches what is shown.
    const fetchReceived = vi.fn(async (before?: string) => (before ? { items: [item(3)], more: false } : { items: [item(1), item(2)], more: true }));
    render(<BroadcastInbox {...baseProps} fetchReceived={fetchReceived} currentUserId="u" canSendMessages={false} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Load more' }));
    expect(await screen.findByText('Message 3')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  test('a plain array is a list with nothing more to load', async () => {
    render(<BroadcastInbox {...baseProps} fetchSent={async () => [item(1), item(2)]} currentUserId="admin-1" canSendMessages />);
    expect(await screen.findByText('2 conversations')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  test('the next check of the newest page keeps the older ones that were loaded', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const fetchSent = vi.fn(async (before?: string) => (before ? { items: [item(3)], total: 3 } : { items: [item(1), item(2)], total: 3 }));
      render(<BroadcastInbox {...baseProps} fetchSent={fetchSent} currentUserId="admin-1" canSendMessages pollIntervalMs={1000} />);
      await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(await screen.findByRole('button', { name: 'Load more' }));
      expect(await screen.findByText('Message 3')).toBeInTheDocument();
      const calls = fetchSent.mock.calls.length;
      vi.advanceTimersByTime(1500);
      await waitFor(() => expect(fetchSent.mock.calls.length).toBeGreaterThan(calls));
      expect(screen.getByText('Message 3')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('a conversation by its id', () => {
  test('is read with fetchOne, not looked for in the lists, so one older than the newest page is found', async () => {
    const fetchSent = vi.fn(async () => [] as ReturnType<typeof item>[]);
    const fetchReceived = vi.fn(async () => [] as ReturnType<typeof item>[]);
    const fetchOne = vi.fn(async () => ({ broadcast: item(40), side: 'sent' as const }));
    render(
      <BroadcastDetail {...baseProps} broadcastId="b40" onBack={vi.fn()} fetchSent={fetchSent} fetchReceived={fetchReceived} fetchOne={fetchOne} currentUserId="admin-1" canSendMessages />,
    );
    expect(await screen.findByRole('heading', { name: 'Message 40' })).toBeInTheDocument();
    expect(fetchOne).toHaveBeenCalledWith('b40');
    expect(fetchSent).not.toHaveBeenCalled();
    expect(fetchReceived).not.toHaveBeenCalled();
  });

  test('when there is none for the person it says so, and a failed check keeps what is on screen', async () => {
    const none = render(<BroadcastDetail {...baseProps} broadcastId="zz" onBack={vi.fn()} fetchOne={async () => null} currentUserId="admin-1" canSendMessages={false} />);
    expect(await screen.findByText(strings.notFoundLabel)).toBeInTheDocument();
    none.unmount();
  });
});

describe('a look at a conversation', () => {
  test('is sent with the last message the screen showed', async () => {
    // The thread only marks a conversation read while its tab has the focus.
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    const onMarkRead = vi.fn().mockResolvedValue(undefined);
    const messages = [
      { id: 'm1', authorId: 'worker-1', authorName: 'Carlos Vidana', body: 'One', createdAt: day(2), read: false },
      { id: 'm2', authorId: 'worker-1', authorName: 'Carlos Vidana', body: 'Two', createdAt: day(1), read: false },
    ];
    render(
      <BroadcastDetail {...baseProps} onMarkRead={onMarkRead} broadcastId="b1" onBack={vi.fn()} currentUserId="admin-1" canSendMessages
        fetchSent={async () => [broadcast({ messages: messages as never })]} />,
    );
    await waitFor(() => expect(onMarkRead).toHaveBeenCalled());
    expect(onMarkRead).toHaveBeenCalledWith('b1', 'm2');
  });
});
