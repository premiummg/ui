import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';

export interface StatCardProps {
  label: string;
  value: string;
  // A one-line caption (a plain string, the common case) - or, given a real
  // element instead, the "needs an action here, not just a caption" case: a
  // MonthNav/WeekNav period picker replacing the caption entirely (see
  // MonthNav's own InAStatCard story). Not exposed as a separate `action`
  // prop - a card showing one figure only ever has room for one of the two.
  hint?: ReactNode;
  // A small top-right icon (e.g. FiTrendingUp) - optional, purely decorative.
  icon?: IconType;
  // undefined = the default brand-red accent bar. 'amber' = the same
  // hi-vis stripe used for "needs attention" states elsewhere (a stat
  // like "Pending" or "Flagged" going above zero).
  accent?: 'amber';
  onClick?: () => void;
}

// A small at-a-glance figure: a label, the number itself (in the brand's
// tabular-numeral figure style), an optional one-line hint, and a colored
// left edge. Optionally clickable, in which case it renders as a real
// <button> rather than a div with an onClick, so it's reachable by keyboard
// and announced correctly to a screen reader - omit `onClick` when `hint`
// is itself interactive (a period picker), since a real <button> can't
// contain another interactive control.
export function StatCard({ label, value, hint, icon: Icon, accent, onClick }: StatCardProps) {
  const content = (
    <>
      {/* rounded-l-xl on the bar itself, not overflow-hidden on the card -
          the card can't clip its own overflow without ALSO clipping a real
          dropdown composed into `hint` (MonthNav/WeekNav's own popover),
          which needs to render past the card's edges to be visible at all. */}
      <span
        className={`absolute left-0 top-0 bottom-0 w-0.75 rounded-l-xl ${accent === 'amber' ? 'pmg-stripe' : ''}`}
        style={accent === 'amber' ? undefined : { backgroundColor: 'var(--premium-red)' }}
      />
      <div className="flex items-start justify-between mb-2.5 pl-1">
        <p className="pmg-eyebrow text-gray-400 dark:text-gray-500">{label}</p>
        {Icon && <Icon size={15} className="text-(--premium-red)" />}
      </div>
      <span className="pmg-figure text-3xl text-gray-900 dark:text-gray-100 pl-1 block">{value}</span>
      {hint && <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 pl-1">{hint}</div>}
    </>
  );

  const className = 'relative bg-white dark:bg-(--premium-dark-grey) rounded-xl border border-gray-100 dark:border-white/10 p-4 text-left w-full';

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} cursor-pointer hover:shadow-md transition-shadow`}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
