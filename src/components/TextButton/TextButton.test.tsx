import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextButton } from './TextButton';

describe('TextButton', () => {
  test('renders its label and fires onClick', async () => {
    const onClick = vi.fn();
    render(<TextButton onClick={onClick}>Retry</TextButton>);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('defaults to type="button"', () => {
    render(<TextButton>Retry</TextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  test('muted is underlined gray, accent is the brand red without an underline until hover', () => {
    const { rerender } = render(<TextButton>Clear</TextButton>);
    expect(screen.getByRole('button').className).toContain('underline');
    rerender(<TextButton tone="accent">View all</TextButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('font-semibold');
    expect(button.style.color).toBe('var(--premium-red)');
  });
});
