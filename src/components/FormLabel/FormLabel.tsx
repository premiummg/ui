import { ReactNode } from 'react';

export interface FormLabelProps {
  // Always the field's own name/label text, never a composition slot.
  text: ReactNode;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
}

export function FormLabel({ text, htmlFor, required = false, optional = false }: FormLabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {text}
      {required && <span className="text-red-500 ml-0.5">*</span>}
      {optional && !required && <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>}
    </label>
  );
}
