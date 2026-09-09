import { ReactNode, useEffect, useRef, useState } from 'react';

export interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

// Fades a section in, once, the first time it scrolls into view - the
// standard landing-page "reveal on scroll" treatment. `motion-safe:` means a
// `prefers-reduced-motion` visitor gets no transition at all (content is
// simply there), and the deadman-switch timeout below means a visitor with
// motion OFF and this observer never firing still gets the content instead
// of a permanently-invisible section.
export function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setShown(true); return; }
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { setShown(true); io.disconnect(); }
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);

    // Deadman switch. Hiding content until an observer says otherwise means
    // that if the observer never fires - a browser quirk, a zero-height
    // element mid-layout, a container that never scrolls - the copy is gone
    // permanently and silently, with nothing in the console to say so. On a
    // landing page that failure costs the whole page.
    const bail = window.setTimeout(() => { setShown(true); io.disconnect(); }, 1500);
    return () => { window.clearTimeout(bail); io.disconnect(); };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out ${
        shown ? '' : 'motion-safe:opacity-0 motion-safe:translate-y-3'
      } ${className}`}
    >
      {children}
    </div>
  );
}
