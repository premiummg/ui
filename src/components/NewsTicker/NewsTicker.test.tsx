import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewsTicker } from './NewsTicker';

const items = [
  { id: 1, title: 'New parking policy', important: false },
  { id: 2, title: 'Q3 all-hands moved', important: true },
];

describe('NewsTicker', () => {
  test('renders nothing for an empty list', () => {
    const { container } = render(<NewsTicker items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('shows the label and every headline (repeated for the loop)', () => {
    render(<NewsTicker items={items} />);
    expect(screen.getByText('Latest News')).toBeInTheDocument();
    expect(screen.getAllByText('New parking policy').length).toBeGreaterThan(1);
    expect(screen.getAllByText('Q3 all-hands moved').length).toBeGreaterThan(1);
  });

  test('a custom label replaces the default', () => {
    render(<NewsTicker items={items} label="Announcements" />);
    expect(screen.getByText('Announcements')).toBeInTheDocument();
    expect(screen.queryByText('Latest News')).not.toBeInTheDocument();
  });

  test('clicking a headline calls onItemClick with that item', async () => {
    const onItemClick = vi.fn();
    render(<NewsTicker items={items} onItemClick={onItemClick} />);
    await userEvent.click(screen.getAllByText('New parking policy')[0]);
    expect(onItemClick).toHaveBeenCalledWith(items[0]);
  });

  test('an item with an href renders as a real link', () => {
    const linked = [{ id: 3, title: 'Read the new policy', href: 'https://example.com/policy' }];
    render(<NewsTicker items={linked} />);
    const link = screen.getAllByText('Read the new policy')[0].closest('a');
    expect(link).toHaveAttribute('href', 'https://example.com/policy');
    expect(link).toHaveAttribute('target', '_blank');
  });

  test('an item without an href renders as a plain button', () => {
    render(<NewsTicker items={items} />);
    expect(screen.getAllByText('New parking policy')[0].closest('a')).toBeNull();
    expect(screen.getAllByText('New parking policy')[0].closest('button')).not.toBeNull();
  });

  test('scroll speed stays proportional to item count, even for a short list', () => {
    // No fixed floor: a 1-item list must not take as long to scroll as a
    // much longer one just because a minimum duration forced it to.
    const { container: oneItem } = render(<NewsTicker items={[items[0]]} />);
    const { container: twoItems } = render(<NewsTicker items={items} />);
    const track1 = oneItem.querySelector('.news-ticker-track') as HTMLElement;
    const track2 = twoItems.querySelector('.news-ticker-track') as HTMLElement;
    expect(track1.style.animationDuration).toBe('30s');
    expect(track2.style.animationDuration).toBe('60s');
  });
});
