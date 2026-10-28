import { describe, expect, test, vi, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ImageAttachmentPicker, AttachmentImages } from './ImageAttachments';
import { ConversationThread } from '../ConversationThread/ConversationThread';

const strings = { addLabel: 'Add images', removeLabel: 'Remove', tooLargeLabel: 'Too large', tooManyLabel: 'Too many' };

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
});

function Harness({ maxFiles, maxBytes }: { maxFiles?: number; maxBytes?: number }) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <>
      <ImageAttachmentPicker files={files} onChange={setFiles} strings={strings} maxFiles={maxFiles} maxBytes={maxBytes} />
      <p data-testid="count">{files.length}</p>
    </>
  );
}

const png = (name: string, size = 10) => new File([new Uint8Array(size)], name, { type: 'image/png' });

describe('ImageAttachmentPicker', () => {
  test('adds picked images, ignores non-images and removes one', async () => {
    const { container } = render(<Harness />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [png('a.png'), new File(['x'], 'b.txt', { type: 'text/plain' })] } });
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
    await userEvent.click(screen.getByRole('button', { name: 'Remove: a.png' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  test('rejects an image over the size limit with a message', async () => {
    const { container } = render(<Harness maxBytes={5} />);
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [png('big.png', 50)] } });
    await waitFor(() => expect(screen.getByText('Too large')).toBeInTheDocument());
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  test('stops at the maximum number of images', async () => {
    const { container } = render(<Harness maxFiles={2} />);
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [png('1.png'), png('2.png'), png('3.png')] } });
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'));
    expect(screen.getByText('Too many')).toBeInTheDocument();
  });
});

describe('AttachmentImages', () => {
  test('asks for each image url and renders it', async () => {
    const getUrl = vi.fn(async (id: string) => `https://files.test/${id}.png`);
    render(<AttachmentImages attachments={[{ id: 'a1', name: 'shot.png', mimeType: 'image/png' }]} getUrl={getUrl} />);
    await waitFor(() => expect(screen.getByAltText('shot.png')).toHaveAttribute('src', 'https://files.test/a1.png'));
    expect(getUrl).toHaveBeenCalledWith('a1');
  });

  test('renders nothing without attachments or a resolver', () => {
    const { container } = render(<AttachmentImages attachments={[]} getUrl={async () => ''} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ConversationThread with images', () => {
  const threadStrings = { placeholder: 'Type a message…', send: 'Send', readTooltipRead: 'Read', readTooltipUnread: 'Unread', loadError: 'err', sendError: 'send err', attachImagesLabel: 'Add images' };

  test('sends the picked images together with the text', async () => {
    const onSend = vi.fn(async (body: string) => ({ id: 'm1', authorId: 'me', authorName: 'Me', body, createdAt: new Date().toISOString() }));
    const { container } = render(
      <ConversationThread fetchFn={async () => []} onSend={onSend} currentUserId="me" strings={threadStrings} getAttachmentUrl={async () => 'u'} />,
    );
    await waitFor(() => expect(screen.getByPlaceholderText('Type a message…')).toBeInTheDocument());
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [png('a.png')] } });
    await userEvent.type(screen.getByPlaceholderText('Type a message…'), 'look');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(onSend).toHaveBeenCalled());
    const [body, files] = onSend.mock.calls[0] as unknown as [string, File[]];
    expect(body).toBe('look');
    expect(files).toHaveLength(1);
  });

  test('has no image button when the app does not turn images on', async () => {
    render(<ConversationThread fetchFn={async () => []} onSend={vi.fn()} currentUserId="me" strings={threadStrings} />);
    await waitFor(() => expect(screen.getByPlaceholderText('Type a message…')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Add images' })).not.toBeInTheDocument();
  });
});
