import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BroadcastInbox, forgetInboxView } from './BroadcastInbox';
import { BroadcastDetail } from './BroadcastDetail';
import { strings, broadcast, baseProps } from './testFixtures';

// The inbox remembers its tab between mounts; every test starts on the default one.
beforeEach(forgetInboxView);

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

  test('with showFeedback, feedback gets its own tab and leaves Sent and Received', async () => {
    const feedback = broadcast({ id: 'f1', title: 'Feedback', isFeedback: true });
    render(
      <BroadcastInbox
        {...baseProps}
        showFeedback
        strings={{ ...strings, feedbackTabLabel: 'Feedback', noFeedbackYet: 'No feedback yet.' }}
        fetchSent={async () => [broadcast()]}
        fetchReceived={async () => [feedback]}
        currentUserId="admin-1"
        canSendMessages
      />,
    );
    await waitFor(() => expect(screen.getByText('Confirm your hours')).toBeInTheDocument());
    expect(screen.queryByText('Feedback', { selector: 'span' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^Feedback$/ }));
    expect(screen.getByText('Feedback', { selector: 'span.block' })).toBeInTheDocument();
    expect(screen.queryByText('Confirm your hours')).not.toBeInTheDocument();
  });

  test('feedback on the received side can be deleted by whoever manages it', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <BroadcastInbox
        {...baseProps}
        showFeedback
        onDelete={onDelete}
        canManageBroadcast={() => true}
        strings={{ ...strings, feedbackTabLabel: 'Feedback' }}
        fetchSent={async () => []}
        fetchReceived={async () => [broadcast({ id: 'f1', title: 'Quiet note', isFeedback: true })]}
        currentUserId="admin-1"
        canSendMessages
      />,
    );
    await waitFor(() => expect(screen.getByRole('button', { name: /^Feedback$/ })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /^Feedback$/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete conversation' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('f1'));
    await waitFor(() => expect(screen.queryByText('Quiet note')).not.toBeInTheDocument());
  });

  test('feedback is not stamped as answered, though nobody was asked to reply', async () => {
    render(
      <BroadcastInbox
        {...baseProps}
        showFeedback
        strings={{ ...strings, feedbackTabLabel: 'Feedback' }}
        fetchSent={async () => []}
        fetchReceived={async () => [broadcast({ id: 'f1', title: 'Quiet note', isFeedback: true, recipients: [{ participant: { id: 'admin-1', name: 'Admin' }, respondedAt: '2026-10-05T10:00:00Z' }] })]}
        currentUserId="admin-1"
        canSendMessages
      />,
    );
    await userEvent.click(await screen.findByRole('button', { name: /^Feedback$/ }));
    await waitFor(() => expect(screen.getByText('Quiet note')).toBeInTheDocument());
    // The status filter has an "Answered" option; what must be missing is the label on the row.
    expect(screen.queryAllByText(strings.answeredLabel).filter((el) => el.tagName !== 'OPTION')).toHaveLength(0);
  });

  test('the Feedback tab counts what is unread, and the number goes away once it is read', async () => {
    const props = {
      ...baseProps, showFeedback: true, strings: { ...strings, feedbackTabLabel: 'Feedback' },
      fetchSent: async () => [], currentUserId: 'admin-1', canSendMessages: true,
    };
    const { unmount } = render(<BroadcastInbox {...props} fetchReceived={async () => [
      broadcast({ id: 'f1', title: 'New one', isFeedback: true, unread: true }),
      broadcast({ id: 'f2', title: 'Seen one', isFeedback: true, unread: false }),
    ]} />);
    expect(await screen.findByRole('button', { name: /^Feedback 1$/ })).toBeInTheDocument();
    unmount();
    render(<BroadcastInbox {...props} fetchReceived={async () => [
      broadcast({ id: 'f1', title: 'New one', isFeedback: true, unread: false }),
      broadcast({ id: 'f2', title: 'Seen one', isFeedback: true, unread: false }),
    ]} />);
    expect(await screen.findByRole('button', { name: /^Feedback$/ })).toBeInTheDocument();
  });

  test('a feedback conversation that is unread shows the unread mark, a read one does not', async () => {
    render(<BroadcastInbox {...baseProps} showFeedback strings={{ ...strings, feedbackTabLabel: 'Feedback', unreadMarkLabel: 'Not read yet' }}
      fetchSent={async () => []} currentUserId="admin-1" canSendMessages
      fetchReceived={async () => [
        broadcast({ id: 'f1', title: 'New one', isFeedback: true, unread: true }),
        broadcast({ id: 'f2', title: 'Seen one', isFeedback: true, unread: false }),
      ]} />);
    await userEvent.click(await screen.findByRole('button', { name: /^Feedback 1$/ }));
    expect(screen.getAllByRole('img', { name: 'Not read yet' })).toHaveLength(1);
  });

  test('coming back to the inbox lands on the tab it was left on', async () => {
    const props = {
      ...baseProps, showFeedback: true, strings: { ...strings, feedbackTabLabel: 'Feedback' },
      fetchSent: async () => [broadcast()], currentUserId: 'admin-1', canSendMessages: true,
      fetchReceived: async () => [broadcast({ id: 'f1', title: 'Quiet note', isFeedback: true })],
    };
    const { unmount } = render(<BroadcastInbox {...props} />);
    await userEvent.click(await screen.findByRole('button', { name: /^Feedback$/ }));
    expect(await screen.findByText('Quiet note')).toBeInTheDocument();
    unmount();
    render(<BroadcastInbox {...props} />);
    expect(await screen.findByText('Quiet note')).toBeInTheDocument();
    expect(screen.queryByText('Confirm your hours')).not.toBeInTheDocument();
  });

  test('without showFeedback there is no Feedback tab', async () => {
    render(<BroadcastInbox {...baseProps} fetchSent={async () => [broadcast()]} currentUserId="admin-1" canSendMessages />);
    await waitFor(() => expect(screen.getByText('Confirm your hours')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /Feedback/ })).not.toBeInTheDocument();
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

  test('a locked conversation shows its note instead of the composer', async () => {
    render(
      <BroadcastDetail
        {...baseProps}
        broadcastId="b1"
        onBack={vi.fn()}
        fetchSent={async () => [broadcast({ locked: 'Anonymous, cannot be answered' })]}
        currentUserId="admin-1"
        canSendMessages
      />,
    );
    await waitFor(() => expect(screen.getByText('Anonymous, cannot be answered')).toBeInTheDocument());
    expect(screen.queryByPlaceholderText('Type a message…')).not.toBeInTheDocument();
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

  describe('Other sent (an admin-all account reading the rest of a division)', () => {
    test('the tab only appears when fetchDivisionSent is given', async () => {
      render(
        <BroadcastInbox
          {...baseProps}
          fetchSent={async () => []}
          currentUserId="admin-1"
          canSendMessages
        />,
      );
      await waitFor(() => expect(screen.getByText(strings.noSentYet)).toBeInTheDocument());
      expect(screen.queryByRole('button', { name: /Other sent/ })).not.toBeInTheDocument();
    });

    test('shows what the rest of the division sent, with the real sender name, separately from the caller\'s own Sent tab', async () => {
      render(
        <BroadcastInbox
          {...baseProps}
          strings={{ ...strings, otherSentTabLabel: 'Other sent' }}
          fetchSent={async () => [broadcast({ id: 'own', title: 'My own message', createdBy: 'admin-1' })]}
          fetchDivisionSent={async () => [broadcast({ id: 'theirs', title: 'Someone else\'s message', createdBy: 'admin-2', senderName: 'Another Admin' })]}
          currentUserId="admin-1"
          canSendMessages
        />,
      );
      await waitFor(() => expect(screen.getByText('My own message')).toBeInTheDocument());
      expect(screen.queryByText('Someone else\'s message')).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /^Other sent/ }));
      expect(screen.getByText('Someone else\'s message')).toBeInTheDocument();
      expect(screen.getByText(/Sent by Another Admin/)).toBeInTheDocument();
      expect(screen.queryByText('My own message')).not.toBeInTheDocument();
    });

    test('can be managed (deleted) like any other sent broadcast, when canManageBroadcast allows it', async () => {
      const onDelete = vi.fn().mockResolvedValue(undefined);
      render(
        <BroadcastInbox
          {...baseProps}
          onDelete={onDelete}
          canManageBroadcast={() => true}
          strings={{ ...strings, otherSentTabLabel: 'Other sent' }}
          fetchSent={async () => []}
          fetchDivisionSent={async () => [broadcast({ id: 'theirs', title: 'Someone else\'s message', createdBy: 'admin-2', senderName: 'Another Admin' })]}
          currentUserId="admin-1"
          canSendMessages
        />,
      );
      await userEvent.click(await screen.findByRole('button', { name: /^Other sent/ }));
      await waitFor(() => expect(screen.getByText('Someone else\'s message')).toBeInTheDocument());
      await userEvent.click(screen.getByRole('button', { name: 'Delete conversation' }));
      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
      await waitFor(() => expect(onDelete).toHaveBeenCalledWith('theirs'));
      await waitFor(() => expect(screen.queryByText('Someone else\'s message')).not.toBeInTheDocument());
    });
  });
});

