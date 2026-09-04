import { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md';

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
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    />
  );
});
