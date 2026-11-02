import { useState } from 'react';
import { Avatar, AvatarProps } from '../Avatar';
import { Button } from '../Button';
import { ConfirmDialog } from '../ConfirmDialog';
import { Modal } from '../Modal';

export interface ProfilePhotoRemoveLabels {
  // The button next to the large photo.
  remove: string;
  // The confirmation that follows it.
  title: string;
  message: string;
  confirm: string;
  cancel: string;
}

export interface ProfilePhotoProps extends Omit<AvatarProps, 'onClick'> {
  // The larger image to open, when it is not the one in the avatar (a list shows the small one). Defaults to `src`.
  fullSrc?: string | null;
  // The name of the button that opens the photo, read out by a screen reader (it has no text of its own).
  viewLabel: string;
  closeLabel: string;
  // Give this when whoever looks may take the photo off (the person, or an admin): the large photo then has a button for it,
  // which asks to confirm. It does the real call and reports its own errors (a toast); when it rejects the photo stays and
  // the dialog stays open, so it can be tried again.
  onRemove?: () => Promise<unknown>;
  removeLabels?: ProfilePhotoRemoveLabels;
}

// A person's avatar that opens their photo large when it is clicked. Without a photo it is just the avatar: there is
// nothing to open, so it is not a button either.
export function ProfilePhoto({ fullSrc, viewLabel, closeLabel, onRemove, removeLabels, ...avatar }: ProfilePhotoProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [broken, setBroken] = useState(false);
  if (!avatar.src) return <Avatar {...avatar} />;
  const canRemove = !!onRemove && !!removeLabels;

  async function handleRemove() {
    setRemoving(true);
    try {
      await onRemove!();
      setConfirming(false);
      setOpen(false);
    } catch {
      // The host already told the person; the photo is still there, and the confirmation stays to try again or cancel.
    } finally {
      setRemoving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={viewLabel}
        title={viewLabel}
        className={`shrink-0 cursor-zoom-in transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${avatar.shape === 'tile' ? 'rounded-xl' : 'rounded-full'}`}
      >
        <Avatar {...avatar} />
      </button>
      {open && (
        <Modal onClose={() => { if (!confirming) setOpen(false); }} ariaLabel={avatar.fullName || viewLabel} maxWidth="max-w-lg">
          <div className="p-4">
            {broken ? (
              <Avatar fullName={avatar.fullName} size={160} shape="tile" />
            ) : (
              <img
                src={fullSrc ?? avatar.src}
                alt={avatar.fullName}
                onError={() => setBroken(true)}
                className="mx-auto max-h-[70vh] w-full rounded-xl object-contain"
              />
            )}
            {avatar.fullName && (
              <p className="mt-3 text-center font-heading text-sm font-semibold text-gray-900 dark:text-gray-100">{avatar.fullName}</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              {canRemove && (
                <Button variant="secondary" onClick={() => setConfirming(true)}>{removeLabels!.remove}</Button>
              )}
              <Button variant="secondary" onClick={() => setOpen(false)}>{closeLabel}</Button>
            </div>
          </div>
        </Modal>
      )}
      {canRemove && (
        <ConfirmDialog
          open={confirming}
          onClose={() => { if (!removing) setConfirming(false); }}
          onConfirm={handleRemove}
          tone="danger"
          title={removeLabels!.title}
          message={removeLabels!.message}
          confirmLabel={removeLabels!.confirm}
          cancelLabel={removeLabels!.cancel}
          confirmDisabled={removing}
        />
      )}
    </>
  );
}
