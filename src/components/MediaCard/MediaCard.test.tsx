import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaCard } from './MediaCard';

describe('MediaCard', () => {
  test('renders image, title, eyebrow, and body', () => {
    render(
      <MediaCard imageSrc="/adults.jpg" imageAlt="Adult" eyebrow="Ages 14+" title="Adult">
        All levels welcomed.
      </MediaCard>,
    );
    expect(screen.getByAltText('Adult')).toHaveAttribute('src', '/adults.jpg');
    expect(screen.getByText('Adult')).toBeInTheDocument();
    expect(screen.getByText('Ages 14+')).toBeInTheDocument();
    expect(screen.getByText('All levels welcomed.')).toBeInTheDocument();
  });

  test('renders as a plain div with no onClick', () => {
    const { container } = render(
      <MediaCard imageSrc="/a.jpg" title="t">b</MediaCard>,
    );
    expect(container.querySelector('button')).not.toBeInTheDocument();
  });

  test('renders as a clickable button when onClick is given', async () => {
    const onClick = vi.fn();
    render(
      <MediaCard imageSrc="/a.jpg" title="t" onClick={onClick}>b</MediaCard>,
    );
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('omits the eyebrow line when none is given', () => {
    render(<MediaCard imageSrc="/a.jpg" title="t">b</MediaCard>);
    expect(document.querySelector('.pmg-eyebrow')).not.toBeInTheDocument();
  });
});
