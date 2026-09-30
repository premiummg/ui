import { ReactNode } from 'react';
import { PremiumLogo } from '../PremiumLogo';
import type { Lang } from '../LanguageToggle';
import { NAV_TONES, NavTone } from './navTone';

export interface NavbarProps {
  // Which of the three brand darks the bar uses in dark mode. Light mode is
  // always white regardless. Pick one per app and hardcode it at the call
  // site - see NAV_TONES for the tradeoffs between them.
  tone?: NavTone;
  // Everything on the right: a Dashboard button, DarkModeToggle,
  // NotificationBell instances, the avatar/profile button, sign-out - all
  // wired to your own app's auth/notifications/routing, so they're supplied
  // here rather than owned by this component.
  children?: ReactNode;
  // Makes the logo a "go home" control, e.g. `onLogoClick={() => navigate('/')}`.
  // A callback instead of an `href` since this package takes no dependency
  // on any router - a consumer wires it to whatever client-side navigation
  // its own app already uses (React Router, plain `window.location`, ...).
  // Omit it to keep the logo purely decorative, the previous behavior.
  onLogoClick?: () => void;
  // Forwarded straight to PremiumLogo - pass the same state your app's own
  // LanguageToggle drives, so the wordmark's baked-in tagline switches
  // ("Built with heart" / "Bâti avec coeur") the instant the visitor flips
  // languages, the same as every other piece of copy in the bar around it.
  // Defaults to 'en', matching PremiumLogo's own default.
  lang?: Lang;
}

// The navbar's shell: logo, brand-tone background (with its optional 45deg
// hatch), and the hi-vis stripe underneath. Deliberately does not include any
// actual nav items - a real navbar's bell/messages/profile menu are wired to
// one app's own APIs and routes, which is exactly what doesn't belong in a
// shared design system. Compose it with DarkModeToggle, NotificationBell and
// your own buttons via `children`, then hand the whole thing to `Layout`'s
// `navbar` prop.
export function Navbar({ tone = 'black', children, onLogoClick, lang = 'en' }: NavbarProps) {
  const spec = NAV_TONES[tone];
  return (
    <div>
      <header className={`relative bg-white ${spec.bg} px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between min-w-0`}>
        {/* 45 degree industrial hatch, at the 3.5% the utility caps it to -
            enough to give the chrome a material read, far too faint to
            interfere with the controls sitting on it. */}
        {spec.texture && (
          <div className="absolute inset-0 pmg-texture text-white pointer-events-none hidden dark:block" />
        )}
        <div className="relative shrink-0">
          {onLogoClick ? (
            <button type="button" onClick={onLogoClick} aria-label="Go to dashboard" className="block">
              <PremiumLogo size="sm" variant="horizontal" lang={lang} />
            </button>
          ) : (
            <PremiumLogo size="sm" variant="horizontal" lang={lang} />
          )}
        </div>
        <div className="relative flex items-center gap-1 sm:gap-1.5 min-w-0">
          {children}
        </div>
      </header>
      <div className="pmg-stripe h-0.75" />
    </div>
  );
}
