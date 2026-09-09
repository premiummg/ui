import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColorField } from './ColorField';

describe('ColorField', () => {
  test('renders its children', () => {
    render(<ColorField>content</ColorField>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  test('defaults to the Premium secondary red', () => {
    const { container } = render(<ColorField>content</ColorField>);
    expect(container.firstChild).toHaveStyle({ backgroundColor: 'var(--premium-red-dark)' });
  });

  test('a custom color overrides the default', () => {
    const { container } = render(<ColorField color="#1A2C6E">content</ColorField>);
    expect(container.firstChild).toHaveStyle({ backgroundColor: '#1A2C6E' });
  });

  test('renders the diagonal bars overlay', () => {
    const { container } = render(<ColorField>content</ColorField>);
    expect(container.querySelector('.pmg-bars')).toBeInTheDocument();
  });
});
