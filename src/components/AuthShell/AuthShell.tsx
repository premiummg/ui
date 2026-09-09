import { ReactNode } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useDarkMode } from '../../hooks/useDarkMode';
import { PremiumLogo } from '../PremiumLogo';

export interface AuthShellProps {
  eyebrow: string;
  children: ReactNode;
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
export function AuthShell({ eyebrow, children }: AuthShellProps) {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#F2F2F2] dark:bg-(--premium-black) px-4 py-10">
      {/* The 45deg hatch on the ground itself - an empty field is exactly
          where the brand's graphic system belongs, and this is the largest
          empty field in the app. */}
      <div className="absolute inset-0 pmg-texture text-gray-900 dark:text-white pointer-events-none" />

      <button
        onClick={toggle}
        aria-label="Toggle dark mode"
        className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition"
      >
        {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
      </button>

      <div className="relative w-full max-w-sm">
        {/* Sitting on the page's own neutral ground, not on the red band
            below - see the note above about the mark having no reversed
            white version. */}
        <div className="flex justify-center mb-6">
          <PremiumLogo size="xl" variant="stacked" />
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
          &copy; {new Date().getFullYear()} Premium MG - Built with Heart
        </p>
      </div>
    </div>
  );
}
