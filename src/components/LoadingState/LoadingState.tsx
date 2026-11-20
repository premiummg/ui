import type { ReactNode } from 'react';
import { useUiText } from '../../lib/i18n';

// The line a page or panel shows while its data is on the way, or in place of a list that came back empty.
// `size` sets the room around it: "page" for a whole page (py-16), "block" for a card or a modal (py-6, the
// default), "inline" for a line inside a form or a list with no room of its own.
export type StateMessageSize = 'page' | 'block' | 'inline';

const SIZE: Record<StateMessageSize, string> = {
  page: 'py-16 text-center',
  block: 'py-6 text-center',
  inline: '',
};

const TEXT = {
  en: { loading: 'Loading...', empty: 'Nothing here yet.' },
  fr: { loading: 'Chargement...', empty: 'Rien pour le moment.' },
};

export interface StateMessageProps {
  /** What to say. Without it the built-in "Loading..." (LoadingState) or "Nothing here yet." (EmptyState). */
  children?: ReactNode;
  size?: StateMessageSize;
  className?: string;
}

function StateMessage({ children, size = 'block', className = '', role }: StateMessageProps & { role?: string }) {
  return (
    <div role={role} className={`text-sm text-gray-400 dark:text-gray-500 ${SIZE[size]} ${className}`.trim()}>
      {children}
    </div>
  );
}

export function LoadingState({ children, ...rest }: StateMessageProps) {
  const t = useUiText(TEXT);
  return <StateMessage role="status" {...rest}>{children ?? t.loading}</StateMessage>;
}

export function EmptyState({ children, ...rest }: StateMessageProps) {
  const t = useUiText(TEXT);
  return <StateMessage {...rest}>{children ?? t.empty}</StateMessage>;
}
