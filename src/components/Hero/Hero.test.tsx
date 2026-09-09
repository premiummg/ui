import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Hero } from './Hero';

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
}

describe('Hero', () => {
  afterEach(() => vi.unstubAllGlobals());

  test('renders eyebrow, title and sub', () => {
    mockMatchMedia(false);
    render(<Hero eyebrow="Built with heart" title="Commercial construction, done right" sub="Every project." imageSrc="/poster.jpg" />);
    expect(screen.getByText('Built with heart')).toBeInTheDocument();
    expect(screen.getByText('Commercial construction, done right')).toBeInTheDocument();
    expect(screen.getByText('Every project.')).toBeInTheDocument();
  });

  test('renders a <video> when videoSrc is given and motion is not reduced', () => {
    mockMatchMedia(false);
    const { container } = render(<Hero eyebrow="e" title="t" imageSrc="/poster.jpg" videoSrc="/hero.mp4" />);
    expect(container.querySelector('video')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  test('falls back to the poster image when prefers-reduced-motion is on, even with videoSrc given', () => {
    mockMatchMedia(true);
    const { container } = render(<Hero eyebrow="e" title="t" imageSrc="/poster.jpg" videoSrc="/hero.mp4" />);
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', '/poster.jpg');
  });

  test('renders the poster image when no videoSrc is given at all', () => {
    mockMatchMedia(false);
    const { container } = render(<Hero eyebrow="e" title="t" imageSrc="/poster.jpg" />);
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  test('renders a <video> with no poster attribute when videoSrc is given alone', () => {
    mockMatchMedia(false);
    const { container } = render(<Hero eyebrow="e" title="t" videoSrc="/hero.mp4" />);
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).not.toHaveAttribute('poster');
  });

  test('renders no media at all when neither imageSrc nor videoSrc is given', () => {
    mockMatchMedia(false);
    const { container } = render(<Hero eyebrow="e" title="t" />);
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  test('primary and secondary actions render and fire their own handlers', async () => {
    mockMatchMedia(false);
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();
    render(
      <Hero
        eyebrow="e" title="t" imageSrc="/poster.jpg"
        primaryAction={{ label: 'Get an estimate', onClick: onPrimary }}
        secondaryAction={{ label: 'See our work', onClick: onSecondary }}
      />,
    );
    await userEvent.click(screen.getByText('Get an estimate'));
    await userEvent.click(screen.getByText('See our work'));
    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });

  test('the brand wedge is opt-in, off by default', () => {
    mockMatchMedia(false);
    const { container: withoutWedge } = render(<Hero eyebrow="e" title="t" imageSrc="/poster.jpg" />);
    const { container: withWedge } = render(<Hero eyebrow="e" title="t" imageSrc="/poster.jpg" wedge />);
    expect(withoutWedge.querySelector('.pmg-bars')).not.toBeInTheDocument();
    expect(withWedge.querySelector('.pmg-bars')).toBeInTheDocument();
  });

  test('defaults to the plain black scrim, no Acadian star', () => {
    mockMatchMedia(false);
    const { container } = render(<Hero eyebrow="e" title="t" imageSrc="/poster.jpg" />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(container.innerHTML).toContain('from-black/90');
  });

  test('overlay="acadian" swaps the scrim for the flag-colored gradient and blends in the star', () => {
    mockMatchMedia(false);
    const { container } = render(<Hero eyebrow="e" title="t" imageSrc="/poster.jpg" overlay="acadian" />);
    expect(container.innerHTML).toContain('#001B4D');
    expect(container.innerHTML).not.toContain('from-black/90');
    const star = container.querySelector('svg');
    expect(star).toBeInTheDocument();
    expect(star).toHaveClass('mix-blend-screen');
  });

  test('overlay="acadian" drops the diagonal texture that the plain scrim carries', () => {
    mockMatchMedia(false);
    const scrim = render(<Hero eyebrow="e" title="t" imageSrc="/poster.jpg" />);
    const acadian = render(<Hero eyebrow="e" title="t" imageSrc="/poster.jpg" overlay="acadian" />);
    expect(scrim.container.querySelector('.pmg-texture')).toBeInTheDocument();
    expect(acadian.container.querySelector('.pmg-texture')).not.toBeInTheDocument();
  });
});
