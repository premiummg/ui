import { useEffect, useRef, useState } from 'react';
import { useOutsideClick } from './useOutsideClick';
import { useEscapeToClose } from './useEscapeToClose';

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

  // Escape closes the open popover and nothing else (see useEscapeToClose).
  useEscapeToClose(open, close);

  // Tab out of it closes it too: the focus moved to another control outside. A click on a part of the panel that takes
  // no focus moves it nowhere (relatedTarget is null), and that is not leaving it.
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    function onFocusOut(e: FocusEvent) {
      const next = e.relatedTarget as Node | null;
      if (next && !el!.contains(next)) closeRef.current();
    }
    el.addEventListener('focusout', onFocusOut);
    return () => el.removeEventListener('focusout', onFocusOut);
  }, [open]);

  return { open, setOpen, ref, close };
}
