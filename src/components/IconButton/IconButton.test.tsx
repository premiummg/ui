import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  test('is named by its aria-label and fires onClick', async () => {
    const onClick = vi.fn();
    render(<IconButton aria-label="Edit vendor" onClick={onClick}>x</IconButton>);
    await userEvent.click(screen.getByRole('button', { name: 'Edit vendor' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('the label doubles as the tooltip unless a title is given', () => {
    const { rerender } = render(<IconButton aria-label="Delete">x</IconButton>);
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Delete');
    rerender(<IconButton aria-label="Delete" title="Delete vendor">x</IconButton>);
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Delete vendor');
  });

  test('never submits a parent form by accident', () => {
    render(<IconButton aria-label="Refresh">x</IconButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  test('tones and sizes pick their classes', () => {
    const { rerender } = render(<IconButton aria-label="a" tone="danger">x</IconButton>);
    expect(screen.getByRole('button').className).toContain('hover:text-red-600');
    rerender(<IconButton aria-label="a" tone="onColor" size="md">x</IconButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('border-white/25');
    expect(button.className).toContain('w-9');
  });

  test('disabled does not fire onClick', async () => {
    const onClick = vi.fn();
    render(<IconButton aria-label="a" onClick={onClick} disabled>x</IconButton>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
