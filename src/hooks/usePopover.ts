import { useEffect, useRef, useState } from 'react';
import { useOutsideClick } from './useOutsideClick';

// The open/ref/outside-click-to-close wiring every dropdown-shaped component
// in this library needs (OverflowMenu, SearchPicker, DatePicker, MonthNav,
// WeekNav, NotificationBell all wrote this out by hand). `onClose` is for a
// caller's own extra reset alongside setOpen(false) - e.g. DatePicker/
// MonthNav/WeekNav also reset their internal picker `view` back to its
// default, SearchPicker clears its query.
export function usePopover<T extends HTMLElement = HTMLDivElement>(onClose?: () => void) {
  const [open, setOpen] = useState(false);
  const ref = useRef<T>(null);

  function close() {
    setOpen(false);
    onClose?.();
  }

  useOutsideClick(ref, close, open);

  // Escape closes the open popover and nothing else. It is heard in the capture phase and marked as handled: a
  // popover inside a Modal (a date picker in a form) used to let the same keypress reach the Modal, which closed the
  // whole dialog and threw the form away. Modal leaves an Escape that was already handled alone.
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

  return { open, setOpen, ref, close };
}
