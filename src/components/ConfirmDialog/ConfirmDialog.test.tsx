import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiTrash2 } from 'react-icons/fi';
import { ConfirmDialog } from './ConfirmDialog';

const baseProps = {
  icon: FiTrash2,
  title: 'Delete this item?',
  message: 'This cannot be undone.',
  confirmLabel: 'Delete',
};

describe('ConfirmDialog', () => {
  test('renders nothing when closed', () => {
    render(<ConfirmDialog {...baseProps} open={false} onClose={() => {}} />);
    expect(screen.queryByText('Delete this item?')).not.toBeInTheDocument();
  });

  test('shows title, message, and both buttons when open', () => {
    render(<ConfirmDialog {...baseProps} open onClose={() => {}} />);
    expect(screen.getByText('Delete this item?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('clicking confirm calls onConfirm, not onClose', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<ConfirmDialog {...baseProps} open onClose={onClose} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByText('Delete'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  test('clicking confirm falls back to onClose when onConfirm is omitted', async () => {
    const onClose = vi.fn();
    render(<ConfirmDialog {...baseProps} open onClose={onClose} />);
    await userEvent.click(screen.getByText('Delete'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('clicking cancel calls onClose', async () => {
    const onClose = vi.fn();
    render(<ConfirmDialog {...baseProps} open onClose={onClose} />);
    await userEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('actions replace the default confirm/cancel pair', async () => {
    const saveDraft = vi.fn();
    const discard = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        {...baseProps}
        open
        onClose={onClose}
        actions={[
          { label: 'Save draft', onClick: saveDraft, variant: 'primary' },
          { label: 'Discard', onClick: discard, variant: 'danger' },
        ]}
      />,
    );
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('Save draft'));
    expect(saveDraft).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByText('Discard'));
    expect(discard).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
