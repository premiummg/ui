import { Ref, TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Reaches the native element (react-hook-form's register() hands one over).
  ref?: Ref<HTMLTextAreaElement>;
  // Marks the field as failing validation for assistive technology.
  invalid?: boolean;
}

// The native multi-line field in the app's field style (the `input-field` class). It is the real <textarea>:
// every native attribute passes straight through. A className given by the caller replaces the default style.
export function Textarea({ className = 'input-field', invalid, ...rest }: TextareaProps) {
  return <textarea {...rest} aria-invalid={invalid || rest['aria-invalid']} className={className} />;
}
