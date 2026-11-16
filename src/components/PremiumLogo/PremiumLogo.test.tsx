import { describe, expect, test, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PremiumLogo } from './PremiumLogo';

describe('PremiumLogo', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  test('renders an image with the brand alt text', () => {
    render(<PremiumLogo mode="light" />);
    expect(screen.getByAltText('Premium Management Group')).toBeInTheDocument();
  });

  test('auto renders both assets and lets html.dark pick through CSS', () => {
    render(<PremiumLogo variant="horizontal" />);
    const [light, dark] = screen.getAllByAltText('Premium Management Group') as HTMLImageElement[];
    expect(light.src).toContain('horizontal-light');
    expect(light).toHaveClass('dark:hidden');
    expect(dark.src).toContain('horizontal-dark');
    expect(dark).toHaveClass('hidden', 'dark:inline');
  });

  test('auto renders without touching document during render (prerender-safe)', async () => {
    const { renderToString } = await import('react-dom/server');
    const html = renderToString(<PremiumLogo variant="stacked" />);
    expect(html).toContain('stacked-light');
    expect(html).toContain('stacked-dark');
  });

  test('mode="dark" pins the dark asset regardless of html.dark', () => {
    render(<PremiumLogo variant="stacked" mode="dark" />);
    expect((screen.getByAltText('Premium Management Group') as HTMLImageElement).src).toContain('stacked-dark');
  });

  test('mode="light" pins the light asset even when html.dark is present', () => {
    document.documentElement.classList.add('dark');
    render(<PremiumLogo variant="horizontal" mode="light" />);
    expect((screen.getByAltText('Premium Management Group') as HTMLImageElement).src).toContain('horizontal-light');
  });

  test('a pinned mode does not react to html.dark changing after mount', async () => {
    render(<PremiumLogo variant="stacked" mode="light" />);
    const img = screen.getByAltText('Premium Management Group') as HTMLImageElement;
    document.documentElement.classList.add('dark');
    await new Promise(r => setTimeout(r, 0));
    expect(img.src).toContain('stacked-light');
  });

  test('defaults to the English asset', () => {
    render(<PremiumLogo variant="stacked" mode="light" />);
    const img = screen.getByAltText('Premium Management Group') as HTMLImageElement;
    expect(img.src).toContain('stacked-light');
    expect(img.src).not.toContain('stacked-light-fr');
  });

  test('lang="fr" swaps to the French asset, independently of light/dark mode', () => {
    render(<PremiumLogo variant="stacked" mode="dark" lang="fr" />);
    const img = screen.getByAltText('Premium Management Group') as HTMLImageElement;
    expect(img.src).toContain('stacked-dark-fr');
  });

  test('lang="fr" works for the horizontal variant too', () => {
    render(<PremiumLogo variant="horizontal" mode="light" lang="fr" />);
    const img = screen.getByAltText('Premium Management Group') as HTMLImageElement;
    expect(img.src).toContain('horizontal-light-fr');
  });
});
