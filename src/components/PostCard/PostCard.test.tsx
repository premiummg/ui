import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostCard } from './PostCard';

const BASE = {
  category: 'Site safety',
  title: 'Working at height',
  excerpt: 'The checks our lift crews run.',
  date: '2026-10-27',
  dateLabel: 'October 27, 2026',
  href: '/blog/working-at-height',
};

describe('PostCard', () => {
  test('renders category, title, excerpt, date and read time', () => {
    render(<PostCard {...BASE} readTime="4 min read" imageSrc="/a.jpg" imageAlt="Boom lift" />);
    expect(screen.getByText('Site safety')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Working at height' })).toBeInTheDocument();
    expect(screen.getByText('The checks our lift crews run.')).toBeInTheDocument();
    expect(screen.getByText('October 27, 2026').tagName).toBe('TIME');
    expect(screen.getByText('October 27, 2026')).toHaveAttribute('datetime', '2026-10-27');
    expect(screen.getByText('4 min read')).toBeInTheDocument();
    expect(screen.getByAltText('Boom lift')).toBeInTheDocument();
  });

  test('the title is the one link, named after the post', () => {
    render(<PostCard {...BASE} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName('Working at height');
    expect(links[0]).toHaveAttribute('href', '/blog/working-at-height');
  });

  test('no image renders the hatched placeholder instead', () => {
    const { container } = render(<PostCard {...BASE} />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('.pmg-texture')).toBeInTheDocument();
  });

  test('onNavigate takes a plain click and leaves a modified one to the browser', async () => {
    const onNavigate = vi.fn();
    render(<PostCard {...BASE} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('link'), { ctrlKey: true });
    expect(onNavigate).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('link'));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  test('titleAs="h2" raises the heading level', () => {
    render(<PostCard {...BASE} titleAs="h2" />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });
});
