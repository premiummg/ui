import { useRef, useState, useEffect, ReactNode, PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export interface ScrollableTableProps {
  maxHeight?: string;
  children: ReactNode;
  // Click-and-drag with the mouse pans the content sideways, like a touch
  // swipe but mouse-only and horizontal-only (vertical scroll keeps working
  // through the wheel/scrollbar/touch as usual, untouched). Off by default:
  // it trades away click-drag text selection inside the scrolled content
  // for the pan gesture, so it's opt-in rather than a silent behavior
  // change for every existing table using this component.
  dragToScroll?: boolean;
}

// How far the pointer has to move (px) before a mousedown-then-move counts
// as a drag rather than a click.
const DRAG_THRESHOLD_PX = 10;

const BTN = 'absolute z-20 w-7 h-7 rounded-full bg-white dark:bg-(--premium-steel-grey) border border-gray-200 dark:border-white/20 shadow-md flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition';
const FADE_H = 'pointer-events-none absolute left-0 right-0 h-10 z-10';
const FADE_V = 'pointer-events-none absolute top-0 bottom-0 w-16 z-10';

// Wraps a wide/tall table in a scroll container. On a touchscreen (no
// precise pointer) it hides the native scrollbar and shows fade edges plus
// chevron nudge buttons on whichever sides currently have more content -
// swiping is the natural gesture there, and a thin scroll thumb is easy to
// miss with a finger. On a mouse/trackpad (`(hover: hover) and
// (pointer: fine)`, see .pmg-scrollbar/.pmg-touch-scroll-hint in styles.css)
// it's the other way around: a real, brand-red scrollbar is the familiar,
// always-grabbable affordance, and the fade/chevron overlay is hidden so the
// two don't double up.
export function ScrollableTable({ maxHeight = 'calc(100vh - 320px)', children, dragToScroll = false }: ScrollableTableProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState({ left: false, right: false, up: false, down: false });
  // Plain refs, not state - a drag fires pointermove dozens of times a
  // second, and none of it needs a re-render (scrollLeft and the cursor are
  // set directly on the DOM node).
  const dragRef = useRef<{ startX: number; startScrollLeft: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragToScroll || e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    // Nothing to pan - never arm the drag at all, so a click anywhere on a
    // table that currently fits can never be misread as one.
    if (el.scrollWidth <= el.clientWidth + 1) return;
    dragRef.current = { startX: e.clientX, startScrollLeft: el.scrollLeft, moved: false };
    // Pointer capture is NOT grabbed here. Capturing on every mousedown,
    // before we know this is a drag at all, makes the browser retarget the
    // click that follows to this element instead of whatever was actually
    // under the cursor - which breaks any onClick living further down the
    // tree (a row's own onClick, a link) for every ordinary click, not just
    // ones that cross the drag threshold. We only take capture once a real
    // drag is confirmed, in handlePointerMove below.
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const el = ref.current;
    if (!drag || !el) return;
    const dx = e.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) > DRAG_THRESHOLD_PX) {
      drag.moved = true;
      el.style.cursor = 'grabbing';
      el.setPointerCapture?.(e.pointerId);
    }
    if (drag.moved) el.scrollLeft = drag.startScrollLeft - dx;
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const el = ref.current;
    if (!drag || !el) return;
    if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    // A real drag swallows the click that would otherwise fire on release
    // (e.g. a row's own onClick, or a RowLink inside it) - a plain click
    // (never crossed the threshold) is left alone, so this feature doesn't
    // interfere with normal clicking anywhere in the table.
    if (drag.moved) suppressClickRef.current = true;
    el.style.cursor = '';
    dragRef.current = null;
  }

  function handleClickCapture(e: ReactMouseEvent<HTMLDivElement>) {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    e.preventDefault();
    e.stopPropagation();
  }

  function update() {
    const el = ref.current;
    if (!el) return;
    setS({
      left: el.scrollLeft > 0,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
      up: el.scrollTop > 0,
      down: el.scrollTop + el.clientHeight < el.scrollHeight - 1,
    });
  }

  useEffect(() => { requestAnimationFrame(update); }, [children]);

  // Also recompute on resize (sidebar toggling, window resize, a breakpoint
  // shift) - none of those change `children`, so without this the fade/
  // chevron affordances can go stale even though the container's actual
  // overflow just changed.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => update());
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      {s.left && (
        <div className="contents pmg-touch-scroll-hint">
          <div className={`${FADE_V} left-0 bg-linear-to-r from-white dark:from-(--premium-dark-grey) to-transparent`} />
          <button onClick={() => ref.current?.scrollBy({ left: -200, behavior: 'smooth' })} className={`${BTN} left-2 top-1/2 -translate-y-1/2`}>
            <FiChevronLeft size={14} />
          </button>
        </div>
      )}
      {s.right && (
        <div className="contents pmg-touch-scroll-hint">
          <div className={`${FADE_V} right-0 bg-linear-to-l from-white dark:from-(--premium-dark-grey) to-transparent`} />
          <button onClick={() => ref.current?.scrollBy({ left: 200, behavior: 'smooth' })} className={`${BTN} right-2 top-1/2 -translate-y-1/2`}>
            <FiChevronRight size={14} />
          </button>
        </div>
      )}
      {s.up && (
        <div className="contents pmg-touch-scroll-hint">
          <div className={`${FADE_H} top-0 bg-linear-to-b from-white dark:from-(--premium-dark-grey) to-transparent`} />
          <button onClick={() => ref.current?.scrollBy({ top: -150, behavior: 'smooth' })} className={`${BTN} top-2 left-1/2 -translate-x-1/2`}>
            <FiChevronUp size={14} />
          </button>
        </div>
      )}
      {s.down && (
        <div className="contents pmg-touch-scroll-hint">
          <div className={`${FADE_H} bottom-0 bg-linear-to-t from-white dark:from-(--premium-dark-grey) to-transparent`} />
          <button onClick={() => ref.current?.scrollBy({ top: 150, behavior: 'smooth' })} className={`${BTN} bottom-2 left-1/2 -translate-x-1/2`}>
            <FiChevronDown size={14} />
          </button>
        </div>
      )}
      <div
        ref={ref}
        onScroll={update}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={handleClickCapture}
        style={{ maxHeight }}
        className={`overflow-auto pmg-scrollbar ${dragToScroll ? 'pmg-drag-scroll' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}
