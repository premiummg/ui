import { useUiText } from '../../lib/i18n';
import { ReactNode } from 'react';

export interface FormLabelProps {
  // The field's own name/label text. `children` says the same thing the way a plain <label> does, so either works.
  text?: ReactNode;
  children?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  // Override for the "(optional)" suffix - e.g. a translated string for a
  // localized consumer. Defaults to the English word.
  optionalLabel?: ReactNode;
}

const TEXT = { en: { optional: '(optional)' }, fr: { optional: '(facultatif)' } };

export function FormLabel({ text, children, htmlFor, required = false, optional = false, optionalLabel }: FormLabelProps) {
  const tx = useUiText(TEXT);
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {text ?? children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
      {optional && !required && <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">{optionalLabel ?? tx.optional}</span>}
    </label>
  );
}
