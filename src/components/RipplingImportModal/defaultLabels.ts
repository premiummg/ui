import type { RipplingImportModalLabels } from './RipplingImportModal';

// The built-in text, in English and French. A caller passes `labels` only for what it says differently.
export const DEFAULT_LABELS: { en: RipplingImportModalLabels; fr: RipplingImportModalLabels } = {
  en: {
    heading: 'Import from Rippling',
    body: 'Rippling workers who have no account here yet. Pick who to create; they all get the role, division and manager chosen below, and are linked to their Rippling worker. The sign-in email is their Rippling work email, or their personal email when they have no work one yet.',
    loading: 'Reading the Rippling workers… this can take a moment.',
    loadError: 'Could not load the Rippling workers',
    retry: 'Try again',
    skippedNote: (counts: { knownEmail: number; identityAccount: number; terminated: number; likelyMatch: number; noEmail: number }) => {
    const parts: string[] = [];
    if (counts.knownEmail > 0) parts.push(`${counts.knownEmail} whose email already belongs to an employee here (use Match with Rippling to link them)`);
    if (counts.identityAccount > 0) parts.push(`${counts.identityAccount} with an account in another Premium app (use Not Migrated to activate them)`);
    if (counts.likelyMatch > 0) parts.push(`${counts.likelyMatch} that look like an existing employee (use Match with Rippling for those)`);
    if (counts.terminated > 0) parts.push(`${counts.terminated} terminated in Rippling`);
    if (counts.noEmail > 0) parts.push(`${counts.noEmail} without any email in Rippling`);
    return parts.length ? `Not listed: ${parts.join(', ')}.` : '';
  },
    truncatedNote: (shown: number, total: number) => `Showing the first ${shown} of ${total} workers. Import these, then open this again for the rest.`,
    nothingToImport: 'Every Rippling worker already has an account here, or is the likely match of an existing employee.',
    role: 'Role',
    division: 'Division',
    chooseDivision: 'Choose a division',
    manager: 'Manager',
    selectAll: (n: number) => `Select all (${n})`,
    colWorker: 'Rippling worker',
    colRole: 'Title',
    colStart: 'Started',
    statusLabels: {
    ACTIVE: 'Active',
    HIRED: 'Hired, not started yet',
    ACCEPTED: 'Offer accepted, not started yet',
    INIT: 'Not started',
  } as Record<string, string>,
    inactiveHint: 'Not active in Rippling',
    create: (n: number) => `Create ${n} employee${n === 1 ? '' : 's'}`,
    creating: 'Creating the accounts…',
    close: 'Close',
    done: 'Done',
    resultCreated: (n: number) => `${n} created`,
    resultFailed: (n: number) => `${n} not created`,
    notEligible: 'No longer eligible (it was linked or created in the meantime)',
    createError: 'Could not create the accounts.',
    tempPasswordsHeading: 'Temporary passwords (shown once, they must change them at first sign-in)',
    copyPasswords: 'Copy all',
    copiedPasswords: 'Copied',
  },
  fr: {
    heading: 'Importer depuis Rippling',
    body: "Employés Rippling qui n'ont pas encore de compte ici. Choisissez qui créer; ils reçoivent tous le rôle, la division et le gestionnaire choisis ci-dessous et sont liés à leur employé Rippling. Le courriel de connexion est leur courriel de travail Rippling, ou leur courriel personnel s'ils n'en ont pas encore.",
    loading: 'Lecture des employés Rippling… cela peut prendre un moment.',
    loadError: 'Impossible de charger les employés Rippling',
    retry: 'Réessayer',
    skippedNote: (counts: { knownEmail: number; identityAccount: number; terminated: number; likelyMatch: number; noEmail: number }) => {
    const parts: string[] = [];
    if (counts.knownEmail > 0) parts.push(`${counts.knownEmail} dont le courriel appartient déjà à un employé ici (utilisez Associer avec Rippling pour les lier)`);
    if (counts.identityAccount > 0) parts.push(`${counts.identityAccount} avec un compte dans une autre application Premium (utilisez Non migrés pour les activer)`);
    if (counts.likelyMatch > 0) parts.push(`${counts.likelyMatch} qui ressemblent à un employé existant (utilisez Associer avec Rippling)`);
    if (counts.terminated > 0) parts.push(`${counts.terminated} terminés dans Rippling`);
    if (counts.noEmail > 0) parts.push(`${counts.noEmail} sans aucun courriel dans Rippling`);
    return parts.length ? `Non listés : ${parts.join(', ')}.` : '';
  },
    truncatedNote: (shown: number, total: number) => `Les ${shown} premiers des ${total} employés sont affichés. Importez-les, puis rouvrez cette fenêtre pour les autres.`,
    nothingToImport: 'Chaque employé Rippling a déjà un compte ici, ou correspond probablement à un employé existant.',
    role: 'Rôle',
    division: 'Division',
    chooseDivision: 'Choisir une division',
    manager: 'Gestionnaire',
    selectAll: (n: number) => `Tout sélectionner (${n})`,
    colWorker: 'Employé Rippling',
    colRole: 'Titre',
    colStart: 'Entrée',
    statusLabels: {
    ACTIVE: 'Actif',
    HIRED: 'Embauché, pas encore commencé',
    ACCEPTED: 'Offre acceptée, pas encore commencé',
    INIT: 'Pas commencé',
  },
    inactiveHint: 'Inactif dans Rippling',
    create: (n: number) => `Créer ${n} employé(s)`,
    creating: 'Création des comptes…',
    close: 'Fermer',
    done: 'Terminé',
    resultCreated: (n: number) => `${n} créé(s)`,
    resultFailed: (n: number) => `${n} non créé(s)`,
    notEligible: "N'est plus admissible (lié ou créé entre-temps)",
    createError: 'Impossible de créer les comptes.',
    tempPasswordsHeading: 'Mots de passe temporaires (affichés une seule fois, à changer à la première connexion)',
    copyPasswords: 'Tout copier',
    copiedPasswords: 'Copié',
  },
};
