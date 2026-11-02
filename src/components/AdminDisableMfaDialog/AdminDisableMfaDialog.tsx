import { useState } from 'react';
import { FiShield } from 'react-icons/fi';
import { ConfirmDialog } from '../ConfirmDialog';
import { PasswordInput } from '../PasswordInput';

export interface AdminDisableMfaDialogLabels {
  title: (targetName: string) => string;
  body: string;
  confirmLabel: string;
  disabling: string;
  cancelLabel: string;
  // Asks the admin for their own password, and hands it to onConfirm: switching somebody's MFA off hands over
  // their account, so the server wants proof it is really the admin asking. Omit it for the dialog without the field.
  passwordLabel?: string;
}

export interface AdminDisableMfaDialogProps {
  open: boolean;
  onClose: () => void;
  targetName: string;
  // Does the real API call and its own state update (e.g. marking the
  // employee's totp_enabled false) AND its own success toast - this
  // component only keeps the dialog open and lets the admin retry on a
  // rejection, since the host already surfaced the error itself.
  // Receives the admin's password when the dialog asks for one (labels.passwordLabel), '' when it does not.
  onConfirm: (adminPassword: string) => Promise<void>;
  labels: AdminDisableMfaDialogLabels;
}

// An admin disabling MFA on someone ELSE's account (lost device, etc.) -
// pulled out of timesheet-payroll-system and pmg-intranet, which had each
// built this exact confirm dialog independently (pmg already on top of this
// package's own ConfirmDialog; timesheet as a hand-rolled overlay div doing
// the same thing). No network code of its own - see onConfirm.
export function AdminDisableMfaDialog({ open, onClose, targetName, onConfirm, labels: t }: AdminDisableMfaDialogProps) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const asksPassword = !!t.passwordLabel;

  function close() {
    setPassword('');
    onClose();
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm(password);
      close();
    } catch {
      // Swallowed deliberately - the host's own onConfirm already surfaced
      // the error (its usual toast). Keeping the dialog open just lets the
      // admin retry instead of losing their place.
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={close}
      onConfirm={handleConfirm}
      tone="caution"
      icon={FiShield}
      title={t.title(targetName)}
      message={t.body}
      confirmLabel={loading ? t.disabling : t.confirmLabel}
      cancelLabel={t.cancelLabel}
      confirmDisabled={loading || (asksPassword && !password)}
    >
      {asksPassword && (
        <PasswordInput
          label={t.passwordLabel!}
          name="admin-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      )}
    </ConfirmDialog>
  );
}
