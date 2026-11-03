import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  test('uses the first and LAST word for a 3+ word name, not the first two', () => {
    render(<Avatar fullName="Ana Maria Lopez" />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  test('falls back to a question mark for an empty name', () => {
    render(<Avatar fullName="" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  test('falls back to the first two characters for a single-word name', () => {
    render(<Avatar fullName="Madonna" />);
    expect(screen.getByText('MA')).toBeInTheDocument();
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

  test('onClick makes it a real clickable element', async () => {
    const onClick = vi.fn();
    const { container } = render(<Avatar fullName="Jordan Reid" onClick={onClick} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('cursor-pointer');
    await userEvent.click(el);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('with onClick the keyboard reaches it and Enter or Space activates it', async () => {
    const onClick = vi.fn();
    render(<Avatar fullName="Jordan Reid" onClick={onClick} />);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Jordan Reid' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  test('without onClick it stays non-interactive', () => {
    const { container } = render(<Avatar fullName="Jordan Reid" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).not.toContain('cursor-pointer');
  });

  describe('with a photo', () => {
    test('shows the photo instead of the initials', () => {
      const { container } = render(<Avatar fullName="Jordan Reid" src="/api/photos/abc?size=thumb" />);
      expect(container.querySelector('img')).toHaveAttribute('src', '/api/photos/abc?size=thumb');
      expect(screen.queryByText('JR')).not.toBeInTheDocument();
    });

    test('goes back to the initials when the photo does not load', () => {
      const { container } = render(<Avatar fullName="Jordan Reid" src="/api/photos/gone" />);
      fireEvent.error(container.querySelector('img')!);
      expect(container.querySelector('img')).toBeNull();
      expect(screen.getByText('JR')).toBeInTheDocument();
    });

    test('tries a new address after a failed one', () => {
      const { container, rerender } = render(<Avatar fullName="Jordan Reid" src="/api/photos/gone" />);
      fireEvent.error(container.querySelector('img')!);
      rerender(<Avatar fullName="Jordan Reid" src="/api/photos/new-one" />);
      expect(container.querySelector('img')).toHaveAttribute('src', '/api/photos/new-one');
    });

    test('shows the initials when there is no address, or an empty one', () => {
      const { container, rerender } = render(<Avatar fullName="Jordan Reid" src={null} />);
      expect(container.querySelector('img')).toBeNull();
      rerender(<Avatar fullName="Jordan Reid" src="" />);
      expect(container.querySelector('img')).toBeNull();
      expect(screen.getByText('JR')).toBeInTheDocument();
    });
  });

  describe('shape', () => {
    test('is a circle by default and a rounded square as a tile, with or without a photo', () => {
      const { container, rerender } = render(<Avatar fullName="Jordan Reid" />);
      expect(container.firstElementChild).toHaveClass('rounded-full');
      rerender(<Avatar fullName="Jordan Reid" shape="tile" />);
      expect(container.firstElementChild).toHaveClass('rounded-xl');
      expect(container.firstElementChild).not.toHaveClass('rounded-full');
      rerender(<Avatar fullName="Jordan Reid" shape="tile" src="/api/photos/abc" />);
      expect(container.firstElementChild).toHaveClass('rounded-xl');
    });
  });
});
