import { ButtonHTMLAttributes, forwardRef } from 'react';

export type TextButtonTone = 'muted' | 'accent';

// A button that reads as a link: "Retry", "Clear all filters", "View all". Muted
// is the quiet underlined one for a secondary escape hatch; accent is the red
// one for the action a section is really about.
const TONE_CLASSES: Record<TextButtonTone, string> = {
  muted: 'text-xs text-gray-400 underline hover:text-gray-600 dark:hover:text-gray-200',
  accent: 'text-xs font-semibold hover:underline',
};

export interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: TextButtonTone;
}

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(function TextButton(
  { tone = 'muted', className = '', type = 'button', style, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center gap-1.5 transition disabled:opacity-50 ${TONE_CLASSES[tone]} ${className}`}
      style={tone === 'accent' ? { color: 'var(--premium-red)', ...style } : style}
      {...rest}
    />
  );
});
