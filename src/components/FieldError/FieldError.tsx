export interface FieldErrorProps {
  message?: string;
  // 'field' (default) is a message that belongs to the control it sits under:
  // useScrollToErrors scrolls to it and focuses that control. 'form' is a
  // message about the whole form or request (a failed save), which is only
  // scrolled into view.
  scope?: 'field' | 'form';
  // Replaces the default small red text, for the few places that show the
  // message in a different size or inside a tinted box.
  className?: string;
}

export function FieldError({ message, scope = 'field', className = 'mt-1 text-xs text-red-500' }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p
      role="alert"
      data-form-error
      {...(scope === 'field' ? { 'data-field-error': true } : {})}
      className={className}
    >
      {message}
    </p>
  );
}
