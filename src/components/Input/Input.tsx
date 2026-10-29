import { InputHTMLAttributes, Ref } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Reaches the native element (react-hook-form's register() hands one over).
  ref?: Ref<HTMLInputElement>;
  // Marks the field as failing validation for assistive technology.
  invalid?: boolean;
}

// The native single-line field in the app's field style (the `input-field` class). It is the real <input>:
// every native attribute passes straight through. A className given by the caller replaces the default
// style, for the few fields styled differently (a compact table cell, a bare inline editor). For checkboxes
// use Checkbox, for passwords PasswordInput, for search SearchInput.
export function Input({ className = 'input-field', invalid, ...rest }: InputProps) {
  return <input {...rest} aria-invalid={invalid || rest['aria-invalid']} className={className} />;
}
