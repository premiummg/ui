import { ReactNode } from 'react';
import { PremiumLogo } from '../PremiumLogo';
import { DarkModeToggle } from '../DarkModeToggle';
import { LanguageToggle } from '../LanguageToggle';
import type { Lang } from '../LanguageToggle';

const LANGUAGE_NAMES: Record<Lang, string> = { en: 'English', fr: 'Français' };

export interface AuthShellLabels {
  // Aria-label for the dark-mode toggle button.
  toggleDarkMode: string;
  // The small print under the card, given the current year.
  footer: (year: number) => string;
}

export interface AuthShellProps {
  eyebrow: string;
  children: ReactNode;
  // Dark mode is read/written by the consumer's own `useDarkMode()` (or
  // equivalent) and passed in as plain props - this component owns no
  // document/localStorage access of its own, same reasoning as the standalone
  // DarkModeToggle it renders internally. Without this, a sign-in screen's
  // theme could silently drift from the rest of the app's.
  isDark: boolean;
  onToggleDarkMode: () => void;
  labels: AuthShellLabels;
  // Same `Lang` type LanguageToggle/PremiumLogo use - pass the same state
  // that drives those elsewhere in a bilingual consumer, so the wordmark
  // artwork's tagline follows the visitor's chosen language too. Defaults to
  // 'en' for a consumer that hasn't gone bilingual yet.
  lang?: Lang;
  // Shows the EN/FR toggle next to the dark-mode button when given - omit
  // for an English-only consumer. A sign-in flow has no navbar (that's the
  // whole reason this shell exists), so without this a visitor stuck on the
  // wrong language before logging in has no control anywhere on the page to
  // fix it themselves - this is that control, not just the Navbar's own copy
  // of it. Always shows the Acadian flag for French (no `quebecFlag` opt-in):
  // a per-division preference can't be looked up here, since no one is
  // authenticated yet at the point this shell is on screen.
  onLangChange?: (lang: Lang) => void;
}

// The shared shell for a sign-in flow's screens (sign in, two-factor, set a
// new password, ...). These are typically the only screens in an app with no
// navbar, so the brand has to carry itself here or it isn't present at all.
//
// It's ONE component rather than one per screen on purpose: three near-copies
// drift apart in exactly the ways that become bugs someone hits later - only
// one screen keeps its dark-mode toggle, only one keeps a footer line, and so
// on. All three sit on the same shell instead.
//
// About the wordmark: it's set in Montserrat as text on the band, not the
// logo artwork - most brand kits ship a red/black mark only (no reversed
// white version), which disappears against a solid brand-color band. Type is
// the correct option there until a reversed mark exists in the kit.
export function AuthShell({ eyebrow, children, isDark, onToggleDarkMode, labels, lang = 'en', onLangChange }: AuthShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#F2F2F2] dark:bg-(--premium-black) px-4 py-10">
      {/* The 45deg hatch on the ground itself - an empty field is exactly
          where the brand's graphic system belongs, and this is the largest
          empty field in the app. */}
      <div className="absolute inset-0 pmg-texture text-gray-900 dark:text-white pointer-events-none" />

      <div className="absolute top-4 right-4 flex items-center gap-2">
        {onLangChange && <LanguageToggle lang={lang} onChange={onLangChange} names={LANGUAGE_NAMES} />}
        <DarkModeToggle
          isDark={isDark}
          onToggle={onToggleDarkMode}
          size={18}
          ariaLabel={labels.toggleDarkMode}
        />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Sitting on the page's own neutral ground, not on the red band
            below - see the note above about the mark having no reversed
            white version. */}
        <div className="flex justify-center mb-6">
          <PremiumLogo size="xl" variant="stacked" lang={lang} />
        </div>

        <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-(--premium-dark-grey) shadow-xl">
          {/* The wordmark moves ONTO the band instead of floating above a
              white box, which is what makes this read as the brand rather
              than as any login form with a picture on top. */}
          <div className="relative pmg-field px-5 py-4">
            <div className="absolute inset-0 pmg-bars pointer-events-none" />
            <div className="relative">
              <p className="font-heading font-black text-lg text-white leading-none tracking-tight">PREMIUM</p>
              <p className="pmg-eyebrow text-white/70 mt-1.5">{eyebrow}</p>
            </div>
          </div>
          <div className="pmg-stripe h-0.75" />

          <div className="px-6 py-6">{children}</div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          {labels.footer(new Date().getFullYear())}
        </p>
      </div>
    </div>
  );
}
