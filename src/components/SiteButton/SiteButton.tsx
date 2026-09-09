import { ButtonHTMLAttributes } from 'react';

export type SiteButtonVariant = 'primary' | 'ghost' | 'onRed' | 'onDark';

export interface SiteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SiteButtonVariant;
}

// A landing/marketing-page button - distinct from this package's own
// `Button` (which is scoped to app chrome via `.btn-primary`) because a
// marketing page's buttons sit on whatever surface the section around them
// uses: a plain page background, a solid brand-red band, a dark footer. Each
// of those needs its own contrast-safe treatment, which is what the extra
// variants below are for - `onRed`/`onDark` invert so a button never goes
// invisible against its own section.
const BASE = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-heading font-bold text-sm tracking-tight transition-all duration-150';

const VARIANT_CLASSES: Record<SiteButtonVariant, string> = {
  // MAIN red at rest, SECONDARY red on hover.
  primary: 'text-white shadow-sm hover:shadow-md bg-(--premium-red) hover:bg-(--premium-red-dark)',
  ghost: 'border border-gray-300 dark:border-white/25 text-gray-800 dark:text-gray-200 hover:border-gray-900 dark:hover:border-white/60 hover:bg-white dark:hover:bg-white/5',
  // A solid-red button on a solid-red field is not a button - invert instead.
  onRed: 'bg-white text-(--premium-red-dark) hover:bg-[#F2F2F2]',
  onDark: 'border border-white/30 text-white hover:bg-white/10 hover:border-white/60',
};

export function SiteButton({ variant = 'primary', className = '', type = 'button', ...rest }: SiteButtonProps) {
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    />
  );
}
