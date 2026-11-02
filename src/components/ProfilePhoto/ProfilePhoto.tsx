import { useState } from 'react';
import { Avatar, AvatarProps } from '../Avatar';
import { Button } from '../Button';
import { Modal } from '../Modal';

export interface ProfilePhotoProps extends Omit<AvatarProps, 'onClick'> {
  // The larger image to open, when it is not the one in the avatar (a list shows the small one). Defaults to `src`.
  fullSrc?: string | null;
  // The name of the button that opens the photo, read out by a screen reader (it has no text of its own).
  viewLabel: string;
  closeLabel: string;
}

// A person's avatar that opens their photo large when it is clicked. Without a photo it is just the avatar: there is
// nothing to open, so it is not a button either.
export function ProfilePhoto({ fullSrc, viewLabel, closeLabel, ...avatar }: ProfilePhotoProps) {
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  if (!avatar.src) return <Avatar {...avatar} />;
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
        <Modal onClose={() => setOpen(false)} ariaLabel={avatar.fullName || viewLabel} maxWidth="max-w-lg">
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
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setOpen(false)}>{closeLabel}</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
