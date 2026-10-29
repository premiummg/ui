import { ChangeEvent, InputHTMLAttributes, ReactNode, useEffect, useRef } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'checked'> {
  checked: boolean;
  onChange: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  // The visible text next to the box. Leave it out only for a bare box in a table row or header, and then give
  // it an aria-label: a checkbox with no name says nothing to a screen reader.
  label?: ReactNode;
  // A smaller line of explanation under the label.
  hint?: ReactNode;
  // The mixed state of a "select all" box when only some rows are selected.
  indeterminate?: boolean;
  // 'start' aligns the box with the first line of a label that wraps over several.
  align?: 'center' | 'start';
}

// A checkbox in the brand red, labeled. With a label, the whole line (box and text) is the click target.
export function Checkbox({ checked, onChange, label, hint, align = 'center', indeterminate, className = '', disabled, ...rest }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  const box = (
    <input
      {...rest}
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked, e)}
      className={`h-3.5 w-3.5 shrink-0 rounded accent-(--premium-red) ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${align === 'start' ? 'mt-0.5' : ''} ${label === undefined ? className : ''}`}
    />
  );
  if (label === undefined) return box;
  return (
    <label className={`flex ${align === 'start' ? 'items-start' : 'items-center'} gap-2 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${className}`}>
      {box}
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {label}
        {hint && <span className="block text-xs text-gray-400">{hint}</span>}
      </span>
    </label>
  );
}
