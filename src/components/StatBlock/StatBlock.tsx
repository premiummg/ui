import { ReactNode } from 'react';

export interface StatBlockProps {
  value: string;
  label: ReactNode;
  // Any CSS color for the figure. Defaults to Premium's own secondary red -
  // same default as `ColorField`/`PortraitFigure` - any CSS color works for
  // a sister brand (e.g. a club's own maroon).
  color?: string;
  className?: string;
}

// One big centered figure with a short label underneath ("56% / Openness to
// new ideas"). For a small run of headline numbers a page wants to lead
// with - not the dashboard's `StatCard`, which is a left-accented, left-
// aligned at-a-glance figure meant for a data table's summary row.
export function StatBlock({ value, label, color = 'var(--premium-red-dark)', className = '' }: StatBlockProps) {
  return (
    <div
      className={`h-full rounded-2xl p-6 text-center bg-white dark:bg-(--premium-dark-grey) border border-gray-200 dark:border-white/10 ${className}`}
    >
      <p className="pmg-figure text-4xl leading-none" style={{ color }}>
        {value}
      </p>
      <p className="text-xs mt-3 leading-snug text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}
