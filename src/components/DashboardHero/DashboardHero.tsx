import type { ReactNode } from 'react';

// The red band at the top of an app's home page: an eyebrow (today's date, the role), the greeting and a line under
// it, on the brand field with its 45 degree bars and a diagonal bottom edge. The page's own content follows below
// and usually tucks up under the diagonal with a negative top margin (-mt-6 or -mt-8).
export interface DashboardHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
}

export function DashboardHero({ eyebrow, title, subtitle }: DashboardHeroProps) {
  return (
    <div className="relative pmg-field pmg-diagonal-bottom overflow-hidden px-4 pb-14 pt-7 sm:px-6">
      <div className="pmg-bars pointer-events-none absolute inset-0" />
      <div className="relative">
        {eyebrow && <p className="pmg-eyebrow mb-2 text-white/70">{eyebrow}</p>}
        <h1 className="font-heading text-2xl font-black leading-tight text-white sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-white/80">{subtitle}</p>}
      </div>
    </div>
  );
}
