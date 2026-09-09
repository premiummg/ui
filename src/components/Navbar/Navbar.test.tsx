import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  test('renders the logo and the given actions', () => {
    render(
      <Navbar>
        <button>Sign out</button>
      </Navbar>,
    );
    expect(screen.getByAltText('Premium Management Group')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  test('defaults to the black tone', () => {
    const { container } = render(<Navbar />);
    expect(container.querySelector('header')!.className).toContain('dark:bg-(--premium-black)');
  });

  test('the texture overlay only renders for tones that use it (black), not steel/dark', () => {
    const { container: black } = render(<Navbar tone="black" />);
    const { container: steel } = render(<Navbar tone="steel" />);
    const { container: dark } = render(<Navbar tone="dark" />);
    expect(black.querySelector('.pmg-texture')).toBeInTheDocument();
    expect(steel.querySelector('.pmg-texture')).not.toBeInTheDocument();
    expect(dark.querySelector('.pmg-texture')).not.toBeInTheDocument();
  });

  test('renders with no children at all', () => {
    render(<Navbar />);
    expect(screen.getByAltText('Premium Management Group')).toBeInTheDocument();
  });
});
