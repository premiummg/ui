import { describe, expect, test, vi, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackModal, type FeedbackModalLabels } from './FeedbackModal';

const labels: FeedbackModalLabels = {
  heading: 'Send feedback',
  intro: 'It goes to the admins, who can reply unless you send it anonymously.',
  messageLabel: 'Your feedback',
  messagePlaceholder: 'What is on your mind?',
  messageRequired: 'Write your feedback first.',
  imagesLabel: 'Images (optional)',
  addImages: 'Add images',
  removeImage: 'Remove image',
  imageTooLarge: 'Too large',
  tooManyImages: 'Too many',
  unsupportedImage: 'Unsupported',
  anonymousLabel: 'Send anonymously',
  anonymousNote: 'Nothing links this feedback to you and nobody can reply.',
  sendError: 'Could not send your feedback.',
  cancel: 'Cancel',
  sending: 'Sending…',
  send: 'Submit feedback',
  sentToast: 'Thanks',
};

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
});

describe('FeedbackModal', () => {
  test('sends the trimmed text, without images, not anonymous by default, and closes', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<FeedbackModal onClose={onClose} onSend={onSend} labels={labels} />);
    await userEvent.type(screen.getByLabelText('Your feedback'), '  slow reports  ');
    await userEvent.click(screen.getByRole('button', { name: 'Submit feedback' }));
    await waitFor(() => expect(onSend).toHaveBeenCalledWith({ message: 'slow reports', anonymous: false }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  test('the anonymous note shows only while the box is checked', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<FeedbackModal onClose={vi.fn()} onSend={onSend} labels={labels} />);
    expect(screen.queryByText(labels.anonymousNote)).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Send anonymously'));
    expect(screen.getByText(labels.anonymousNote)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Your feedback'), 'quiet');
    await userEvent.click(screen.getByRole('button', { name: 'Submit feedback' }));
    await waitFor(() => expect(onSend).toHaveBeenCalledWith({ message: 'quiet', anonymous: true }));
  });

  test('anonymousOnly has no checkbox, always shows the note and always sends anonymously', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<FeedbackModal onClose={vi.fn()} onSend={onSend} labels={labels} anonymousOnly />);
    expect(screen.queryByLabelText('Send anonymously')).not.toBeInTheDocument();
    expect(screen.getByText(labels.anonymousNote)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Your feedback'), 'too many meetings');
    await userEvent.click(screen.getByRole('button', { name: 'Submit feedback' }));
    await waitFor(() => expect(onSend).toHaveBeenCalledWith({ message: 'too many meetings', anonymous: true }));
  });

  test('sends the picked images', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    const { baseElement } = render(<FeedbackModal onClose={vi.fn()} onSend={onSend} labels={labels} />);
    const file = new File(['x'], 'screen.png', { type: 'image/png' });
    fireEvent.change(baseElement.querySelector('input[type="file"]')!, { target: { files: [file] } });
    await userEvent.type(screen.getByLabelText('Your feedback'), 'see this');
    await userEvent.click(screen.getByRole('button', { name: 'Submit feedback' }));
    await waitFor(() => expect(onSend).toHaveBeenCalledWith({ message: 'see this', anonymous: false, files: [file] }));
  });

  test('cannot be sent empty', () => {
    render(<FeedbackModal onClose={vi.fn()} onSend={vi.fn()} labels={labels} />);
    expect(screen.getByRole('button', { name: 'Submit feedback' })).toBeDisabled();
  });

  test('shows the error the send rejected with and stays open', async () => {
    const onClose = vi.fn();
    render(<FeedbackModal onClose={onClose} onSend={vi.fn().mockRejectedValue(new Error('There is nobody to send feedback to yet'))} labels={labels} />);
    await userEvent.type(screen.getByLabelText('Your feedback'), 'hello');
    await userEvent.click(screen.getByRole('button', { name: 'Submit feedback' }));
    expect(await screen.findByText('There is nobody to send feedback to yet')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
