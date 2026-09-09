import { ReactNode } from 'react';
import { PremiumLogo } from '../PremiumLogo';
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
}

// The navbar's shell: logo, brand-tone background (with its optional 45deg
// hatch), and the hi-vis stripe underneath. Deliberately does not include any
// actual nav items - a real navbar's bell/messages/profile menu are wired to
// one app's own APIs and routes, which is exactly what doesn't belong in a
// shared design system. Compose it with DarkModeToggle, NotificationBell and
// your own buttons via `children`, then hand the whole thing to `Layout`'s
// `navbar` prop.
export function Navbar({ tone = 'black', children }: NavbarProps) {
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
          <PremiumLogo size="sm" variant="horizontal" />
        </div>
        <div className="relative flex items-center gap-1 sm:gap-1.5 min-w-0">
          {children}
        </div>
      </header>
      <div className="pmg-stripe h-0.75" />
    </div>
  );
}
