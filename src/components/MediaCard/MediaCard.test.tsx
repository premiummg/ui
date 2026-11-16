import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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

  test('with href it is a real link, and a plain click goes through onClick instead of reloading', async () => {
    const onClick = vi.fn();
    render(<MediaCard imageSrc="/a.jpg" title="Firestopping" href="/firestopping" onClick={onClick}>b</MediaCard>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/firestopping');
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('with href, a modified click is left to the browser (new tab)', () => {
    const onClick = vi.fn();
    render(<MediaCard imageSrc="/a.jpg" title="t" href="/x" onClick={onClick}>b</MediaCard>);
    fireEvent.click(screen.getByRole('link'), { metaKey: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  test('aspect="wide" swaps the square photo for 16:10', () => {
    const { container } = render(<MediaCard imageSrc="/a.jpg" title="t" aspect="wide">b</MediaCard>);
    expect(container.innerHTML).toContain('aspect-[16/10]');
    expect(container.innerHTML).not.toContain('aspect-square');
  });

  test('renders the tag and footer only when given', () => {
    const { rerender } = render(<MediaCard imageSrc="/a.jpg" title="t">b</MediaCard>);
    expect(screen.queryByText('01')).not.toBeInTheDocument();
    rerender(<MediaCard imageSrc="/a.jpg" title="t" tag="01" footer={<span>Learn more</span>}>b</MediaCard>);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });
});
