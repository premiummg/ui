import { useEffect, useRef } from 'react';

// Scrolls its returned ref into view whenever `trigger` becomes truthy - wire
// it to a form's error/Alert wrapper so a validation failure is visible even
// when the submit button lives far from where the error renders (e.g. a
// sticky header above a long scrollable form).
export function useScrollToError<T extends HTMLElement = HTMLDivElement>(trigger: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (trigger) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [trigger]);
  return ref;
}
