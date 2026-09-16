import { useRef, useState } from 'react';
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

  return { open, setOpen, ref, close };
}
