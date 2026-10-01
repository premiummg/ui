import { useState, useCallback } from 'react';
import { copyToClipboard } from '../lib/clipboard';

// Returns [copied, copy, reset]: `copied` flips to true for `resetMs` after a
// successful `copy(text)` call, so a "Copy" button can swap to a checkmark
// briefly without the caller managing its own timer.
export function useCopyToClipboard(resetMs = 2000): [boolean, (text: string) => Promise<void>, () => void] {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), resetMs);
  }, [resetMs]);

  const reset = useCallback(() => setCopied(false), []);

  return [copied, copy, reset];
}
