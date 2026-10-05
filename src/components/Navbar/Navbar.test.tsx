import { describe, expect, test, vi } from 'vitest';
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
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

  test('homeHref renders the logo as a real link, so middle-click can open it in a new tab', () => {
    render(<Navbar homeHref="/" onLogoClick={() => {}} />);
    expect(screen.getByRole('link', { name: 'Go to dashboard' })).toHaveAttribute('href', '/');
  });

  test('a plain left-click on a homeHref logo calls onLogoClick instead of reloading', async () => {
    const onLogoClick = vi.fn();
    render(<Navbar homeHref="/" onLogoClick={onLogoClick} />);
    const link = screen.getByRole('link', { name: 'Go to dashboard' });
    const event = createEvent.click(link, { button: 0 });
    fireEvent(link, event);
    expect(onLogoClick).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  test('a ctrl-click on a homeHref logo is left to the browser (no onLogoClick, no preventDefault)', () => {
    const onLogoClick = vi.fn();
    render(<Navbar homeHref="/" onLogoClick={onLogoClick} />);
    const link = screen.getByRole('link', { name: 'Go to dashboard' });
    const event = createEvent.click(link, { button: 0, ctrlKey: true });
    fireEvent(link, event);
    expect(onLogoClick).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  test('renders with no children at all', () => {
    render(<Navbar />);
    expect(screen.getByAltText('Premium Management Group')).toBeInTheDocument();
  });
});
