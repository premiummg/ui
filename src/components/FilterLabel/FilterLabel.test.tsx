import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterLabel } from './FilterLabel';

describe('FilterLabel', () => {
  test('renders its text', () => {
    render(<FilterLabel text="Status" />);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});
