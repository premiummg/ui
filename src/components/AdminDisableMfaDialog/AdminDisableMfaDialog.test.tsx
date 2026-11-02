import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminDisableMfaDialog, AdminDisableMfaDialogLabels } from './AdminDisableMfaDialog';

const labels: AdminDisableMfaDialogLabels = {
  title: (name) => `Disable MFA for ${name}?`,
  body: 'They will need to set up MFA again on next login.',
  confirmLabel: 'Disable MFA',
  disabling: 'Disabling…',
  cancelLabel: 'Cancel',
};

describe('AdminDisableMfaDialog', () => {
  test('renders nothing when closed', () => {
    render(<AdminDisableMfaDialog open={false} onClose={vi.fn()} targetName="Ada Lovelace" onConfirm={vi.fn()} labels={labels} />);
    expect(screen.queryByText('Disable MFA for Ada Lovelace?')).not.toBeInTheDocument();
  });

  test('shows the target name in the title when open', () => {
    render(<AdminDisableMfaDialog open onClose={vi.fn()} targetName="Ada Lovelace" onConfirm={vi.fn()} labels={labels} />);
    expect(screen.getByText('Disable MFA for Ada Lovelace?')).toBeInTheDocument();
  });

  test('confirming calls onConfirm and then onClose on success', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<AdminDisableMfaDialog open onClose={onClose} targetName="Ada Lovelace" onConfirm={onConfirm} labels={labels} />);
    await userEvent.click(screen.getByText('Disable MFA'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('a rejected onConfirm keeps the dialog open instead of closing it', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('Server error'));
    const onClose = vi.fn();
    render(<AdminDisableMfaDialog open onClose={onClose} targetName="Ada Lovelace" onConfirm={onConfirm} labels={labels} />);
    await userEvent.click(screen.getByText('Disable MFA'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('Disable MFA for Ada Lovelace?')).toBeInTheDocument();
  });

  test('cancelling calls onClose without calling onConfirm', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<AdminDisableMfaDialog open onClose={onClose} targetName="Ada Lovelace" onConfirm={onConfirm} labels={labels} />);
    await userEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  describe('asking for the password of the admin', () => {
    const withPassword: AdminDisableMfaDialogLabels = { ...labels, passwordLabel: 'Your password' };

    test('there is no field when no label for it is given', () => {
      render(<AdminDisableMfaDialog open onClose={vi.fn()} targetName="Ada Lovelace" onConfirm={vi.fn()} labels={labels} />);
      expect(screen.queryByLabelText('Your password')).not.toBeInTheDocument();
    });

    test('the field has a visible label, and confirming is not possible until it is filled', async () => {
      render(<AdminDisableMfaDialog open onClose={vi.fn()} targetName="Ada Lovelace" onConfirm={vi.fn()} labels={withPassword} />);
      expect(screen.getByLabelText('Your password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Disable MFA' })).toBeDisabled();
      await userEvent.type(screen.getByLabelText('Your password'), 'secret-one');
      expect(screen.getByRole('button', { name: 'Disable MFA' })).toBeEnabled();
    });

    test('the password is handed to onConfirm', async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      render(<AdminDisableMfaDialog open onClose={vi.fn()} targetName="Ada Lovelace" onConfirm={onConfirm} labels={withPassword} />);
      await userEvent.type(screen.getByLabelText('Your password'), 'secret-one');
      await userEvent.click(screen.getByRole('button', { name: 'Disable MFA' }));
      expect(onConfirm).toHaveBeenCalledWith('secret-one');
    });

    test('a refused attempt keeps the dialog open with the password still there to correct', async () => {
      const onConfirm = vi.fn().mockRejectedValue(new Error('Incorrect password'));
      render(<AdminDisableMfaDialog open onClose={vi.fn()} targetName="Ada Lovelace" onConfirm={onConfirm} labels={withPassword} />);
      await userEvent.type(screen.getByLabelText('Your password'), 'wrong');
      await userEvent.click(screen.getByRole('button', { name: 'Disable MFA' }));
      expect(screen.getByLabelText('Your password')).toHaveValue('wrong');
    });

    test('the password is forgotten when the dialog is cancelled', async () => {
      const onClose = vi.fn();
      const { rerender } = render(<AdminDisableMfaDialog open onClose={onClose} targetName="Ada Lovelace" onConfirm={vi.fn()} labels={withPassword} />);
      await userEvent.type(screen.getByLabelText('Your password'), 'secret-one');
      await userEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
      rerender(<AdminDisableMfaDialog open onClose={onClose} targetName="Ada Lovelace" onConfirm={vi.fn()} labels={withPassword} />);
      expect(screen.getByLabelText('Your password')).toHaveValue('');
    });
  });
});
