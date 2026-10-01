import { useState, FormEvent } from 'react';
import { FiMail, FiLock } from 'react-icons/fi';
import { Alert } from '../Alert';
import { PasswordInput } from '../PasswordInput';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TRANSIENT_STATUSES = new Set([502, 503, 504]);
// Long enough to clear a dev server still finishing `app.listen()`, short
// enough that a genuine second failure doesn't feel like a frozen button.
const RETRY_DELAY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Reads a status code off either shape a caller's onLogin is likely to
// reject with: a fetch-style error carrying `status` directly (e.g.
// pmg-intranet's ApiError), or an axios error carrying `response.status`.
// No caller has to normalize its own error shape for this to work.
function getErrorStatus(err: unknown): number | undefined {
  const anyErr = err as any;
  if (anyErr && typeof anyErr === 'object') {
    if (typeof anyErr.status === 'number') return anyErr.status;
    if (typeof anyErr.response?.status === 'number') return anyErr.response.status;
  }
  return undefined;
}

function getErrorMessage(err: unknown, fallback: string): string {
  const anyErr = err as any;
  if (anyErr && typeof anyErr === 'object') {
    if (typeof anyErr.response?.data?.error === 'string' && anyErr.response.data.error) {
      return anyErr.response.data.error;
    }
    if (typeof anyErr.message === 'string' && anyErr.message) return anyErr.message;
  }
  return fallback;
}

export interface LoginFormLabels {
  title: string;
  emailLabel: string;
  passwordLabel: string;
  // Shown when email/password are missing or the email looks malformed.
  requiredFields: string;
  // Fallback shown when onLogin rejects without its own message.
  loginFailed: string;
  submit: string;
  submitting: string;
  showPassword?: string;
  hidePassword?: string;
  // Optional line below the form (e.g. "Having trouble? Contact your system
  // administrator.") - omit to show nothing.
  trailer?: string;
}

export interface LoginFormProps {
  labels: LoginFormLabels;
  // Resolves on a successful sign-in (the caller does its own auth-state
  // update/navigation), rejects with an Error whose message displays as-is,
  // or with no message to fall back to labels.loginFailed.
  //
  // A rejection shaped like a transient 502/503/504 (a numeric `status`
  // field, or axios's `response.status`) is retried once, silently, before
  // surfacing - this specifically papers over the dev-server cold-start race
  // where the very first request after `npm run dev` hits a backend that
  // hasn't finished binding yet. Any other rejection (wrong credentials
  // included) surfaces immediately, with no retry.
  onLogin: (email: string, password: string) => Promise<void>;
}

// Pulled out of timesheet-payroll-system and pmg-intranet, which had each
// hand-written their own version of this screen - one validated with
// react-hook-form + zod, the other with plain state, and only one of the two
// silently survived a 502 from a backend that was still starting up.
// Deliberately has no network code of its own beyond the retry above - see
// onLogin - so it has no opinion on whether the caller uses axios or fetch.
export function LoginForm({ labels: t, onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!EMAIL_RE.test(trimmedEmail) || !trimmedPassword) {
      setError(t.requiredFields);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      try {
        await onLogin(trimmedEmail, trimmedPassword);
      } catch (err) {
        const status = getErrorStatus(err);
        if (status === undefined || !TRANSIENT_STATUSES.has(status)) throw err;
        await delay(RETRY_DELAY_MS);
        await onLogin(trimmedEmail, trimmedPassword);
      }
    } catch (err) {
      setError(getErrorMessage(err, t.loginFailed));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="font-heading font-extrabold text-lg text-gray-900 dark:text-gray-100 mb-4">{t.title}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t.emailLabel}</label>
          <div className="relative">
            <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
            <input
              id="login-email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              className="input-field pl-9"
            />
          </div>
        </div>

        <PasswordInput
          label={t.passwordLabel}
          name="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          icon={FiLock}
          showLabel={t.showPassword}
          hideLabel={t.hidePassword}
        />

        {error && (
          <div>
            <Alert variant="error" text={error} />
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
          {submitting ? t.submitting : t.submit}
        </button>
      </form>

      {t.trailer && <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">{t.trailer}</p>}
    </>
  );
}
