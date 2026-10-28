import { ButtonHTMLAttributes, forwardRef } from 'react';

export type IconButtonTone = 'neutral' | 'danger' | 'onColor';
export type IconButtonSize = 'sm' | 'md';

// The three icon-only buttons the app repeated by hand in every table row and
// page band: a quiet gray one for a row action (edit, toggle), one that turns
// red on hover for a destructive one (delete, remove), and an outlined one for
// the colored band (refresh, download). The label is required because there is
// no text to name the button for a screen reader.
const TONE_CLASSES: Record<IconButtonTone, string> = {
  neutral: 'text-gray-400 hover:text-[#3A3A3A] hover:bg-[#3A3A3A]/10 dark:hover:text-gray-100 dark:hover:bg-white/10',
  danger: 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400',
  onColor: 'border border-white/25 text-white/90 hover:bg-white/10',
};

// sm sits in a table row; md is the square the page band uses next to a 36px button.
const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: 'p-1.5',
  md: 'w-9 h-9',
};

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  'aria-label': string;
  tone?: IconButtonTone;
  size?: IconButtonSize;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { tone = 'neutral', size = 'sm', className = '', type = 'button', title, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      title={title ?? rest['aria-label']}
      className={`inline-grid place-items-center rounded-lg transition disabled:opacity-40 ${TONE_CLASSES[tone]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    />
  );
});
