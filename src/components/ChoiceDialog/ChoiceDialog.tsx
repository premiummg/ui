import type { ReactNode } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { FieldError } from '../FieldError';
import { useUiText } from '../../lib/i18n';

// A question with a few answers, each a full-width button with a line that says what it does, and Cancel below.
// For example deleting someone "From this app only" or "From all apps": the danger answer is drawn in red, and is
// usually followed by a ConfirmDialog of its own.
export interface ChoiceDialogOption {
  label: string;
  hint?: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
}

export interface ChoiceDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  message?: ReactNode;
  options: ChoiceDialogOption[];
  /** A failure of the last answer, shown above the options. */
  error?: string | null;
  cancelLabel?: string;
}

const CANCEL = { en: 'Cancel', fr: 'Annuler' };

export function ChoiceDialog({ open, onClose, title, message, options, error, cancelLabel }: ChoiceDialogProps) {
  const defaultCancel = useUiText(CANCEL);
  const cancel = cancelLabel ?? defaultCancel;
  if (!open) return null;
  return (
    <Modal onClose={onClose} title={title} maxWidth="max-w-sm">
      {message && <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{message}</p>}
      {error && <FieldError scope="form" message={error} />}
      <div className="space-y-2">
        {options.map((o) => {
          const danger = o.tone === 'danger';
          return (
            <Button
              key={o.label}
              variant="secondary"
              onClick={o.onClick}
              disabled={o.disabled}
              className={`w-full flex-col items-start! text-left ${danger ? 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400' : ''}`}
            >
              <span className="block">{o.label}</span>
              {o.hint && <span className={`block text-xs font-normal ${danger ? 'text-red-400' : 'text-gray-400'}`}>{o.hint}</span>}
            </Button>
          );
        })}
      </div>
      <Button variant="secondary" onClick={onClose} className="mt-4 w-full justify-center">
        {cancel}
      </Button>
    </Modal>
  );
}
