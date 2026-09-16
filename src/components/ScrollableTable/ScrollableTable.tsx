import { useRef, useState, useEffect, ReactNode } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export interface ScrollableTableProps {
  maxHeight?: string;
  children: ReactNode;
}

const BTN = 'absolute z-20 w-7 h-7 rounded-full bg-white dark:bg-(--premium-steel-grey) border border-gray-200 dark:border-white/20 shadow-md flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition';
const FADE_H = 'pointer-events-none absolute left-0 right-0 h-10 z-10';
const FADE_V = 'pointer-events-none absolute top-0 bottom-0 w-16 z-10';

// Wraps a wide/tall table in a scroll container with fade edges and chevron
// nudge buttons on whichever sides currently have more content to scroll to -
// so overflow is discoverable instead of a silent cut-off edge.
export function ScrollableTable({ maxHeight = 'calc(100vh - 320px)', children }: ScrollableTableProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState({ left: false, right: false, up: false, down: false });

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
        <>
          <div className={`${FADE_V} left-0 bg-linear-to-r from-white dark:from-(--premium-dark-grey) to-transparent`} />
          <button onClick={() => ref.current?.scrollBy({ left: -200, behavior: 'smooth' })} className={`${BTN} left-2 top-1/2 -translate-y-1/2`}>
            <FiChevronLeft size={14} />
          </button>
        </>
      )}
      {s.right && (
        <>
          <div className={`${FADE_V} right-0 bg-linear-to-l from-white dark:from-(--premium-dark-grey) to-transparent`} />
          <button onClick={() => ref.current?.scrollBy({ left: 200, behavior: 'smooth' })} className={`${BTN} right-2 top-1/2 -translate-y-1/2`}>
            <FiChevronRight size={14} />
          </button>
        </>
      )}
      {s.up && (
        <>
          <div className={`${FADE_H} top-0 bg-linear-to-b from-white dark:from-(--premium-dark-grey) to-transparent`} />
          <button onClick={() => ref.current?.scrollBy({ top: -150, behavior: 'smooth' })} className={`${BTN} top-2 left-1/2 -translate-x-1/2`}>
            <FiChevronUp size={14} />
          </button>
        </>
      )}
      {s.down && (
        <>
          <div className={`${FADE_H} bottom-0 bg-linear-to-t from-white dark:from-(--premium-dark-grey) to-transparent`} />
          <button onClick={() => ref.current?.scrollBy({ top: 150, behavior: 'smooth' })} className={`${BTN} bottom-2 left-1/2 -translate-x-1/2`}>
            <FiChevronDown size={14} />
          </button>
        </>
      )}
      <div
        ref={ref}
        onScroll={update}
        style={{ maxHeight, scrollbarWidth: 'none' }}
        className="overflow-auto [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
