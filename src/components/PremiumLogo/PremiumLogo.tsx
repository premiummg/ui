import { useState, useEffect } from 'react';
import stackedLight from '../../logos/stacked-light.png';
import stackedDark from '../../logos/stacked-dark.png';
import horizontalLight from '../../logos/horizontal-light.png';
import horizontalDark from '../../logos/horizontal-dark.png';

export type PremiumLogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type PremiumLogoVariant = 'stacked' | 'horizontal';

const SIZES: Record<PremiumLogoSize, string> = {
  sm: 'h-12',
  md: 'h-16',
  lg: 'h-24',
  xl: 'h-44',
};

const LOGOS: Record<PremiumLogoVariant, { light: string; dark: string }> = {
  stacked: { light: stackedLight, dark: stackedDark },
  horizontal: { light: horizontalLight, dark: horizontalDark },
};

export interface PremiumLogoProps {
  size?: PremiumLogoSize;
  variant?: PremiumLogoVariant;
  // 'auto' (default) watches html.dark and swaps artwork with the theme -
  // right for a surface that itself flips with the theme (a card, a page
  // background). Wrong for a surface whose own color is FIXED regardless of
  // theme (a solid-red band, a footer that's always Premium Black): pass
  // 'light' or 'dark' there to pin the artwork to what that surface actually
  // needs, independent of whatever theme the visitor has chosen.
  mode?: 'auto' | 'light' | 'dark';
}

// The brand kit ships red/black artwork only - no reversed white version
// (pg. 11 forbids recolouring the mark to fit a background) - so this swaps
// the whole asset for a dark-mode file rather than trying to recolour one
// image. In 'auto' mode it watches html.dark directly (a MutationObserver,
// not the useDarkMode hook) so the logo updates even where nothing else on
// the page re-renders on a theme change - the sign-in shell swaps this in
// before any app state exists to drive it from.
export function PremiumLogo({ size = 'md', variant = 'stacked', mode = 'auto' }: PremiumLogoProps) {
  const [autoIsDark, setAutoIsDark] = useState(
    () => document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    if (mode !== 'auto') return;
    const observer = new MutationObserver(() => {
      setAutoIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [mode]);

  const isDark = mode === 'auto' ? autoIsDark : mode === 'dark';

  return (
    <img
      src={isDark ? LOGOS[variant].dark : LOGOS[variant].light}
      alt="Premium Management Group"
      className={`${SIZES[size]} w-auto object-contain`}
    />
  );
}
