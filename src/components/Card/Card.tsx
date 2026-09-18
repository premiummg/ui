import { CSSProperties, ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  /** Defaults to true (the standard p-6) - pass `padding={false}` to opt out
   *  (a table/list wrapper, or content that brings its own p-* spacing). */
  padding?: boolean;
  id?: string;
  style?: CSSProperties;
}

export function Card({ children, className = '', padding = true, id, style }: CardProps) {
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
