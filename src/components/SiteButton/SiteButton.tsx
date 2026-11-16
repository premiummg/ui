import { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent } from 'react';
import { isPlainLeftClick } from '../../lib/linkClick';

export type SiteButtonVariant = 'primary' | 'ghost' | 'onRed' | 'onDark';

interface SiteButtonCommon {
  variant?: SiteButtonVariant;
  className?: string;
}

// Without `href`: a real <button>, exactly as before.
export interface SiteButtonAsButton extends SiteButtonCommon, ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
  onNavigate?: undefined;
}

// With `href`: a real <a>, because a marketing page's buttons are mostly
// links ("Get your estimate" opens the contact page, "View all projects"
// opens the projects page). A <button> that calls navigate() has no URL a
// visitor can open in a new tab, copy, or that a crawler can follow.
// `onNavigate` is for a client-side router: a plain click calls it instead of
// letting the browser reload the page, while Ctrl/Cmd-click and middle-click
// still open a new tab.
export interface SiteButtonAsLink extends SiteButtonCommon, AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  onNavigate?: () => void;
}

export type SiteButtonProps = SiteButtonAsButton | SiteButtonAsLink;

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

// The same classes SiteButton itself uses, for the rare element that has to
// look like one but can't be one (a router's own <Link>, a <summary>).
export function siteButtonClasses(variant: SiteButtonVariant = 'primary', className = ''): string {
  return `${BASE} ${VARIANT_CLASSES[variant]} ${className}`;
}

export function SiteButton(props: SiteButtonProps) {
  if (props.href !== undefined) {
    const { variant = 'primary', className = '', onNavigate, onClick, ...rest } = props as SiteButtonAsLink;
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented || !onNavigate || !isPlainLeftClick(e)) return;
      e.preventDefault();
      onNavigate();
    };
    return <a className={siteButtonClasses(variant, className)} onClick={handleClick} {...rest} />;
  }
  const { variant = 'primary', className = '', type = 'button', ...rest } = props as SiteButtonAsButton;
  return <button type={type} className={siteButtonClasses(variant, className)} {...rest} />;
}
