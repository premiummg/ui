import type { IconType } from 'react-icons';
import { Modal } from '../Modal';
import { Button } from '../Button';
import type { ButtonVariant } from '../Button';
import { WARNING_TEXT_CLASS } from '../../lib/severityColors';

export type ConfirmDialogTone = 'danger' | 'caution';

export interface ConfirmDialogAction {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  tone?: ConfirmDialogTone;
  // Optional - plenty of real confirmations are just a title/message with no
  // icon tile at all ("Sign out?"). Title/message center-align only when one
  // is given, same as when it isn't.
  icon?: IconType;
  title: string;
  message: string;
  // Either the default confirm/cancel pair (confirmLabel/cancelLabel/
  // onConfirm) or, for a flow that needs something other than exactly two
  // buttons ("Save draft" / "Discard" / "Cancel", a single "Got it"...),
  // a fully custom row via `actions` - when given, it replaces the default
  // pair entirely and confirmLabel/cancelLabel/onConfirm are ignored.
  confirmLabel?: string;
  cancelLabel?: string;
  actions?: ConfirmDialogAction[];
  // Disables both default buttons - for a confirm that kicks off a real
  // request (a delete, a save) and shouldn't accept a second click while
  // the first is still in flight. Ignored when `actions` is given; disable
  // each action's own onClick at the call site instead.
  confirmDisabled?: boolean;
}

const TONE_STYLES: Record<ConfirmDialogTone, { tile: string; icon: string }> = {
  // Same MAIN red a destructive confirm button already uses (BRAND.md,
  // see Button's own 'danger' variant) - the icon tile just previews it.
  danger: { tile: 'bg-(--premium-red-light)', icon: 'text-(--premium-red)' },
  // Same amber StatusBadge's `warning` tone uses - shared so the two can't
  // drift apart again (they previously disagreed by a full shade step).
  caution: { tile: 'bg-amber-100 dark:bg-amber-900/30', icon: WARNING_TEXT_CLASS },
};

// A centered icon + title + message + confirm/cancel pair, composed on top
// of Modal rather than reimplementing the overlay/Escape-key/backdrop
// mechanics a second time. Most apps here compose confirmations from Modal
// directly instead (see BRAND.md's "what is intentionally not here") - this
// exists for the ones that want the packaged shape instead of hand-rolling
// it per confirm flow.
export function ConfirmDialog({
  open, onClose, onConfirm, tone = 'danger', icon: Icon, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel', actions, confirmDisabled = false,
}: ConfirmDialogProps) {
  if (!open) return null;
  const { tile, icon } = TONE_STYLES[tone];
  return (
    <Modal onClose={onClose} maxWidth="max-w-sm">
      {Icon && (
        <div className={`w-12 h-12 rounded-lg grid place-items-center mb-4 mx-auto ${tile}`}>
          <Icon size={22} className={icon} />
        </div>
      )}
      <h3 className={`font-heading font-bold text-gray-900 dark:text-gray-100 mb-1 ${Icon ? 'text-center' : ''}`}>{title}</h3>
      <p className={`text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed ${Icon ? 'text-center' : ''}`}>{message}</p>
      <div className="flex gap-2">
        {actions ? (
          actions.map((action, i) => (
            <Button key={i} variant={action.variant ?? 'secondary'} className="flex-1 justify-center" onClick={action.onClick}>
              {action.label}
            </Button>
          ))
        ) : (
          <>
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              className="flex-1 justify-center"
              onClick={onConfirm ?? onClose}
              disabled={confirmDisabled}
            >
              {confirmLabel}
            </Button>
            <Button variant="secondary" className="flex-1 justify-center" onClick={onClose} disabled={confirmDisabled}>
              {cancelLabel}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
