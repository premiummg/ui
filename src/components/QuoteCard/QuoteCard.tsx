import { ReactNode } from 'react';

export interface QuoteCardProps {
  quote: ReactNode;
  name: ReactNode;
  className?: string;
}

// A short customer quote with the brand's own corner bracket (`.pmg-bracket`,
// BRAND.md pg. 12/16/22) hanging off the top-left of the blockquote, rather
// than a generic quotation mark. All quotes on a page render side by side,
// none moving - a carousel would let a page claim more social proof than the
// screen can hold, at the cost of sliding text sideways while it is read.
export function QuoteCard({ quote, name, className = '' }: QuoteCardProps) {
  return (
    <figure
      className={`h-full rounded-2xl p-7 bg-white dark:bg-(--premium-dark-grey) border border-gray-200 dark:border-white/10 ${className}`}
    >
      <blockquote className="pmg-bracket font-heading font-bold text-lg leading-snug text-(--premium-black) dark:text-white">
        {quote}
      </blockquote>
      <figcaption className="text-sm text-gray-500 dark:text-gray-400 mt-4 pl-4.5">{name}</figcaption>
    </figure>
  );
}
