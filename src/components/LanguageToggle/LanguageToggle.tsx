import { FlagCanada, FlagAcadian } from '../Flags';

export type Lang = 'en' | 'fr';

export interface LanguageToggleProps {
  lang: Lang;
  onChange: (lang: Lang) => void;
  // Names shown in the title/aria-label for each option, e.g. { en: 'English', fr: 'Acadian French' }.
  names: Record<Lang, string>;
}

// A segmented control with BOTH languages always visible, the live one
// filled - not a single icon that toggles to show only the other language.
// That single-icon pattern is exactly the one that makes half a bilingual
// audience guess which state they're currently in.
export function LanguageToggle({ lang, onChange, names }: LanguageToggleProps) {
  return (
    // inline-flex, not flex: a bare `flex` container is still block-level
    // and stretches to its parent's full width outside a flex/inline
    // context, same as OverflowMenu/MonthNav/WeekNav/NotificationBell had -
    // this one just wasn't caught in that pass.
    <div className="inline-flex items-center rounded-lg border border-gray-200 dark:border-white/15 p-0.5">
      {([['en', FlagCanada], ['fr', FlagAcadian]] as const).map(([l, Flag]) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          title={names[l]}
          aria-label={names[l]}
          aria-pressed={lang === l}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-heading font-bold tracking-wide transition ${
            lang === l
              ? 'bg-(--premium-black) dark:bg-white/15 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {/* w-6 h-4.5 (up from w-4.5 h-3.25): at the smaller size the
              Acadian flag's own gold star - the one detail that keeps it
              from reading as a plain, generic France tricolor, which the
              flag choice above exists specifically to avoid - was too small
              to actually see. */}
          <Flag className={`w-6 h-4.5 rounded-[1px] shadow-sm ${lang === l ? '' : 'opacity-60'}`} />
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
