import { CSSProperties, ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  /** Defaults to false - pass `padding` to get the standard p-6. */
  padding?: boolean;
  id?: string;
  style?: CSSProperties;
}

export function Card({ children, className = '', padding = false, id, style }: CardProps) {
  return (
    <div
      id={id}
      style={style}
      className={`bg-white dark:bg-[var(--premium-dark-grey)] rounded-2xl border border-gray-100 dark:border-white/10 ${padding ? 'p-6' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
