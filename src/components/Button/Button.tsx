import { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'onColor' | 'onColorOutline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 'secondary' consolidates a pattern that was hand-repeated across dozens of
// confirm/cancel modals in timesheet-payroll-system (PurchaseOrderDetailPage,
// ProjectDetailPage, ...): "rounded-xl border border-gray-200
// dark:border-white/20 text-sm font-medium text-gray-600 dark:text-gray-300
// hover:bg-gray-50 dark:hover:bg-white/5". One definition here instead of N
// copies drifting apart.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // Reuses .btn-primary from styles.css (MAIN red, SECONDARY red on hover) -
  // per BRAND.md, the same color a destructive confirm button uses too
  // ("the confirm button is MAIN red"), so 'danger' is just an alias today.
  primary: 'btn-primary',
  danger: 'btn-primary',
  secondary:
    'rounded-xl border border-gray-200 dark:border-white/20 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition disabled:opacity-60',
  // A white pill for app chrome that itself sits on a solid colored field -
  // PageHeader's own `actions` slot is exactly this (a real page IS on a
  // .pmg-field band), which every real instance had to hand-roll the same
  // "bg-white ... hover:bg-white/90" shape for otherwise. No fixed text
  // color here on purpose: unlike primary/secondary/danger, the field this
  // sits on isn't always the same color (PageHeader's own `color` prop can
  // be anything), so the caller supplies it via `className`/`style`, same
  // as SiteButton's onRed/onDark do for the marketing-page equivalent of
  // this same idea.
  // The text takes the deep red of the band it sits on (every caller set it by hand with a style before).
  onColor: 'rounded-lg bg-white text-(--premium-red-dark) font-semibold hover:bg-white/90 transition disabled:opacity-60',
  // The quieter sibling of onColor for the other actions on the same colored
  // field (Cancel, Message, a secondary link back): an outline instead of a fill,
  // so the one white pill stays the one thing to act on.
  onColorOutline: 'rounded-lg border border-white/25 text-white/90 font-medium hover:bg-white/10 transition disabled:opacity-50',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  // The compact size real toolbars actually use for an inline action sitting
  // beside other chips (a table row, a filter bar) - not a guess, the exact
  // padding/text-size pair repeated across those spots in the app.
  xs: 'px-3 py-1.5 text-xs pointer-coarse:min-h-11',
  sm: 'px-3 py-2 text-sm pointer-coarse:min-h-11',
  md: 'px-4 py-2.5 text-sm pointer-coarse:min-h-11',
  // `px-6 py-3 text-sm` is `SiteButton`'s own size - the real hero-CTA size
  // this brand actually ships, not a guess, just given here too for app
  // chrome that wants that same weight without switching components.
  lg: 'px-6 py-3 text-sm',
  // No real xl button exists anywhere in the app today - this one extra
  // step is extrapolated from the rest of the scale (one more padding step,
  // one more text step up), not matched against a real spot the way every
  // other size here is.
  xl: 'px-8 py-3.5 text-base',
};

// Extends the native button element's own props, so `children` is inherited
// from there rather than declared here - unlike `Alert`'s `text` (always one
// line of message), a button's content routinely needs an icon next to a
// label ("<FiPlus /> Add employee"), so it stays a real composition slot the
// way every native <button> and every other button component already is.
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // A button that stays on or off (Reorder, Going): said to a screen reader with aria-pressed and drawn as held down.
  pressed?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  // `type` defaults to 'button', not the HTML default of 'submit' - a plain
  // <button> inside a <form> submits (and reloads/re-POSTs) that form the
  // instant it's clicked, which is very rarely what a "Cancel" or an
  // in-page action button sitting inside some form on the page actually
  // wants. Pass `type="submit"` explicitly on the one button per form that
  // should actually submit it.
  { variant = 'primary', size = 'md', className = '', type = 'button', pressed, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      // inline-flex items-center gap-2: Tailwind's preflight sets svg {
      // display: block }, so an icon passed in `children` next to a text
      // label (the whole reason `children` stays a real composition slot,
      // see above) would otherwise stack above the label instead of sitting
      // beside it - every other button-shaped component here already
      // includes its own flex layout for exactly this reason.
      aria-pressed={pressed}
      className={`inline-flex items-center gap-2 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${pressed ? 'ring-2 ring-inset ring-current/30' : ''} ${className}`}
      {...rest}
    />
  );
});
