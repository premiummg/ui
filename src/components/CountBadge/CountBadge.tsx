export interface CountBadgeProps {
  count: number | string;
  className?: string;
}

export function CountBadge({ count, className = '' }: CountBadgeProps) {
  return (
    <span
      className={`pmg-figure text-xs text-white px-2.5 py-1 rounded-full ${className}`}
      style={{ backgroundColor: 'var(--premium-red)' }}
    >
      {count}
    </span>
  );
}
