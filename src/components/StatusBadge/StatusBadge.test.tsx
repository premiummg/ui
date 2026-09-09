import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  test('renders the label and applies the given color class', () => {
    render(<StatusBadge label="approved" colorClass="bg-green-100 text-green-700" />);
    const badge = screen.getByText('approved');
    expect(badge.className).toContain('bg-green-100');
  });
});
