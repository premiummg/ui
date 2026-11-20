import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CredentialCard } from './CredentialCard';
import { PasswordResultsDialog } from './PasswordResultsDialog';

const writeText = vi.fn(() => Promise.resolve());
beforeEach(() => {
  writeText.mockClear();
  Object.assign(navigator, { clipboard: { writeText } });
});

describe('CredentialCard', () => {
  test('copies the password, or the copy text, and the share message', async () => {
    const onDone = vi.fn();
    render(<CredentialCard email="ana@x.com" password="abc123" copyText="Mail: ana@x.com" shareText="Hi Ana" onDone={onDone} />);
    expect(screen.getByText('ana@x.com')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /copy password/i }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('Mail: ana@x.com'));
    expect(await screen.findByRole('button', { name: /copied/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('Hi Ana'));
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onDone).toHaveBeenCalled();
  });
});

describe('PasswordResultsDialog', () => {
  test('lists the passwords, copies them all and closes only from its button', async () => {
    const onClose = vi.fn();
    render(<PasswordResultsDialog outcome={{ passwords: [{ name: 'Ana', password: 'p1' }], failed: ['Luis'] }} onClose={onClose} />);
    expect(screen.getByText('New temporary passwords')).toBeInTheDocument();
    expect(screen.getByText('Luis')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Copy all' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('Ana: p1'));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  test('without passwords it says who failed and closes freely', () => {
    const onClose = vi.fn();
    render(<PasswordResultsDialog outcome={{ passwords: null, failed: ['Luis'] }} onClose={onClose} />);
    expect(screen.getByText('Password reset')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy all' })).toBeNull();
  });
});
