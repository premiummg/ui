import { ReactNode } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

export interface PageHeaderProps {
  // Back-link row above everything else - an arrow and a label ("Dashboard",
  // "Employees", the page a drill-down came from). Omit `onBack` (a page
  // nothing drills into, e.g. Profile) to render no back row at all.
  backLabel?: string;
  onBack?: () => void;
  // The common shape - an index page's title, an optional row-count figure
  // next to it, and optional actions on the right. Covers most real pages.
  title?: ReactNode;
  count?: ReactNode;
  actions?: ReactNode;
  // For the header rows that don't fit that shape - a detail page's avatar
  // + status pill, a form page's date line - `children` replaces the
  // title/count/actions row entirely, the same escape hatch `Navbar`'s nav
  // items and `SiteFooter`'s columns use.
  children?: ReactNode;
  className?: string;
}

// The red band shell every real page in the app opens with - `.pmg-field` +
// `.pmg-bars` (BRAND.md pg. 16's "solid blocks of color that command
// attention", the same device as `ColorField`), rounded at the top to sit
// flush above a page's own white/dark content panel.
export function PageHeader({ backLabel, onBack, title, count, actions, children, className = '' }: PageHeaderProps) {
  return (
    <div className={`relative pmg-field rounded-t-2xl px-6 py-5 ${className}`}>
      <div className="absolute inset-0 pmg-bars rounded-t-2xl pointer-events-none" />
      <div className="relative">
        {onBack && backLabel && (
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition"
          >
            <FiArrowLeft size={16} /> {backLabel}
          </button>
        )}
        {children ?? (
          // items-start, not items-center: actions (a button, ~36px tall)
          // are usually taller than the plain title row (~28px), and
          // anything but items-start leaves dead space above the title to
          // center or bottom-align it against the taller sibling - the
          // gap that read as "too separated from the back link" above.
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-baseline gap-2.5">
              <h1 className="font-heading font-black text-2xl text-white leading-none">{title}</h1>
              {count != null && <span className="pmg-figure text-lg text-white/70">{count}</span>}
            </div>
            {/* flex-wrap, no shrink-0: `shrink-0` disables the browser's
                default flex-shrink, which is what lets this div size itself
                below its own unwrapped content width in the first place -
                with it set, flex-wrap on this same div has nothing to react
                to, and multiple actions (or a wide one, e.g. a date picker)
                can overflow the band on a narrow screen instead of wrapping
                onto their own line. */}
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
