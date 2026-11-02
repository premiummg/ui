import { describe, expect, test } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
});
