import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  test('shows the initials of a two-word name', () => {
    render(<Avatar fullName="Jordan Reid" />);
    expect(screen.getByText('JR')).toBeInTheDocument();
  });

  test('caps at two letters for a longer name', () => {
    render(<Avatar fullName="Jordan Ray Reid" />);
    expect(screen.getByText('JR')).toBeInTheDocument();
  });

  test('uppercases a lowercase name', () => {
    render(<Avatar fullName="jordan reid" />);
    expect(screen.getByText('JR')).toBeInTheDocument();
  });

  test('size controls both dimensions', () => {
    const { container } = render(<Avatar fullName="Jordan Reid" size={64} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe('64px');
    expect(el.style.height).toBe('64px');
  });

  test('a custom color overrides the default background', () => {
    const { container } = render(<Avatar fullName="Jordan Reid" color="#2563eb" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.backgroundColor).toBe('rgb(37, 99, 235)');
    expect(el.className).not.toContain('premium-steel-grey');
  });
});
