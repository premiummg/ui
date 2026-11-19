import { useEffect, useRef } from 'react';

// While `open`, Escape calls `close` and nothing else. It is heard in the capture phase and marked as handled: a popover
// inside a Modal (a date picker, a time picker, a country list in a form) used to let the same keypress reach the Modal,
// which closed the whole dialog and threw the form away. Modal leaves an Escape that was already handled alone.
export function useEscapeToClose(open: boolean, close: () => void): void {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      closeRef.current();
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open]);
}
