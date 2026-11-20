import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangePasswordForm } from './ChangePasswordForm';

function fill(pw: string, confirm: string) {
  fireEvent.change(screen.getByLabelText('New password'), { target: { value: pw } });
  fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: confirm } });
  fireEvent.click(screen.getByRole('button', { name: 'Set new password' }));
}

describe('ChangePasswordForm', () => {
  test('checks the length and the match before sending', () => {
    const onSubmit = vi.fn();
    render(<ChangePasswordForm onSubmit={onSubmit} onBackToSignIn={() => {}} />);
    fill('short', 'short');
    expect(screen.getByText('Minimum 8 characters')).toBeInTheDocument();
    fill('longenough', 'different');
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('sends the password and shows a failure', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Too common'));
    render(<ChangePasswordForm onSubmit={onSubmit} onBackToSignIn={() => {}} />);
    fill('longenough', 'longenough');
    expect(onSubmit).toHaveBeenCalledWith('longenough');
    await waitFor(() => expect(screen.getByText('Too common')).toBeInTheDocument());
  });
});
