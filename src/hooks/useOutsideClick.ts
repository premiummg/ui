import { RefObject, useEffect, useRef } from 'react';

// Closes a dropdown/menu/popover when the user mousedowns outside the given
// ref's element. `enabled` mirrors the "open" state each caller already
// tracks, so the listener isn't attached at all while closed.
export function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  enabled = true,
): void {
  // Every caller in this library passes a fresh inline `() => {...}` each
  // render, which would otherwise force this effect to tear down and re-add
  // its document-level listener on every single render of the host component
  // while open (not just when `enabled` actually flips) - reading the latest
  // callback through a ref, instead of putting it in the effect's own
  // dependency array, fixes that once here instead of needing a useCallback
  // at every call site.
  const onOutsideRef = useRef(onOutside);
  onOutsideRef.current = onOutside;

  useEffect(() => {
    if (!enabled) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutsideRef.current();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, enabled]);
}
