import { useState, FormEvent } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Alert } from '../Alert';

const CODE_LENGTH = 6;

export interface MfaCodeVerifyFormLabels {
  title: string;
  subtitle: string;
  codeAriaLabel: string;
  of: string;
  rotate: string;
  verifying: string;
  verify: string;
  lostDevice: string;
  backToSignIn: string;
  // Fallback shown when onVerify rejects without its own message.
  invalidCode: string;
}

export interface MfaCodeVerifyFormProps {
  labels: MfaCodeVerifyFormLabels;
  // Resolves on a valid code (the caller does its own navigation/state
  // update), rejects with an Error whose message displays as-is, or with no
  // message to fall back to labels.invalidCode.
  onVerify: (code: string) => Promise<void>;
  onBackToSignIn: () => void;
}

// The standalone "enter your 2FA code" screen shown after a password that
// needed a second factor - pulled out of timesheet-payroll-system and
// pmg-intranet, which had each hand-written their own version of this
// screen with real UX drift (pmg: one plain text input; timesheet: this
// six-slot display with autofocus/paste handling, a digit counter and a
// "codes rotate every 30s" hint) despite calling the identical identity
// -service endpoint. Deliberately has no network code of its own - see
// onVerify - so it has no opinion on whether the caller uses axios or fetch,
// or what shape its access token comes back in.
export function MfaCodeVerifyForm({ labels: t, onVerify, onBackToSignIn }: MfaCodeVerifyFormProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (code.length < CODE_LENGTH || submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await onVerify(code);
    } catch (err: any) {
      setError(err?.message || t.invalidCode);
      setCode('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="font-heading font-extrabold text-lg text-gray-900 dark:text-gray-100 mb-1">{t.title}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.subtitle}</p>

      <form onSubmit={handleSubmit}>
        {/* Six slots rather than one wide box: the code arrives as six
            digits and you check your work against six positions. The real
            input stays a single field underneath so paste, autofill,
            password managers and the numeric keypad all keep working - the
            slots are the visual, not the mechanism. */}
        <div className="relative mb-1">
          <input
            value={code}
            onChange={e => {
              setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH));
              if (error) setError('');
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            aria-label={t.codeAriaLabel}
            autoFocus
            // text-base: invisible or not, this is the real text-entry
            // element the slots below only visualize, and it has no explicit
            // size of its own to override whatever it happens to inherit
            // from wherever it's mounted - iOS Safari auto-zooms the page on
            // focus for a field computing under 16px regardless of opacity,
            // and doesn't reliably zoom back out on blur.
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
          />
          <div className="flex gap-2 pointer-events-none">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const filled = i < code.length;
              const active = i === code.length;
              return (
                <div
                  key={i}
                  className={`flex-1 h-12 rounded-lg border grid place-items-center pmg-figure text-xl transition ${
                    filled
                      ? 'text-gray-900 dark:text-gray-100 border-gray-300 dark:border-white/30'
                      : 'text-gray-300 dark:text-gray-600 border-gray-200 dark:border-white/20'
                  }`}
                  style={active ? { borderColor: 'var(--premium-red)', boxShadow: '0 0 0 3px var(--premium-red-ring)' } : undefined}
                >
                  {filled ? code[i] : ''}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          <span className="pmg-figure">{code.length}</span> {t.of}{' '}
          <span className="pmg-figure">{CODE_LENGTH}</span> &middot; {t.rotate}
        </p>

        {error && (
          <div className="mb-4">
            <Alert variant="error" text={error} />
          </div>
        )}

        {/* Disabled until six digits are in, rather than accepting a short
            code and failing on submit. */}
        <button type="submit" disabled={submitting || code.length < CODE_LENGTH} className="btn-primary w-full disabled:opacity-50">
          {submitting ? t.verifying : t.verify}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-3">{t.lostDevice}</p>
      <button
        type="button"
        onClick={onBackToSignIn}
        className="w-full mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
      >
        <FiArrowLeft size={12} /> {t.backToSignIn}
      </button>
    </>
  );
}
