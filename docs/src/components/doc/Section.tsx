import { useEffect, useRef, type ReactNode } from 'react';

export function Section({ id, n, title, note, children }: {
  id: string; n: string; title: string; note?: ReactNode; children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 mb-16">
      <div className="flex items-baseline gap-3 mb-1">
        <span className="pmg-figure text-sm text-(--premium-red)">{n}</span>
        <h2 className="font-heading font-extrabold text-xl text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      {note && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-3xl leading-relaxed mb-5">{note}</p>
      )}
      {children}
    </section>
  );
}

export const PANEL = 'bg-white dark:bg-(--premium-dark-grey) rounded-2xl border border-gray-100 dark:border-white/10';

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${PANEL} ${className}`}>{children}</div>;
}

export function Spec({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 pt-3 border-t border-gray-100 dark:border-white/10 font-mono text-[11px] text-gray-400 dark:text-gray-500">
      {children}
    </p>
  );
}

// A handful of components are full page shells (AuthShell/Layout use
// min-h-screen, which is 100vh regardless of nesting) or otherwise meant to
// fill an entire viewport width (Navbar, Hero, SiteFooter, PageHeader).
// Framing them in a fixed-height, scrollable, rounded box keeps the demo a
// bounded "preview window" instead of the real element stretching the whole
// catalog page to its own full height.
export function FramedPreview({ children, height = 420, center = false }: {
  children: ReactNode; height?: number;
  // Only for a component that centers its OWN content vertically against
  // the real viewport (AuthShell, ErrorBoundary's fallback both use
  // `items-center justify-center` on a min-h-screen root) - opening scrolled
  // to the top would show nothing but the empty space above that centered
  // content. Everything else here (Layout, Navbar, Hero, PageHeader,
  // SiteFooter) anchors its content at the TOP instead, so centering the
  // scroll for those would scroll PAST the real content into empty space
  // below it - top (the default) is what those actually need.
  center?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!center) return;
    const el = ref.current;
    if (el) el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, [center]);

  return (
    <div
      ref={ref}
      className="w-full rounded-xl border border-gray-200 dark:border-white/10 overflow-y-auto overflow-x-hidden"
      style={{ height, transform: 'translateZ(0)' }}
    >
      {children}
    </div>
  );
}

export function Callout({ children, tone = 'amber' }: { children: ReactNode; tone?: 'amber' | 'red' }) {
  const cls = tone === 'amber'
    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/60'
    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/60';
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${cls}`}>
      {children}
    </div>
  );
}
