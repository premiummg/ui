import { describe, expect, test, vi } from 'vitest';
import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfilePhoto } from './ProfilePhoto';

const base = { fullName: 'Ana Ruiz', viewLabel: 'View photo', closeLabel: 'Close' };

describe('ProfilePhoto', () => {
  test('without a photo it is the avatar with initials, and not a button', () => {
    render(<ProfilePhoto {...base} src={null} />);
    expect(screen.getByText('AR')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View photo' })).not.toBeInTheDocument();
  });

  test('with a photo it is a button that opens it large, with the name, and nothing is open before the click', async () => {
    render(<ProfilePhoto {...base} src="/api/photos/abc?size=thumb" fullSrc="/api/photos/abc" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'View photo' }));
    const dialog = await screen.findByRole('dialog');
    const large = dialog.querySelector('img')!;
    expect(large).toHaveAttribute('src', '/api/photos/abc');
    expect(large).toHaveAttribute('alt', 'Ana Ruiz');
    expect(dialog).toHaveTextContent('Ana Ruiz');
  });

  test('opens the same image when no larger one is given', async () => {
    render(<ProfilePhoto {...base} src="/api/photos/abc" />);
    await userEvent.click(screen.getByRole('button', { name: 'View photo' }));
    expect((await screen.findByRole('dialog')).querySelector('img')).toHaveAttribute('src', '/api/photos/abc');
  });

  test('closes with its button and with Escape, and the keyboard reaches it', async () => {
    render(<ProfilePhoto {...base} src="/api/photos/abc" />);
    const opener = screen.getByRole('button', { name: 'View photo' });
    opener.focus();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(opener);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('a photo that does not load falls back to the initials, large', async () => {
    render(<ProfilePhoto {...base} src="/api/photos/abc" />);
    await userEvent.click(screen.getByRole('button', { name: 'View photo' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.error(dialog.querySelector('img')!);
    expect(dialog.querySelector('img')).toBeNull();
    expect(dialog).toHaveTextContent('AR');
  });

  test('a new photo gets its own chance after one that did not load', async () => {
    const { rerender } = render(<ProfilePhoto {...base} src="/api/photos/old" />);
    await userEvent.click(screen.getByRole('button', { name: 'View photo' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.error(dialog.querySelector('img')!);
    expect(dialog.querySelector('img')).toBeNull();
    rerender(<ProfilePhoto {...base} src="/api/photos/new" />);
    expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', '/api/photos/new');
  });

  describe('taking the photo off', () => {
    const removeLabels = { remove: 'Remove photo', title: 'Remove the photo?', message: 'Their initials will be shown instead.', confirm: 'Yes, remove it', cancel: 'Keep it' };
    const open = async (extra: Record<string, unknown>) => {
      render(<ProfilePhoto {...base} src="/api/photos/abc" removeLabels={removeLabels} {...extra} />);
      await userEvent.click(screen.getByRole('button', { name: 'View photo' }));
      return screen.findByRole('dialog');
    };

    test('there is no button for it unless whoever looks may remove the photo', async () => {
      render(<ProfilePhoto {...base} src="/api/photos/abc" />);
      await userEvent.click(screen.getByRole('button', { name: 'View photo' }));
      await screen.findByRole('dialog');
      expect(screen.queryByRole('button', { name: 'Remove photo' })).not.toBeInTheDocument();
    });

    test('nor when the labels for it are missing: nothing unlabelled is ever shown', async () => {
      render(<ProfilePhoto {...base} src="/api/photos/abc" onRemove={vi.fn()} />);
      await userEvent.click(screen.getByRole('button', { name: 'View photo' }));
      await screen.findByRole('dialog');
      expect(screen.queryByRole('button', { name: 'Remove photo' })).not.toBeInTheDocument();
    });

    test('asks to confirm first, and nothing is removed until it is confirmed', async () => {
      const onRemove = vi.fn().mockResolvedValue(undefined);
      await open({ onRemove });
      await userEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
      expect(await screen.findByText('Remove the photo?')).toBeInTheDocument();
      expect(onRemove).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole('button', { name: 'Keep it' }));
      expect(onRemove).not.toHaveBeenCalled();
      expect(screen.queryByText('Remove the photo?')).not.toBeInTheDocument();
    });

    test('confirming removes it, and closes the large photo too', async () => {
      const onRemove = vi.fn().mockResolvedValue(undefined);
      await open({ onRemove });
      await userEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Yes, remove it' }));
      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('once it is off, focus stays on the avatar instead of falling to the page', async () => {
      const onRemove = vi.fn().mockResolvedValue(undefined);
      const Host = () => {
        const [src, setSrc] = useState<string | null>('/api/photos/abc');
        return <ProfilePhoto {...base} src={src} removeLabels={removeLabels} onRemove={async () => { await onRemove(); setSrc(null); }} />;
      };
      const { container } = render(<Host />);
      await userEvent.click(screen.getByRole('button', { name: 'View photo' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Remove photo' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Yes, remove it' }));
      await waitFor(() => expect(container.querySelector('span[tabindex="-1"]')).toHaveFocus());
    });

    test('a removal that fails leaves the photo, and the confirmation, to try again', async () => {
      const onRemove = vi.fn().mockRejectedValue(new Error('server'));
      await open({ onRemove });
      await userEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Yes, remove it' }));
      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Yes, remove it' })).toBeEnabled();
      expect(screen.getAllByRole('dialog').length).toBeGreaterThan(0);
    });
  });
});
