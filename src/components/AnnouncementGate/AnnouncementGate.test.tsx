import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnnouncementGate, AnnouncementGateLabels, AnnouncementItem } from './AnnouncementGate';

const labels: AnnouncementGateLabels = {
  messageFrom: 'Message from',
  defaultSender: 'your administrator',
  queuePosition: (total) => `1 of ${total}`,
  replyLabel: 'Your reply',
  replyPlaceholder: 'Type your response…',
  replyRequiredError: 'Please write a reply before continuing.',
  sendError: 'Could not send your response. Try again.',
  sending: 'Sending…',
  sendReply: 'Send reply',
  gotIt: 'Got it',
  needsReplyNotice: 'This message needs a reply before you can carry on.',
  confirmReadNotice: 'Confirm you have read this to carry on.',
  waitingBehind: (n) => ` ${n} more ${n === 1 ? 'is' : 'are'} waiting behind it.`,
  noTask: 'No task',
  lunch: 'Lunch',
  dateLocale: 'en-CA',
};

function item(overrides: Partial<AnnouncementItem> = {}): AnnouncementItem {
  return {
    id: '1',
    sender_name: 'Jordan Reid',
    title: 'Please confirm',
    message: 'Did you really work these hours?',
    requires_reply: false,
    ...overrides,
  };
}

describe('AnnouncementGate', () => {
  test('renders nothing when the queue is empty', () => {
    const { container } = render(<AnnouncementGate queue={[]} onRespond={vi.fn()} labels={labels} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders the first item in the queue: sender, title, message', () => {
    render(<AnnouncementGate queue={[item()]} onRespond={vi.fn()} labels={labels} />);
    expect(screen.getByText('Jordan Reid')).toBeInTheDocument();
    expect(screen.getByText('Please confirm')).toBeInTheDocument();
    expect(screen.getByText('Did you really work these hours?')).toBeInTheDocument();
  });

  test('falls back to labels.defaultSender when sender_name is missing', () => {
    render(<AnnouncementGate queue={[item({ sender_name: null })]} onRespond={vi.fn()} labels={labels} />);
    expect(screen.getByText('your administrator')).toBeInTheDocument();
  });

  test('a non-reply-required item shows "Got it" and calls onRespond with an empty reply', async () => {
    const onRespond = vi.fn().mockResolvedValue(undefined);
    render(<AnnouncementGate queue={[item({ requires_reply: false })]} onRespond={onRespond} labels={labels} />);
    await userEvent.click(screen.getByText('Got it'));
    expect(onRespond).toHaveBeenCalledWith('1', '');
  });

  test('a reply-required item blocks submit until something is typed', async () => {
    const onRespond = vi.fn();
    render(<AnnouncementGate queue={[item({ requires_reply: true })]} onRespond={onRespond} labels={labels} />);
    await userEvent.click(screen.getByText('Send reply'));
    expect(onRespond).not.toHaveBeenCalled();
    expect(screen.getByText('Please write a reply before continuing.')).toBeInTheDocument();
  });

  test('typing a reply and submitting calls onRespond with the trimmed text', async () => {
    const onRespond = vi.fn().mockResolvedValue(undefined);
    render(<AnnouncementGate queue={[item({ requires_reply: true })]} onRespond={onRespond} labels={labels} />);
    await userEvent.type(screen.getByPlaceholderText('Type your response…'), '  all good  ');
    await userEvent.click(screen.getByText('Send reply'));
    expect(onRespond).toHaveBeenCalledWith('1', 'all good');
  });

  test('a rejection with a message shows that message', async () => {
    const onRespond = vi.fn().mockRejectedValue(new Error('Network down'));
    render(<AnnouncementGate queue={[item({ requires_reply: false })]} onRespond={onRespond} labels={labels} />);
    await userEvent.click(screen.getByText('Got it'));
    expect(await screen.findByText('Network down')).toBeInTheDocument();
  });

  test('a rejection with no message falls back to labels.sendError', async () => {
    const onRespond = vi.fn().mockRejectedValue(new Error());
    render(<AnnouncementGate queue={[item({ requires_reply: false })]} onRespond={onRespond} labels={labels} />);
    await userEvent.click(screen.getByText('Got it'));
    expect(await screen.findByText('Could not send your response. Try again.')).toBeInTheDocument();
  });

  test('shows the queue position and "waiting behind" count when more than one item is queued', () => {
    render(<AnnouncementGate queue={[item({ id: '1' }), item({ id: '2' })]} onRespond={vi.fn()} labels={labels} />);
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    expect(screen.getByText(/1 more is waiting behind it/)).toBeInTheDocument();
  });

  test('renders the submission-summary card only when given one', () => {
    const { rerender } = render(<AnnouncementGate queue={[item()]} onRespond={vi.fn()} labels={labels} />);
    expect(screen.queryByText('Lunch')).not.toBeInTheDocument();

    rerender(
      <AnnouncementGate
        queue={[item({
          submission_summary: {
            work_date: '2026-01-15',
            status: 'pending',
            rows: [{ project_number: '101', project_name: 'Main St', task_label: null, took_lunch: true, hours: 8 }],
          },
        })]}
        onRespond={vi.fn()}
        labels={labels}
      />,
    );
    expect(screen.getByText('Main St', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Lunch', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('No task', { exact: false })).toBeInTheDocument();
  });
});
