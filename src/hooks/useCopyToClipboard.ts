import { useState, useCallback, useEffect, useRef } from 'react';
import { copyToClipboard } from '../lib/clipboard';

// Returns [copied, copy, reset]: `copied` flips to true for `resetMs` after a
// successful `copy(text)` call, so a "Copy" button can swap to a checkmark
// briefly without the caller managing its own timer.
export function useCopyToClipboard(resetMs = 2000): [boolean, (text: string) => Promise<void>, () => void] {
  const [copied, setCopied] = useState(false);
  // One timer at a time: a second copy before the first one's timer runs out starts the wait again, instead of the
  // first timer taking the check away early; and none is left running after the component goes.
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async (text: string) => {
    await copyToClipboard(text);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), resetMs);
  }, [resetMs]);

  const reset = useCallback(() => { clearTimeout(timer.current); setCopied(false); }, []);

  return [copied, copy, reset];
}
