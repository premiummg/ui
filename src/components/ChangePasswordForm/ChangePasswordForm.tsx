import { useState, type FormEvent } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { TextButton } from '../TextButton';
import { PasswordInput } from '../PasswordInput';
import { AuthError } from '../AuthShell/AuthError';
import { useUiText } from '../../lib/i18n';

// The forced step after an admin resets someone's password: a temporary password is a one-time credential. Goes
// inside AuthShell: the amber notice, the new password twice (with a meter that states the length rule before it is
// broken, not only after a failed submit), the failure of the last try, and "Back to sign in".
export interface ChangePasswordFormLabels {
  bannerTitle: string;
  bannerBody: string;
  title: string;
  newPassword: string;
  confirmPassword: string;
  minLength: (n: number) => string;
  required: string;
  mismatch: string;
  of: string;
  submit: string;
  submitting: string;
  failed: string;
  backToSignIn: string;
}

const TEXT: { en: ChangePasswordFormLabels; fr: ChangePasswordFormLabels } = {
  en: {
    bannerTitle: 'Password change required',
    bannerBody: 'Your password was reset by an administrator. Set a new one to continue.',
    title: 'Set new password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    minLength: (n) => `Minimum ${n} characters`,
    required: 'Required',
    mismatch: 'Passwords do not match',
    of: 'of',
    submit: 'Set new password',
    submitting: 'Saving…',
    failed: 'Failed to update password',
    backToSignIn: 'Back to sign in',
  },
  fr: {
    bannerTitle: 'Changement de mot de passe requis',
    bannerBody: 'Votre mot de passe a été réinitialisé par un administrateur. Définissez-en un nouveau pour continuer.',
    title: 'Définir un nouveau mot de passe',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le nouveau mot de passe',
    minLength: (n) => `Minimum ${n} caractères`,
    required: 'Requis',
    mismatch: 'Les mots de passe ne correspondent pas',
    of: 'sur',
    submit: 'Définir le nouveau mot de passe',
    submitting: 'Enregistrement…',
    failed: 'Impossible de mettre à jour le mot de passe',
    backToSignIn: 'Retour à la connexion',
  },
};

export interface ChangePasswordFormProps {
  /** Saves the new password and moves on. Throw an Error whose message should be shown to report a failure. */
  onSubmit: (newPassword: string) => Promise<void>;
  onBackToSignIn: () => void;
  minLength?: number;
  labels?: Partial<ChangePasswordFormLabels>;
}

export function ChangePasswordForm({ onSubmit, onBackToSignIn, minLength = 8, labels }: ChangePasswordFormProps) {
  const t = { ...useUiText(TEXT), ...labels };
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const typed = password.length;
  const met = typed >= minLength;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = {
      password: password.length < minLength ? t.minLength(minLength) : undefined,
      confirm: !confirm ? t.required : confirm !== password ? t.mismatch : undefined,
    };
    setErrors(next);
    if (next.password || next.confirm) return;
    setServerError('');
    setSubmitting(true);
    try {
      await onSubmit(password);
    } catch (err) {
      setServerError((err instanceof Error && err.message) || t.failed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Alert variant="warning" className="mb-4" title={t.bannerTitle} text={t.bannerBody} />
      <h1 className="mb-4 font-heading text-lg font-extrabold text-gray-900 dark:text-gray-100">{t.title}</h1>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <PasswordInput
          label={t.newPassword}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          error={errors.password}
          autoFocus
          hint={
            <div className="flex items-center gap-2">
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-(--premium-steel-grey)">
                <span
                  className="block h-full transition-all duration-200"
                  style={{ width: `${Math.min(100, (typed / minLength) * 100)}%`, backgroundColor: met ? '#22C55E' : 'var(--premium-orange)' }}
                />
              </span>
              <span className="shrink-0 text-xs text-gray-400">
                <span className="pmg-figure">{Math.min(typed, minLength)}</span> {t.of} <span className="pmg-figure">{minLength}</span>
              </span>
            </div>
          }
        />
        <PasswordInput
          label={t.confirmPassword}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          error={errors.confirm}
        />
        {serverError && <AuthError message={serverError} />}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? t.submitting : t.submit}
        </Button>
      </form>
      <TextButton onClick={onBackToSignIn} className="mt-4 w-full justify-center">
        <FiArrowLeft size={12} /> {t.backToSignIn}
      </TextButton>
    </>
  );
}
