import { CSSProperties } from 'react';

export interface StatusBadgeProps {
  label: string;
  colorClass: string;
  className?: string;
  // For a color that isn't a Tailwind class - a caller-supplied brand color
  // (e.g. `RankBadge`'s filled top step), rather than one of this app's own
  // fixed variants.
  style?: CSSProperties;
}

export function StatusBadge({ label, colorClass, className = '', style }: StatusBadgeProps) {
  return (
    <span
      style={style}
      className={`inline-block px-2.5 py-1 rounded-full font-heading font-bold uppercase tracking-wider text-[10px] leading-none ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
