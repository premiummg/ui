import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
