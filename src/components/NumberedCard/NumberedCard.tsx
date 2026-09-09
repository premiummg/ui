import { CSSProperties, ReactNode } from 'react';

export interface NumberedCardProps {
  // A plain number gets zero-padded ("01", "02"...); pass a string directly
  // for anything else ("A", "I", "01a").
  number: number | string;
  title: string;
  children: ReactNode;
  // Any CSS color for the number. Defaults to Premium's own red - same
  // default as `ColorField`/`PortraitFigure`, since it is the same "solid
  // color that commands attention" device (BRAND.md pg. 16), applied to a
  // figure instead of a field or a tag.
  color?: string;
  className?: string;
}

// A numbered step in a process ("01 Contact and evaluation"). One corner is
// cut at the brand's own 45deg angle - the same discipline as `PortraitFigure`'s
// tag and the hero's wedge, and the reason there is no other angle on the card.
export function NumberedCard({ number, title, children, color = 'var(--premium-red)', className = '' }: NumberedCardProps) {
  const label = typeof number === 'number' ? String(number).padStart(2, '0') : number;
  // The plain color reads fine on the light card ground, but at 2.5:1 it
  // fails contrast on the dark one (`--premium-steel-grey`) - the same gap
  // `ErrorBoundary`'s dark texture had. Rather than hardcode Premium red's
  // own light tint (which only works for that one color), the dark variant
  // is derived from whatever `color` is given, so a caller's own color
  // still gets a readable dark-mode counterpart for free.
  const accentVars = {
    '--nc-accent': color,
    '--nc-accent-dark': `color-mix(in srgb, ${color} 60%, white)`,
  } as CSSProperties;

  return (
    <div
      className={`h-full bg-[#F2F2F2] dark:bg-(--premium-steel-grey) p-7 ${className}`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%)', ...accentVars }}
    >
      <p className="pmg-figure text-4xl leading-none text-(--nc-accent) dark:text-(--nc-accent-dark)">
        {label}
      </p>
      <h3 className="font-heading font-extrabold text-lg mt-5 text-(--premium-black) dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed mt-3 text-gray-600 dark:text-gray-400">{children}</p>
    </div>
  );
}
