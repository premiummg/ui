import { RefObject, useLayoutEffect, useRef, useState } from 'react';

const EDGE_GAP = 8;

// Which edge a dropdown panel should hang from so it stays on screen.
//
// `preferred` is the side the caller would like ('right' means the panel's right
// edge lines up with the trigger's and it grows leftward). That is only a
// preference: the panel is measured when it opens, and if it would run past the
// viewport on that side it hangs from the other one instead. A trigger near the
// left edge of the page therefore opens rightward without the caller having to
// know where it ends up on screen.
//
// Runs in a layout effect, so a flipped panel is corrected before it is painted.
export function usePopoverSide(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  preferred: 'left' | 'right' = 'right',
) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<'left' | 'right'>(preferred);

  useLayoutEffect(() => {
    if (!open) {
      setSide(preferred);
      return;
    }
    const container = containerRef.current;
    const panel = panelRef.current;
    if (!container || !panel) return;
    const { left, right } = container.getBoundingClientRect();
    const width = panel.offsetWidth;
    if (width === 0) return; // not laid out (hidden or no layout engine): nothing to measure
    const viewport = document.documentElement.clientWidth || window.innerWidth;
    const fits = {
      right: right - width >= EDGE_GAP,
      left: left + width <= viewport - EDGE_GAP,
    };
    const other = preferred === 'right' ? 'left' : 'right';
    setSide(fits[preferred] || !fits[other] ? preferred : other);
  }, [open, preferred, containerRef]);

  return { side, panelRef };
}
