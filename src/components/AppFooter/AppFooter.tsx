import { ReactNode } from 'react';

export interface AppFooterProps {
  // The copyright line, already worded and translated by the app.
  copyright: string;
  // Links next to it (terms and conditions...). The app passes its own router
  // links so navigating stays inside the single page app.
  children?: ReactNode;
}

export function AppFooter({ copyright, children }: AppFooterProps) {
  return (
    <footer className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-gray-200 px-6 py-4 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400 [&_a]:font-medium [&_a]:underline [&_a:hover]:text-gray-800 dark:[&_a:hover]:text-gray-200">
      <span>{copyright}</span>
      {children}
    </footer>
  );
}
