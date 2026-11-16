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
  // Extra classes for the image, for a place that needs the logo smaller on some screens (the navbar's
  // `max-sm:h-9`). They come after the size's own classes.
  className?: string;
}

// The brand kit ships red/black artwork only - no reversed white version
// (pg. 11 forbids recolouring the mark to fit a background) - so dark mode
// is a whole second asset rather than a recoloured image.
//
// 'auto' renders BOTH and lets the `dark:` variant on html.dark pick which
// one shows. It used to read html.dark in a useState initializer and keep it
// in sync with a MutationObserver, which meant reading `document` during
// render: fatal in a build-time prerender (no `document` at all), and a
// hydration mismatch in a prerendered page whose visitor uses dark mode
// (the server picks light, the browser keeps the server's `src`). CSS has
// the right answer at first paint, needs no observer, and still follows a
// theme change made by anything (the sign-in shell flips the class before
// any app state exists). The hidden copy is `display: none`, so a screen
// reader announces one logo, not two.
export function PremiumLogo({ size = 'md', variant = 'stacked', mode = 'auto', lang = 'en', className = '' }: PremiumLogoProps) {
  const logo = LOGOS[variant][lang];
  const base = `${SIZES[size]} w-auto object-contain ${className}`;

  if (mode === 'auto') {
    return (
      <>
        <img src={logo.light} alt="Premium Management Group" className={`${base} dark:hidden`} />
        <img src={logo.dark} alt="Premium Management Group" className={`${base} hidden dark:inline`} />
      </>
    );
  }

  return (
    <img
      src={mode === 'dark' ? logo.dark : logo.light}
      alt="Premium Management Group"
      className={base}
    />
  );
}
