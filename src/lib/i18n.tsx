import { createContext, useContext, type ReactNode } from 'react';
import type { Locale } from 'date-fns';
import { enCA } from 'date-fns/locale/en-CA';
import { frCA } from 'date-fns/locale/fr-CA';

// The language of the package's own built-in text (button labels, tooltips, month and day names). An app wraps itself
// once in <UiLangProvider lang="fr"> and every component speaks that language. Without a provider everything is
// English, as before, and every label prop still overrides the built-in text.
export type UiLang = 'en' | 'fr';

const UiLangContext = createContext<UiLang>('en');

export function UiLangProvider({ lang, children }: { lang: UiLang; children: ReactNode }) {
  return <UiLangContext.Provider value={lang}>{children}</UiLangContext.Provider>;
}

export function useUiLang(): UiLang {
  return useContext(UiLangContext);
}

/** A component's built-in text in the current language. */
export function useUiText<T>(dict: { en: T; fr: T }): T {
  return dict[useUiLang()];
}

/** The date-fns locale for day and month names in the current language. */
export function useUiLocale(): Locale {
  return useUiLang() === 'fr' ? frCA : enCA;
}

export { UiLangContext };
