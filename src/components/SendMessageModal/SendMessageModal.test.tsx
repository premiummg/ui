import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SendMessageModal, SendMessageModalLabels } from './SendMessageModal';

const labels: SendMessageModalLabels = {
  heading: 'Send a message',
  to: 'To',
  recipientCount: (n) => `${n} ${n === 1 ? 'person' : 'people'}`,
  titleLabel: 'Title',
  titlePlaceholder: 'e.g. Safety meeting Friday',
  messageLabel: 'Message',
  messagePlaceholder: 'What do they need to know?',
  responseLabel: 'How should they respond?',
  justConfirmTitle: 'Just confirm',
  justConfirmDescription: 'One tap on "Got it". Use for announcements.',
  writtenReplyTitle: 'Written reply',
  writtenReplyDescription: 'They type an answer you can read back.',
  titleRequired: 'Title is required.',
  messageRequired: 'Message is required.',
  sendError: 'Could not send the message.',
  cancel: 'Cancel',
  sending: 'Sending…',
  send: 'Send',
  sentToast: (recipientLabel) => `Message sent to ${recipientLabel}`,
};

async function fillAndSend() {
  await userEvent.type(screen.getByPlaceholderText(labels.titlePlaceholder), 'Safety meeting');
  await userEvent.type(screen.getByPlaceholderText(labels.messagePlaceholder), 'Friday at 3pm');
  await userEvent.click(screen.getByText('Send'));
}

describe('SendMessageModal', () => {
  test('shows joined recipient names when given', () => {
    render(
      <SendMessageModal recipientIds={['1', '2']} recipientNames={['Ada', 'Grace']} onClose={vi.fn()} onSend={vi.fn()} labels={labels} />,
    );
    expect(screen.getByText('Ada, Grace')).toBeInTheDocument();
  });

  test('falls back to a plain count when recipientNames is omitted', () => {
    render(<SendMessageModal recipientIds={['1', '2', '3']} onClose={vi.fn()} onSend={vi.fn()} labels={labels} />);
    expect(screen.getByText('3 people')).toBeInTheDocument();
  });

  test('blocks submit with a validation message when title is empty', async () => {
    const onSend = vi.fn();
    render(<SendMessageModal recipientIds={['1']} onClose={vi.fn()} onSend={onSend} labels={labels} />);
    await userEvent.type(screen.getByPlaceholderText(labels.messagePlaceholder), 'hi');
    // Submit button is disabled while title is empty - submit the form directly.
    screen.getByText('Send').closest('form')!.requestSubmit();
    expect(onSend).not.toHaveBeenCalled();
  });

  test('a valid submit calls onSend with the trimmed fields and default reply mode', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<SendMessageModal recipientIds={['1']} onClose={vi.fn()} onSend={onSend} labels={labels} />);
    await fillAndSend();
    expect(onSend).toHaveBeenCalledWith({ title: 'Safety meeting', message: 'Friday at 3pm', requiresReply: false });
  });

  test('selecting "written reply" passes requiresReply: true', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<SendMessageModal recipientIds={['1']} onClose={vi.fn()} onSend={onSend} labels={labels} />);
    await userEvent.click(screen.getByText('Written reply'));
    await fillAndSend();
    expect(onSend).toHaveBeenCalledWith(expect.objectContaining({ requiresReply: true }));
  });

  test('calls onSent then onClose after a successful send', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    const onSent = vi.fn();
    const onClose = vi.fn();
    render(<SendMessageModal recipientIds={['1']} onClose={onClose} onSend={onSend} onSent={onSent} labels={labels} />);
    await fillAndSend();
    expect(onSent).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('a rejection with a message shows that message and does not close', async () => {
    const onSend = vi.fn().mockRejectedValue(new Error('Network down'));
    const onClose = vi.fn();
    render(<SendMessageModal recipientIds={['1']} onClose={onClose} onSend={onSend} labels={labels} />);
    await fillAndSend();
    expect(await screen.findByText('Network down')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  test('a rejection with no message falls back to labels.sendError', async () => {
    const onSend = vi.fn().mockRejectedValue(new Error());
    render(<SendMessageModal recipientIds={['1']} onClose={vi.fn()} onSend={onSend} labels={labels} />);
    await fillAndSend();
    expect(await screen.findByText('Could not send the message.')).toBeInTheDocument();
  });
});
