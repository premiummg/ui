import { describe, expect, test, vi, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ImageAttachmentPicker, AttachmentImages } from './ImageAttachments';
import { ConversationThread } from '../ConversationThread/ConversationThread';

const strings = { addLabel: 'Add images', removeLabel: 'Remove', tooLargeLabel: 'Too large', tooManyLabel: 'Too many', unsupportedLabel: 'Unsupported' };

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

describe('ImageAttachmentPicker formats', () => {
  test('a HEIC photo with no reported type is accepted and sent as image/heic', async () => {
    const { container } = render(<Harness />);
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [new File(['x'], 'IMG_1.HEIC', { type: '' })] } });
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
  });

  test('a format the server refuses is named instead of silently dropped', async () => {
    const { container } = render(<Harness />);
    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [new File(['x'], 'a.svg', { type: 'image/svg+xml' }), new File(['x'], 'b.avif', { type: 'image/avif' })] },
    });
    await waitFor(() => expect(screen.getByText('Unsupported')).toBeInTheDocument());
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});

describe('AttachmentImages loading', () => {
  test('asks for the url only when the image is near the screen', async () => {
    let notify: (entries: { isIntersecting: boolean }[]) => void = () => {};
    const original = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) { notify = cb; }
      observe() {}
      disconnect() {}
      unobserve() {}
    } as unknown as typeof IntersectionObserver;
    const getUrl = vi.fn(async () => 'https://files.test/a.png');
    render(<AttachmentImages attachments={[{ id: 'a1', name: 'shot.png', mimeType: 'image/png' }]} getUrl={getUrl} />);
    expect(getUrl).not.toHaveBeenCalled();
    notify([{ isIntersecting: true }]);
    await waitFor(() => expect(getUrl).toHaveBeenCalledTimes(1));
    globalThis.IntersectionObserver = original;
  });

  test('releases an object url when the image goes away', async () => {
    URL.revokeObjectURL = vi.fn();
    const { unmount } = render(<AttachmentImages attachments={[{ id: 'a1', name: 'shot.png', mimeType: 'image/png' }]} getUrl={async () => 'blob:abc'} />);
    await waitFor(() => expect(screen.getByAltText('shot.png')).toBeInTheDocument());
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:abc');
  });

  test('a url that fails to load is asked for once more before giving up', async () => {
    const getUrl = vi.fn(async () => 'https://files.test/expired.png');
    render(<AttachmentImages attachments={[{ id: 'a1', name: 'shot.png', mimeType: 'image/png' }]} getUrl={getUrl} />);
    await waitFor(() => expect(screen.getByAltText('shot.png')).toBeInTheDocument());
    fireEvent.error(screen.getByAltText('shot.png'));
    await waitFor(() => expect(getUrl).toHaveBeenCalledTimes(2));
    fireEvent.error(screen.getByAltText('shot.png'));
    await waitFor(() => expect(screen.queryByAltText('shot.png')).not.toBeInTheDocument());
    expect(screen.getByText('shot.png')).toBeInTheDocument();
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
  const threadStrings = { placeholder: 'Type a message…', send: 'Send', readTooltipRead: 'Read', readTooltipUnread: 'Unread', loadError: 'err', sendError: 'send err', attachImagesLabel: 'Add images', removeImageLabel: 'Remove', imageTooLargeLabel: 'Too large', tooManyImagesLabel: 'Too many', unsupportedImageLabel: 'Unsupported' };

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

  test('shows images but offers no attach button when the app gave no words for it', async () => {
    const { attachImagesLabel, ...withoutLabels } = threadStrings;
    void attachImagesLabel;
    render(<ConversationThread fetchFn={async () => []} onSend={vi.fn()} currentUserId="me" strings={withoutLabels} getAttachmentUrl={async () => 'u'} />);
    await waitFor(() => expect(screen.getByPlaceholderText('Type a message…')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /images/i })).not.toBeInTheDocument();
  });

  test('has no image button when the app does not turn images on', async () => {
    render(<ConversationThread fetchFn={async () => []} onSend={vi.fn()} currentUserId="me" strings={threadStrings} />);
    await waitFor(() => expect(screen.getByPlaceholderText('Type a message…')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Add images' })).not.toBeInTheDocument();
  });
});
