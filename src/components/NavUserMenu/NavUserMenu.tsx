import type { ReactNode } from 'react';
import { FiLogOut, FiMoon, FiMoreVertical, FiSun, FiUser } from 'react-icons/fi';
import { Avatar } from '../Avatar';
import { IconButton } from '../IconButton';
import { LanguageToggle } from '../LanguageToggle';
import type { Lang } from '../LanguageToggle';
import { usePopover } from '../../hooks/usePopover';
import { usePopoverSide } from '../../hooks/usePopoverSide';
import { useUiText } from '../../lib/i18n';

// The panel both navbar menus open: under its button on a wide screen (hanging from whichever edge keeps it on
// screen), and across the top of a phone.
const PANEL = 'absolute top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-14 max-sm:mt-0 max-sm:w-auto dark:border-white/10 dark:bg-(--premium-dark-grey)';

const USER_TEXT = {
  en: { profile: 'Profile', signOut: 'Sign out' },
  fr: { profile: 'Profil', signOut: 'Se déconnecter' },
};

export interface NavUserMenuProps {
  name: string;
  /** Shown under the name in micro caps: which role you are signed in as changes what half the controls do. */
  roleLabel?: string;
  photoSrc?: string;
  onProfile: () => void;
  /** Usually opens the app's own "Sign out?" confirmation. */
  onSignOut: () => void;
  labels?: Partial<{ profile: string; signOut: string }>;
}

// The person signed in, at the right end of the navbar: their photo, name and role, and a menu with Profile and
// Sign out. On a phone only the photo shows.
export function NavUserMenu({ name, roleLabel, photoSrc, onProfile, onSignOut, labels }: NavUserMenuProps) {
  const t = { ...useUiText(USER_TEXT), ...labels };
  const { open, setOpen, ref, close } = usePopover();
  const { side, panelRef } = usePopoverSide(open, ref, 'right');
  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex min-w-0 items-center gap-2 rounded-lg py-1 pl-1 transition hover:bg-gray-100 sm:pr-3 dark:hover:bg-white/10"
      >
        <Avatar fullName={name} size={28} color="var(--premium-red)" src={photoSrc} />
        <span className="hidden min-w-0 flex-col items-start leading-tight sm:flex">
          <span className="max-w-30 truncate text-sm font-medium text-gray-700 dark:text-white">{name}</span>
          {roleLabel && <span className="pmg-eyebrow text-[9px] text-gray-400 dark:text-white/50">{roleLabel}</span>}
        </span>
      </button>
      {open && (
        <div ref={panelRef} role="menu" className={`${PANEL} ${side === 'left' ? 'left-0' : 'right-0'} w-48 py-1.5`}>
          <button
            type="button"
            role="menuitem"
            onClick={() => { close(); onProfile(); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10"
          >
            <FiUser size={15} className="text-gray-400 dark:text-gray-300" />
            {t.profile}
          </button>
          <div className="my-1.5 border-t border-gray-100 dark:border-white/10" />
          <button
            type="button"
            role="menuitem"
            onClick={() => { close(); onSignOut(); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition hover:bg-(--premium-red-light) dark:hover:bg-[#E62027]/15"
            style={{ color: 'var(--premium-red)' }}
          >
            <FiLogOut size={15} />
            {t.signOut}
          </button>
        </div>
      )}
    </div>
  );
}

const MORE_TEXT = {
  en: { more: 'More', language: 'Language', toggleDark: 'Toggle dark mode' },
  fr: { more: 'Plus', language: 'Langue', toggleDark: 'Basculer le mode sombre' },
};

export interface NavMobileSettingsProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  langNames: Record<Lang, string>;
  quebecFlag?: boolean;
  isDark: boolean;
  onToggleDark: () => void;
  /** Extra rows above the language (a link to the other app). */
  children?: ReactNode;
  labels?: Partial<{ more: string; language: string; toggleDark: string }>;
}

// The language and dark mode of the navbar on a phone, where there is no room for them in the bar: a "more" button
// (shown only below sm) that opens them in a panel. Wider screens show the two toggles in the bar itself.
export function NavMobileSettings({
  lang, onLangChange, langNames, quebecFlag, isDark, onToggleDark, children, labels,
}: NavMobileSettingsProps) {
  const t = { ...useUiText(MORE_TEXT), ...labels };
  const { open, setOpen, ref, close } = usePopover();
  return (
    <div className="relative shrink-0 sm:hidden" ref={ref}>
      <IconButton onClick={() => setOpen((v) => !v)} aria-label={t.more} aria-expanded={open}>
        <FiMoreVertical size={16} />
      </IconButton>
      {open && (
        <div className={`${PANEL} right-0 w-52 space-y-3 p-3`}>
          {children}
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{t.language}</p>
            <LanguageToggle lang={lang} onChange={onLangChange} names={langNames} quebecFlag={quebecFlag} />
          </div>
          <button
            type="button"
            onClick={() => { onToggleDark(); close(); }}
            className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
          >
            {isDark ? <FiSun size={15} className="text-gray-400 dark:text-gray-300" /> : <FiMoon size={15} className="text-gray-400 dark:text-gray-300" />}
            {t.toggleDark}
          </button>
        </div>
      )}
    </div>
  );
}
