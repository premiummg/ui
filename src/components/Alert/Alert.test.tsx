import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from './Alert';

describe('Alert', () => {
  test('defaults to the error variant', () => {
    render(<Alert text="message" />);
    expect(screen.getByText('message').closest('div')!.className).toContain('bg-red-50');
  });

  test.each(['error', 'success', 'warning', 'info'] as const)('renders the %s variant with its icon', (variant) => {
    render(<Alert variant={variant} text="message" />);
    expect(screen.getByText('message')).toBeInTheDocument();
  });

  test('renders no action button when none is given', () => {
    render(<Alert text="message" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders and fires the action button when one is given', async () => {
    const onClick = vi.fn();
    render(<Alert text="message" action={{ label: 'Retry', onClick }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
