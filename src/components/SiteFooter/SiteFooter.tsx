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
  className?: string;
}

// The dark marketing-site footer shell: a column grid on Premium Black,
// then a copyright bar below a hairline. Not a `Navbar`-style default-empty
// shell - it ships a real 4-column responsive grid and bottom bar, since
// that structure (unlike a real navbar's business-specific nav items) is
// genuinely the same across most marketing sites.
export function SiteFooter({ children, copyright, legalLinks, className = '' }: SiteFooterProps) {
  return (
    <footer className={`bg-(--premium-black) text-white/70 ${className}`}>
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        {children}
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-white/40">
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
export function FooterColumn({ label, children }: FooterColumnProps) {
  return (
    <div>
      {label && <p className="pmg-eyebrow text-white/40 mb-4">{label}</p>}
      {children}
    </div>
  );
}
