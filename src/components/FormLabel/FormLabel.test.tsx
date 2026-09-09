import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormLabel } from './FormLabel';

describe('FormLabel', () => {
  test('renders text and links to htmlFor', () => {
    render(<FormLabel htmlFor="name" text="Name" />);
    const label = screen.getByText('Name', { exact: false });
    expect(label.closest('label')).toHaveAttribute('for', 'name');
  });

  test('required shows an asterisk, optional does not when both are set', () => {
    render(<FormLabel required optional text="Name" />);
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.queryByText('(optional)')).not.toBeInTheDocument();
  });

  test('optional alone shows the (optional) hint', () => {
    render(<FormLabel optional text="Name" />);
    expect(screen.getByText('(optional)')).toBeInTheDocument();
  });
});
