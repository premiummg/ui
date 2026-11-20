import { useState } from 'react';

// Guards a modal's close (backdrop click, Escape, an explicit Cancel button:
// Modal from @premiummg/ui routes all three through whatever function is
// passed as onClose, with no close-interception hook of its own) behind a
// confirm step whenever there's real unsaved work to lose. An empty/
// unchanged form just closes immediately, only interrupting when there's
// actually something to discard, the same judgment call most editors make
// rather than confirming every single close.
export function useConfirmDiscard(isDirty: boolean, close: () => void) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  function requestClose() {
    if (isDirty) setConfirmOpen(true);
    else close();
  }
  function confirmDiscard() {
    setConfirmOpen(false);
    close();
  }
  function keepEditing() {
    setConfirmOpen(false);
  }

  return { confirmOpen, requestClose, confirmDiscard, keepEditing };
}
