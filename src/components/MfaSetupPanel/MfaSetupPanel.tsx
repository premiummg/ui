import { useState } from 'react';
import { FiShield, FiSmartphone, FiCheckCircle } from 'react-icons/fi';
import { FieldGroup } from '../FieldGroup';
import { StatusBadge } from '../StatusBadge';

export type MfaSetupStep = 'idle' | 'scanning' | 'done';

export interface MfaSetupPanelLabels {
  heading: string;
  active: string;
  notConfigured: string;
  mandatoryTitle: string;
  mandatoryBody: string;
  subtitle: string;
  notSetUp: string;
  notSetUpHint: string;
  loading: string;
  enable: string;
  activeOnAccount: string;
  requiredEverySignIn: string;
  disableMfa: string;
  confirmDisable: string;
  disabling: string;
  yesDisable: string;
  cancel: string;
  step1: string;
  scanWith: string;
  orGoogleAuthenticator: string;
  cantScan: string;
  step2: string;
  enterCode: string;
  verifying: string;
  activate: string;
  activatedNotice: string;
  // Fallbacks shown when a callback rejects without its own message.
  setupFailed: string;
  disableFailed: string;
  invalidCode: string;
}

export interface MfaSetupPanelProps {
  labels: MfaSetupPanelLabels;
  // Whether MFA is already enabled on this account - distinct from `step`
  // (this component's own idle/scanning/done progress through turning it on
  // just now), since the panel opens already-on for a returning visitor.
  enabled: boolean;
  // Shows the "mandatory for your role" banner - callers derive this from
  // their own login/me response (identity-service's mfaSetupRequired).
  mandatory: boolean;
  onStartSetup: () => Promise<{ qrCode: string; secret: string }>;
  onConfirmCode: (code: string) => Promise<void>;
  onDisable: () => Promise<void>;
}

// The "turn two-factor on/off" panel on a person's own profile page - pulled
// out of timesheet-payroll-system and pmg-intranet, which had each
// hand-written their own copy of this exact idle/scanning/done flow against
// the identical identity-service endpoints. No network code of its own (see
// onStartSetup/onConfirmCode/onDisable) - each caller's callback does its
// own API call AND its own local state update (e.g. marking the account
// enabled), since that state lives in each app's own auth context.
export function MfaSetupPanel({ labels: t, enabled, mandatory, onStartSetup, onConfirmCode, onDisable }: MfaSetupPanelProps) {
  const [step, setStep] = useState<MfaSetupStep>('idle');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);

  const on = enabled || step === 'done';

  async function startSetup() {
    setLoading(true);
    setError('');
    try {
      const res = await onStartSetup();
      setQrCode(res.qrCode);
      setSecret(res.secret);
      setStep('scanning');
    } catch (err: any) {
      setError(err?.message || t.setupFailed);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setLoading(true);
    setError('');
    try {
      await onDisable();
      setConfirmDisable(false);
      setStep('idle');
    } catch (err: any) {
      setError(err?.message || t.disableFailed);
    } finally {
      setLoading(false);
    }
  }

  async function confirmCode() {
    if (code.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      await onConfirmCode(code);
      setStep('done');
    } catch (err: any) {
      setError(err?.message || t.invalidCode);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FieldGroup title={t.heading} action={<StatusBadge label={on ? t.active : t.notConfigured} tone={on ? 'success' : 'warning'} />}>
      {mandatory && (
        // Amber, not red - a standing condition to act on, not a failure.
        <div
          className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 mb-4 border"
          style={{ borderColor: 'rgba(250,173,0,0.35)', backgroundColor: 'rgba(250,173,0,0.10)' }}
        >
          <FiShield size={15} className="mt-0.5 shrink-0 text-[#7A5300] dark:text-[#FAAD00]" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.mandatoryTitle}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{t.mandatoryBody}</p>
          </div>
        </div>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.subtitle}</p>

      {step === 'idle' && !enabled && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FiSmartphone size={18} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-sm text-gray-800 dark:text-gray-100">{t.notSetUp}</p>
                <p className="text-xs text-gray-400">{t.notSetUpHint}</p>
              </div>
            </div>
            <button onClick={startSetup} disabled={loading} className="btn-primary px-4 shrink-0 disabled:opacity-60">
              {loading ? t.loading : t.enable}
            </button>
          </div>
          {/* A failed startSetup had nowhere to show itself in either
              original app - the error state was set but nothing in this
              branch ever rendered it. */}
          {error && <p className="text-xs" style={{ color: 'var(--premium-red)' }}>{error}</p>}
        </div>
      )}

      {step === 'idle' && enabled && (
        <div className="space-y-3">
          {!confirmDisable ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FiCheckCircle size={18} className="text-green-500 shrink-0" />
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-100">{t.activeOnAccount}</p>
                  <p className="text-xs text-gray-400">{t.requiredEverySignIn}</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmDisable(true)}
                className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 dark:border-white/20 text-gray-600 dark:text-gray-300 hover:border-gray-400 hover:text-gray-900 dark:hover:text-white transition shrink-0"
              >
                {t.disableMfa}
              </button>
            </div>
          ) : (
            <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'rgba(250,173,0,0.35)', backgroundColor: 'rgba(250,173,0,0.10)' }}>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.confirmDisable}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDisable}
                  disabled={loading}
                  className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-60"
                  style={{ backgroundColor: 'var(--premium-red)' }}
                >
                  {loading ? t.disabling : t.yesDisable}
                </button>
                <button
                  onClick={() => setConfirmDisable(false)}
                  className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
                >
                  {t.cancel}
                </button>
              </div>
              {error && <p className="text-xs" style={{ color: 'var(--premium-red)' }}>{error}</p>}
            </div>
          )}
        </div>
      )}

      {step === 'scanning' && (
        // Numbered steps - enrolment is a sequence people get wrong without
        // a stated order between the QR and the code field.
        <div className="flex flex-wrap gap-5">
          <div className="shrink-0">
            <img src={qrCode} alt="MFA QR code" className="w-44 h-44 rounded-xl border border-gray-200 dark:border-white/20 bg-white" />
          </div>
          <div className="flex-1 min-w-55 space-y-3">
            <div>
              <p className="pmg-eyebrow text-gray-400 dark:text-gray-500 mb-1">{t.step1}</p>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                {t.scanWith} <strong className="font-heading">Microsoft Authenticator</strong> {t.orGoogleAuthenticator}
              </p>
              <details className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                <summary className="cursor-pointer select-none">{t.cantScan}</summary>
                <p className="mt-1 font-mono tracking-widest break-all">{secret}</p>
              </details>
            </div>
            <div>
              <p className="pmg-eyebrow text-gray-400 dark:text-gray-500 mb-1">{t.step2}</p>
              <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1.5">{t.enterCode}</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="input-field w-40 text-center font-heading text-lg tracking-[0.4em] tabular-nums"
              />
            </div>
            {error && <p className="text-sm" style={{ color: 'var(--premium-red)' }}>{error}</p>}
            <button onClick={confirmCode} disabled={code.length !== 6 || loading} className="btn-primary px-4 py-2 text-sm disabled:opacity-60">
              {loading ? t.verifying : t.activate}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="space-y-3">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
            <FiCheckCircle size={16} /> {t.activatedNotice}
          </p>
          <button
            onClick={() => setStep('idle')}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-300 hover:border-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            {t.disableMfa}
          </button>
        </div>
      )}
    </FieldGroup>
  );
}
