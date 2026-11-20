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
  // A small uppercase line above the title ("Vendors catalogue", "Reports"). Optional.
  eyebrow?: ReactNode;
  count?: ReactNode;
  actions?: ReactNode;
  // Actions on the right of the Back row (history, edit, delete of a detail page), which drew their own Back for this.
  backActions?: ReactNode;
  // For the header rows that don't fit that shape - a detail page's avatar
  // + status pill, a form page's date line - `children` replaces the
  // title/count/actions row entirely, the same escape hatch `Navbar`'s nav
  // items and `SiteFooter`'s columns use.
  children?: ReactNode;
  // Same device as `ColorField` (`.pmg-field` + `.pmg-bars`, BRAND.md pg. 16)
  // - color/barsColor exist for exactly the same reason there: a sister
  // brand's own pages reuse this same header shell with their own palette
  // instead of a second component.
  color?: string;
  barsColor?: string;
  // The count figure defaults to white/70 - deliberately dimmer than the
  // title next to it (same "give the bold thing something to step up from"
  // idea as Eyebrow's own white/60), which assumes a dark-enough field.
  // A sister brand's own color (or just a lighter field) can need the count
  // in something else entirely to still read against it.
  countColor?: string;
  className?: string;
  // A band that runs edge to edge of the page (a dashboard), with no rounded top corners.
  flush?: boolean;
}

// The red band shell every real page in the app opens with - `.pmg-field` +
// `.pmg-bars` (BRAND.md pg. 16's "solid blocks of color that command
// attention", the same device as `ColorField`), rounded at the top to sit
// flush above a page's own white/dark content panel.
export function PageHeader({ backLabel, onBack, title, eyebrow, count, actions, backActions, children, color, barsColor, countColor, className = '', flush = false }: PageHeaderProps) {
  return (
    <div
      className={`relative pmg-field ${flush ? '' : 'rounded-t-2xl'} px-4 py-5 sm:px-6 ${className}`}
      style={color ? { backgroundColor: color } : undefined}
    >
      <div
        className={`absolute inset-0 pmg-bars ${flush ? '' : 'rounded-t-2xl'} pointer-events-none`}
        style={barsColor ? {
          backgroundImage: `repeating-linear-gradient(var(--pmg-angle), ${barsColor} 0px, ${barsColor} 2px, transparent 2px, transparent 12px)`,
        } : undefined}
      />
      <div className="relative">
        {((onBack && backLabel) || backActions) && (
          <div className="mb-3 flex items-center justify-between gap-2">
            {onBack && backLabel ? (
              <button type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition"
              >
                <FiArrowLeft size={16} /> {backLabel}
              </button>
            ) : <span />}
            {backActions && <div className="flex items-center gap-1">{backActions}</div>}
          </div>
        )}
        {children ?? (
          // items-start, not items-center: actions (a button, ~36px tall)
          // are usually taller than the plain title row (~28px), and
          // anything but items-start leaves dead space above the title to
          // center or bottom-align it against the taller sibling - the
          // gap that read as "too separated from the back link" above.
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {eyebrow != null && <p className="pmg-eyebrow text-white/70 mb-1.5">{eyebrow}</p>}
              <div className="flex items-baseline gap-2.5">
                <h1 className="font-heading font-black text-xl sm:text-2xl text-white leading-none">{title}</h1>
                {count != null && (
                  <span
                    className={`pmg-figure text-base sm:text-lg ${countColor ? '' : 'text-white/70'}`}
                    style={countColor ? { color: countColor } : undefined}
                  >
                    {count}
                  </span>
                )}
              </div>
            </div>
            {/* flex-wrap, no shrink-0: `shrink-0` disables the browser's
                default flex-shrink, which is what lets this div size itself
                below its own unwrapped content width in the first place -
                with it set, flex-wrap on this same div has nothing to react
                to, and multiple actions (or a wide one, e.g. a date picker)
                can overflow the band on a narrow screen instead of wrapping
                onto their own line. */}
            {actions && <div className="flex flex-wrap items-center gap-2 ml-auto">{actions}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
