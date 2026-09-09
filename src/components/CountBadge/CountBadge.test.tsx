import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountBadge } from './CountBadge';

describe('CountBadge', () => {
  test('renders the count', () => {
    render(<CountBadge count={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  test('accepts a string count', () => {
    render(<CountBadge count="99+" />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });
});
