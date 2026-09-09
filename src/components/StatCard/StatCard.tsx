export interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
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
// and announced correctly to a screen reader.
export function StatCard({ label, value, hint, accent, onClick }: StatCardProps) {
  const content = (
    <>
      <span
        className={`absolute left-0 top-0 bottom-0 w-0.75 ${accent === 'amber' ? 'pmg-stripe' : ''}`}
        style={accent === 'amber' ? undefined : { backgroundColor: 'var(--premium-red)' }}
      />
      <p className="pmg-eyebrow text-gray-400 dark:text-gray-500 mb-2.5 pl-1">{label}</p>
      <span className="pmg-figure text-3xl text-gray-900 dark:text-gray-100 pl-1 block">{value}</span>
      {hint && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 pl-1">{hint}</p>}
    </>
  );

  const className = 'relative bg-white dark:bg-(--premium-dark-grey) rounded-xl border border-gray-100 dark:border-white/10 p-4 overflow-hidden text-left w-full';

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} cursor-pointer hover:shadow-md transition-shadow`}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
