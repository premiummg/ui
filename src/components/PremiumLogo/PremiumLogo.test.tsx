import { describe, expect, test, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PremiumLogo } from './PremiumLogo';

describe('PremiumLogo', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  test('renders an image with the brand alt text', () => {
    render(<PremiumLogo />);
    expect(screen.getByAltText('Premium Management Group')).toBeInTheDocument();
  });

  test('swaps to the dark asset when html.dark is present at mount', () => {
    document.documentElement.classList.add('dark');
    render(<PremiumLogo variant="horizontal" />);
    const img = screen.getByAltText('Premium Management Group') as HTMLImageElement;
    expect(img.src).toContain('horizontal-dark');
  });

  test('swaps live when html.dark is toggled after mount', async () => {
    render(<PremiumLogo variant="stacked" />);
    const img = screen.getByAltText('Premium Management Group') as HTMLImageElement;
    expect(img.src).toContain('stacked-light');

    document.documentElement.classList.add('dark');
    await new Promise(r => setTimeout(r, 0));
    expect(img.src).toContain('stacked-dark');
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
