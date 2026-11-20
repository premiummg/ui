import type { RipplingLinkModalLabels } from './RipplingLinkModal';

// The built-in text, in English and French. A caller passes `labels` only for what it says differently.
export const DEFAULT_LABELS: { en: RipplingLinkModalLabels; fr: RipplingLinkModalLabels } = {
  en: {
    heading: 'Find in Rippling',
    body: (name: string) => `Search Rippling's worker list to link ${name} to the right account.`,
    searchPlaceholder: 'Search name or email…',
    loading: 'Loading…',
    loadError: 'Could not load Rippling workers',
    retry: 'Try again',
    noMatches: 'No Rippling workers match this search.',
    moreResults: (n: number) => `+${n} more: narrow your search to see them`,
    link: 'Link',
    linking: 'Linking…',
    close: 'Close',
    linkedToast: (name: string) => `Linked to ${name} in Rippling.`,
    linkError: 'Could not link this employee to Rippling.',
  },
  fr: {
    heading: 'Trouver dans Rippling',
    body: (name: string) => `Recherchez la liste des employés Rippling pour lier ${name} au bon compte.`,
    searchPlaceholder: 'Rechercher un nom ou un courriel…',
    loading: 'Chargement…',
    loadError: 'Impossible de charger les employés Rippling',
    retry: 'Réessayer',
    noMatches: 'Aucun employé Rippling ne correspond à cette recherche.',
    moreResults: (n: number) => `+${n} de plus : affinez votre recherche pour les voir`,
    link: 'Lier',
    linking: 'Liaison en cours…',
    close: 'Fermer',
    linkedToast: (name: string) => `Lié à ${name} dans Rippling.`,
    linkError: "Impossible de lier cet employé à Rippling.",
  },
};
