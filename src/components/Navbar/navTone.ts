// Dark-mode chrome for the Navbar.
//
// Three brand darks are kept live rather than one being hardcoded, because
// which of them is right depends on the page background it sits against, and
// that is a call worth being able to re-make without touching markup.
//
// Light mode is identical for all three (white); the choice only affects dark.
//
// Why Steel Grey isn't simply "the" default even though some brand token
// tables nominate it for nav chrome: #3A3A3A sits LIGHTER than a Premium
// Black page and is a warm neutral against a cool background, so the bar
// pushes forward and the two greys read as a mismatch instead of a pair.
// Chrome has to sit at or below the page's value to read as chrome - which
// is exactly why this is a live choice per app rather than one constant.
export type NavTone = 'black' | 'dark' | 'steel';

export interface NavToneSpec {
  /** Tailwind dark-variant background class. Light mode is always white. */
  bg: string;
  /** Human label, for a /design-style comparison UI. */
  name: string;
  /** Whether to overlay the 45deg industrial hatch in dark mode. */
  texture: boolean;
  /** Rationale, for a /design-style comparison UI. */
  why: string;
}

export const NAV_TONES: Record<NavTone, NavToneSpec> = {
  black: {
    bg: 'dark:bg-(--premium-black)',
    name: 'Premium Black #000000',
    texture: true,
    why: 'The anchor tone. When the page background is Premium Black too, the chrome is continuous with the app and a hi-vis stripe becomes the only line separating them. The 45deg hatch keeps the bar from reading as a flat void without lifting its value.',
  },
  dark: {
    bg: 'dark:bg-(--premium-dark-grey)',
    name: 'Dark Grey #212121',
    texture: false,
    why: 'Built for strong contrast. Sits one step above a black page, so the bar is quietly distinguishable as its own surface without becoming a separate slab. The middle option: more definition than black, less separation than steel.',
  },
  steel: {
    bg: 'dark:bg-(--premium-steel-grey)',
    name: 'Steel Grey #3A3A3A',
    texture: false,
    why: 'Clearly lighter than the page, so the bar reads as a distinct slab laid on top - a legitimate choice against a Premium Black page, just a louder one than the other two.',
  },
};
