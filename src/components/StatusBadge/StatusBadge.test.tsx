import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  test('renders the label and applies the given color class', () => {
    render(<StatusBadge label="approved" colorClass="bg-green-100 text-green-700" />);
    const badge = screen.getByText('approved');
    expect(badge.className).toContain('bg-green-100');
  });

  test('tone resolves one of the four standard color combos', () => {
    render(<StatusBadge label="pending" tone="warning" />);
    expect(screen.getByText('pending').className).toContain('bg-amber-100');
  });

  test('colorClass wins over tone when both are given', () => {
    render(<StatusBadge label="flagged" tone="error" colorClass="bg-blue-100" />);
    const badge = screen.getByText('flagged');
    expect(badge.className).toContain('bg-blue-100');
    expect(badge.className).not.toContain('bg-red-100');
  });

  test('defaults to neutral when neither tone nor colorClass is given', () => {
    render(<StatusBadge label="draft" />);
    expect(screen.getByText('draft').className).toContain('bg-gray-100');
  });

  test('omitting dot renders no dot element', () => {
    const { container } = render(<StatusBadge label="draft" />);
    expect(container.querySelector('.h-1\\.5.w-1\\.5')).not.toBeInTheDocument();
  });

  test('dot renders a small colored dot before the label', () => {
    const { container } = render(<StatusBadge label="approved" tone="success" dot="bg-green-500" />);
    const dot = container.querySelector('.h-1\\.5.w-1\\.5');
    expect(dot).toBeInTheDocument();
    expect(dot?.className).toContain('bg-green-500');
  });
});
