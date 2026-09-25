import { useState, useEffect } from 'react';
import type { Lang } from '../LanguageToggle';
import stackedLightEn from '../../logos/stacked-light.png';
import stackedDarkEn from '../../logos/stacked-dark.png';
import horizontalLightEn from '../../logos/horizontal-light.png';
import horizontalDarkEn from '../../logos/horizontal-dark.png';
import stackedLightFr from '../../logos/stacked-light-fr.png';
import stackedDarkFr from '../../logos/stacked-dark-fr.png';
import horizontalLightFr from '../../logos/horizontal-light-fr.png';
import horizontalDarkFr from '../../logos/horizontal-dark-fr.png';

export type PremiumLogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type PremiumLogoVariant = 'stacked' | 'horizontal';

const SIZES: Record<PremiumLogoSize, string> = {
  sm: 'h-12',
  md: 'h-16',
  lg: 'h-24',
  xl: 'h-44',
};

// Same "ship a whole swapped-in asset per state" reasoning as light/dark
// (below) - the tagline is baked into the artwork, not overlaid as real
// text, so a translated tagline means a translated asset, not a CSS swap.
const LOGOS: Record<PremiumLogoVariant, Record<Lang, { light: string; dark: string }>> = {
  stacked: {
    en: { light: stackedLightEn, dark: stackedDarkEn },
    fr: { light: stackedLightFr, dark: stackedDarkFr },
  },
  horizontal: {
    en: { light: horizontalLightEn, dark: horizontalDarkEn },
    fr: { light: horizontalLightFr, dark: horizontalDarkFr },
  },
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
  // Same `Lang` type LanguageToggle uses - pass the same state that drives
  // it here too, so the wordmark's tagline ("Built with heart" / "Bâti avec
  // coeur") follows the visitor's chosen language exactly like every other
  // piece of translated copy in a bilingual consumer. Defaults to 'en'.
  lang?: Lang;
}

// The brand kit ships red/black artwork only - no reversed white version
// (pg. 11 forbids recolouring the mark to fit a background) - so this swaps
// the whole asset for a dark-mode file rather than trying to recolour one
// image. In 'auto' mode it watches html.dark directly (a MutationObserver,
// not the useDarkMode hook) so the logo updates even where nothing else on
// the page re-renders on a theme change - the sign-in shell swaps this in
// before any app state exists to drive it from.
export function PremiumLogo({ size = 'md', variant = 'stacked', mode = 'auto', lang = 'en' }: PremiumLogoProps) {
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
  const logo = LOGOS[variant][lang];

  return (
    <img
      src={isDark ? logo.dark : logo.light}
      alt="Premium Management Group"
      className={`${SIZES[size]} w-auto object-contain`}
    />
  );
}
