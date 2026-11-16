import { ReactNode } from 'react';

export interface SiteFooterProps {
  // The columns themselves - a logo/address block, a links list, contact
  // info, a newsletter signup, whatever the site needs. Each app's own
  // content (services offered, hours, a signup form's state) is exactly
  // what doesn't belong in a shared package, so it's composed in via
  // children rather than owned here. Pair with `FooterColumn` for the
  // repeating "eyebrow label + content" shape those columns tend to share.
  children: ReactNode;
  copyright: ReactNode;
  // Terms, privacy, etc. - rendered to the right of `copyright` in the
  // bottom bar.
  legalLinks?: ReactNode;
  // How many columns the grid lays out at full width (default 4). A footer
  // with 3 or 5 real columns used to leave an empty cell or wrap one alone
  // onto its own row, which is why sister sites built their own shell.
  columns?: SiteFooterColumns;
  // A full-width band above the columns, divided from them by a hairline: a
  // row of certification badges, a closing call to action.
  top?: ReactNode;
  className?: string;
}

export type SiteFooterColumns = 2 | 3 | 4 | 5;

// Spelled out, not built from the number - Tailwind only generates classes it
// can find written in full.
const GRID: Record<SiteFooterColumns, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
  5: 'md:grid-cols-3 lg:grid-cols-5',
};

// The dark marketing-site footer shell: a column grid on Premium Black,
// then a copyright bar below a hairline. Not a `Navbar`-style default-empty
// shell - it ships a real 4-column responsive grid and bottom bar, since
// that structure (unlike a real navbar's business-specific nav items) is
// genuinely the same across most marketing sites.
export function SiteFooter({ children, copyright, legalLinks, columns = 4, top, className = '' }: SiteFooterProps) {
  return (
    <footer className={`bg-(--premium-black) text-white/70 ${className}`}>
      {top && (
        <div className="border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-8">{top}</div>
        </div>
      )}
      <div className={`max-w-6xl mx-auto px-6 py-16 grid ${GRID[columns]} gap-10`}>
        {children}
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-white/70">
          <p>{copyright}</p>
          {legalLinks && <div className="flex items-center gap-6">{legalLinks}</div>}
        </div>
      </div>
    </footer>
  );
}

export interface FooterColumnProps {
  label?: string;
  children: ReactNode;
}

// One footer column: an optional uppercase eyebrow label, then whatever
// content that column needs (a links list, contact details, a form).
// The label and the copyright bar are white at 70%, not 40%: 40% white on
// Premium Black is about 3.7:1, under the 4.5:1 that 10-12px text needs.
export function FooterColumn({ label, children }: FooterColumnProps) {
  return (
    <div>
      {label && <p className="pmg-eyebrow text-white/70 mb-4">{label}</p>}
      {children}
    </div>
  );
}
