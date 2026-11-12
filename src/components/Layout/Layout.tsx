import { ReactNode } from 'react';

export interface LayoutProps {
  // Each app's own navbar is wired to its own auth/notifications/etc - pass
  // it in rather than this package owning one. This component is only the
  // shell every page sits in underneath it: background, main padding.
  navbar?: ReactNode;
  // Shown under the page, at the bottom of the screen when the page is short.
  footer?: ReactNode;
  children: ReactNode;
}

export function Layout({ navbar, footer, children }: LayoutProps) {
  return (
    // Dark page ground is Premium Black, not gray-900 - it's the one surface
    // every card and field is measured against, so keeping it neutral stops
    // the brand's neutral darks from clashing with a blue-tinted page.
    <div className="flex min-h-screen flex-col bg-[#F2F2F2] dark:bg-(--premium-black)">
      {navbar}
      <main className="flex-1 px-3 py-4 sm:p-6">{children}</main>
      {footer}
    </div>
  );
}
