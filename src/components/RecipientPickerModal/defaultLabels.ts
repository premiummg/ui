import type { RecipientPickerLabels } from './RecipientPickerModal';

// The built-in text, in English and French. A caller passes `labels` only for what it says differently.
export const DEFAULT_LABELS: { en: RecipientPickerLabels; fr: RecipientPickerLabels } = {
  en: {
    heading: 'Who is it for?',
    description: 'You can message your own division, the admins and PMGS.',
    searchLabel: 'Search people',
    searchPlaceholder: 'Name, division or position',
    selectAll: 'Select all',
    clearAll: 'Clear all',
    selectedCount: (n: number) => `${n} selected`,
    empty: 'Nobody found',
    cont: 'Continue',
    cancel: 'Cancel',
  },
  fr: {
    heading: 'Pour qui?',
    description: 'Vous pouvez écrire à votre division, aux administrateurs et à PMGS.',
    searchLabel: 'Rechercher des personnes',
    searchPlaceholder: 'Nom, division ou poste',
    selectAll: 'Tout sélectionner',
    clearAll: 'Tout désélectionner',
    selectedCount: (n: number) => `${n} sélectionné${n === 1 ? '' : 's'}`,
    empty: 'Aucun résultat',
    cont: 'Continuer',
    cancel: 'Annuler',
  },
};
