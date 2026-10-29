import { Ref, SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  // Reaches the native element (react-hook-form's register() hands one over).
  ref?: Ref<HTMLSelectElement>;
  // Marks the field as failing validation for assistive technology.
  invalid?: boolean;
}

// The native dropdown in the app's field style (the `input-field` class). It is the real <select>: every
// native attribute and the options as children pass straight through. A className given by the caller
// replaces the default field style, for the few selects that are styled differently (a compact filter).
export function Select({ className = 'input-field', invalid, children, ...rest }: SelectProps) {
  return (
    <select {...rest} aria-invalid={invalid || rest['aria-invalid']} className={className}>
      {children}
    </select>
  );
}
