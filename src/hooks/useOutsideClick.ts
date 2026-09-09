import { RefObject, useEffect } from 'react';

// Closes a dropdown/menu/popover when the user mousedowns outside the given
// ref's element. `enabled` mirrors the "open" state each caller already
// tracks, so the listener isn't attached at all while closed.
export function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, enabled, onOutside]);
}