describe('the number on a tab', () => {
  test('feedback has its own tab, so Received does not count it', async () => {
    render(<BroadcastInbox {...baseProps} showFeedback strings={{ ...strings, feedbackTabLabel: 'Feedback' }}
      fetchSent={async () => []} currentUserId="admin-1" canSendMessages
      fetchReceived={async () => [
        broadcast({ id: 'a', title: 'One' }),
        broadcast({ id: 'f1', title: 'Fb 1', isFeedback: true }),
        broadcast({ id: 'f2', title: 'Fb 2', isFeedback: true }),
      ]} />);
    // Opened, Received says how many it lists, and the feedback is not among them.
    await userEvent.click(await screen.findByRole('button', { name: /^Received/ }));
    expect(screen.getByRole('button', { name: /^Received 1$/ })).toBeInTheDocument();
  });

  const props = (over: Record<string, unknown> = {}) => ({
    ...baseProps, strings: { ...strings, otherSentTabLabel: 'Other sent' }, currentUserId: 'admin-1', canSendMessages: true, ...over,
  });
  const many = (n: number, over: Partial<Parameters<typeof broadcast>[0]> = {}) =>
    Array.from({ length: n }, (_, i) => broadcast({ id: `m${i}`, title: `Msg ${i}`, ...over }));

  test('closed, Sent has no number, Received and Other sent say what is unread; opened, each says its total', async () => {
    render(<BroadcastInbox {...props()}
      fetchSent={async () => many(4)}
      fetchReceived={async () => [...many(3, { createdBy: 'admin-2' }).map((b, i) => ({ ...b, id: `r${i}`, unread: i === 0 }))]}
      fetchDivisionSent={async () => many(5, { createdBy: 'admin-2' }).map((b, i) => ({ ...b, id: `d${i}`, unread: i < 2 }))} />);
    expect(await screen.findByRole('button', { name: /^Sent 4$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Received 1$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Other sent 2$/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^Received/ }));
    expect(screen.getByRole('button', { name: /^Received 3$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Sent$/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^Other sent/ }));
    expect(screen.getByRole('button', { name: /^Other sent 5$/ })).toBeInTheDocument();
  });

  test('nothing unread leaves Received and Other sent without a number', async () => {
    render(<BroadcastInbox {...props()} fetchSent={async () => many(2)} fetchReceived={async () => many(2, { createdBy: 'admin-2' })}
      fetchDivisionSent={async () => many(2, { createdBy: 'admin-2' })} />);
    expect(await screen.findByRole('button', { name: /^Received$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Other sent$/ })).toBeInTheDocument();
  });

  test('a number past 99 is shown as 99+ while closed, and in full once the tab is open', async () => {
    render(<BroadcastInbox {...props()} fetchSent={async () => []}
      fetchReceived={async () => many(120, { createdBy: 'admin-2', unread: true })} />);
    expect(await screen.findByRole('button', { name: /^Received 99\+$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Unread \(99\+\)/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^Received/ }));
    expect(screen.getByRole('button', { name: /^Received 120$/ })).toBeInTheDocument();
  });
});
