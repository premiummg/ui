import { FiCheck, FiCopy, FiShare2 } from 'react-icons/fi';
import { Button } from '../Button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useUiText } from '../../lib/i18n';

// A new account's sign-in, or a reset password, shown once inside the modal that made it: the email (when given),
// the password, a button that copies the password and one that copies a whole message to send the person, and
// Done. Two labelled buttons rather than one icon: the difference between copying the bare secret and copying a
// message is not something a single clipboard glyph can convey. The modal's title and intro stay with the caller.
export interface CredentialCardLabels {
  email: string;
  password: string;
  copyPassword: string;
  share: string;
  copied: string;
  done: string;
}

const TEXT: { en: CredentialCardLabels; fr: CredentialCardLabels } = {
  en: { email: 'Mail', password: 'Password', copyPassword: 'Copy password', share: 'Share', copied: 'Copied', done: 'Done' },
  fr: { email: 'Courriel', password: 'Mot de passe', copyPassword: 'Copier le mot de passe', share: 'Partager', copied: 'Copié', done: 'Terminé' },
};

export interface CredentialCardProps {
  password: string;
  /** Shown above the password when given (a new account). */
  email?: string;
  /** What "Copy password" puts on the clipboard. Defaults to the password alone. */
  copyText?: string;
  /** The message "Share" puts on the clipboard, ready to send to the person. */
  shareText: string;
  onDone: () => void;
  labels?: Partial<CredentialCardLabels>;
}

export function CredentialCard({ password, email, copyText, shareText, onDone, labels }: CredentialCardProps) {
  const t = { ...useUiText(TEXT), ...labels };
  const [copied, copy] = useCopyToClipboard();
  const [shared, share] = useCopyToClipboard();
  return (
    <>
      <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/20 dark:bg-black/40">
        {email && (
          <>
            <p className="mb-0.5 text-xs text-gray-400">{t.email}</p>
            <p className="mb-2 truncate text-sm font-medium text-gray-900 dark:text-gray-100">{email}</p>
            <p className="mb-0.5 text-xs text-gray-400">{t.password}</p>
          </>
        )}
        <code className="block select-all font-mono text-base tracking-widest text-gray-900 dark:text-gray-100">{password}</code>
      </div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" className="flex-1 justify-center" onClick={() => copy(copyText ?? password)}>
          {copied ? <FiCheck size={15} className="text-green-500" /> : <FiCopy size={15} />}
          {copied ? t.copied : t.copyPassword}
        </Button>
        <Button variant="secondary" className="flex-1 justify-center" onClick={() => share(shareText)}>
          {shared ? <FiCheck size={15} className="text-green-500" /> : <FiShare2 size={15} />}
          {shared ? t.copied : t.share}
        </Button>
      </div>
      <div className="flex justify-end">
        <Button onClick={onDone}>{t.done}</Button>
      </div>
    </>
  );
}
