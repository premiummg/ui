import { ReactNode } from 'react';

export interface FormActionsProps {
  // The form's buttons: the main one (Save, Submit, Create) last, so it ends
  // up at the right edge, and the quieter ones (Cancel) before it.
  children: ReactNode;
  className?: string;
}

// Where a form's actions go: at the bottom, after the last field, never up in
// the page's `PageHeader` band. The band announces the record; the buttons
// that act on it come once the person has filled the form in. Each app places
// it as the last element inside its `<form>`.
export function FormActions({ children, className = '' }: FormActionsProps) {
  return (
    <div className={`flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 pt-5 dark:border-white/10 ${className}`}>
      {children}
    </div>
  );
}
