import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../ConfirmDialog';
import { useToast } from '../Toaster';
import { copyToClipboard } from '../../lib/clipboard';
import { useUiText } from '../../lib/i18n';

// What a bulk password reset did: the new temporary passwords (shown only now, with a button that copies them all)
// and the people it could not reset. The passwords exist nowhere else, so while there are any the dialog only
// closes from its own button: a click outside or Escape must not throw them away.
export interface PasswordResultsLabels {
  title: string;
  body: string;
  outcomeTitle: string;
  failedNote: string;
  failedTitle: string;
  copy: string;
  copied: string;
  copyFailed: string;
  close: string;
}

const TEXT: { en: PasswordResultsLabels; fr: PasswordResultsLabels } = {
  en: {
    title: 'New temporary passwords',
    body: 'Shown only now. Copy them before closing: they cannot be seen again.',
    outcomeTitle: 'Password reset',
    failedNote: 'They stay selected so you can try again.',
    failedTitle: 'Not reset',
    copy: 'Copy all',
    copied: 'Copied',
    copyFailed: 'Could not copy. Select the passwords and copy them by hand.',
    close: 'Close',
  },
  fr: {
    title: 'Nouveaux mots de passe temporaires',
    body: 'Affichés seulement maintenant. Copiez-les avant de fermer : ils ne pourront plus être consultés.',
    outcomeTitle: 'Réinitialisation des mots de passe',
    failedNote: 'Ils restent sélectionnés pour que vous puissiez réessayer.',
    failedTitle: 'Non réinitialisés',
    copy: 'Tout copier',
    copied: 'Copié',
    copyFailed: 'Copie impossible. Sélectionnez les mots de passe et copiez-les à la main.',
    close: 'Fermer',
  },
};

export interface PasswordResult {
  name: string;
  password: string;
}

export interface PasswordResultsDialogProps {
  /** Null keeps the dialog closed. */
  outcome: { passwords: PasswordResult[] | null; failed: string[] } | null;
  onClose: () => void;
  labels?: Partial<PasswordResultsLabels>;
}

export function PasswordResultsDialog({ outcome, onClose, labels }: PasswordResultsDialogProps) {
  const t = { ...useUiText(TEXT), ...labels };
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  useEffect(() => { setCopied(false); }, [outcome]);
  const passwords = outcome?.passwords ?? null;

  return (
    <ConfirmDialog
      open={!!outcome}
      onClose={() => { if (!passwords) onClose(); }}
      tone="caution"
      title={passwords ? t.title : t.outcomeTitle}
      message={passwords ? t.body : t.failedNote}
      actions={[
        ...(passwords ? [{
          label: copied ? t.copied : t.copy,
          variant: 'secondary' as const,
          onClick: async () => {
            try {
              await copyToClipboard(passwords.map((r) => `${r.name}: ${r.password}`).join('\n'));
              setCopied(true);
            } catch {
              toast(t.copyFailed, 'error');
            }
          },
        }] : []),
        { label: t.close, variant: 'primary' as const, onClick: onClose },
      ]}
    >
      {passwords && (
        <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-100 dark:border-white/10">
          {passwords.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-3 border-b border-gray-50 px-3 py-1.5 text-xs last:border-0 dark:border-white/5">
              <span className="text-gray-600 dark:text-gray-300">{r.name}</span>
              <code className="select-all font-mono tracking-wider text-gray-900 dark:text-gray-100">{r.password}</code>
            </div>
          ))}
        </div>
      )}
      {!!outcome?.failed.length && (
        <div className={passwords ? 'mt-4' : ''}>
          <p className="mb-1 text-xs font-semibold text-red-600 dark:text-red-400">{t.failedTitle}</p>
          <div className="max-h-32 overflow-y-auto rounded-lg border border-red-100 dark:border-red-900/30">
            {outcome.failed.map((name, i) => (
              <div key={i} className="border-b border-red-50 px-3 py-1.5 text-xs text-gray-600 last:border-0 dark:border-red-900/20 dark:text-gray-300">{name}</div>
            ))}
          </div>
        </div>
      )}
    </ConfirmDialog>
  );
}
