import { Component, ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  // Both default to Premium's own crash-screen look (Light Grey / Premium
  // Black ground, the industrial texture in the page's own ink color) - a
  // sister brand keeps the same shell (corner bracket, texture, one action)
  // with its own palette instead of a second fallback component. Same
  // color/barsColor naming as ColorField/PageHeader's own override props,
  // for the same reason - `color` is the field's ground, `barsColor` the
  // decorative overlay on top of it (the texture pattern here, `.pmg-bars`
  // there).
  color?: string;
  barsColor?: string;
  // Text overrides for the three default-fallback strings - e.g. translated
  // copy for a localized consumer. Ignored when `fallback` is set. Each
  // defaults to the English copy.
  title?: ReactNode;
  body?: ReactNode;
  reloadLabel?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// A content-hashed lazy-chunk filename (Vite, and most modern bundlers) means
// a tab left open across a deploy still holds the OLD index.html in memory,
// pointing at OLD hashes the server no longer serves - so the first time that
// tab navigates to a not-yet-visited page this session, the dynamic import
// 404s. Different browsers phrase the failure differently, hence the three
// patterns.
const CHUNK_LOAD_ERROR = /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed/i;

// Once per tab: a plain re-render (what "Try again" does) retries the exact
// same dead URL and fails again forever, since nothing about the stale
// index.html changes. A real reload fetches the current index.html (with
// current hashes) and fixes it outright. Session-scoped so a deploy that's
// genuinely broken doesn't reload-loop the user - after one attempt this tab
// falls back to the manual "Try again" button below.
const CHUNK_RELOAD_KEY = 'chunk-reload-attempted';

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    if (CHUNK_LOAD_ERROR.test(error.message) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      // States the failure and gives the one action that actually helps,
      // rather than a bare exception string, and keeps the brand in the room
      // (corner bracket, industrial texture) instead of a blank grey screen.
      // The raw error still goes to console.error above, for Sentry/support.
      const { color, barsColor, title = 'This page could not load.', body = 'Nothing you entered was lost. Reload to try again.', reloadLabel = 'Reload' } = this.props;
      return (
        <div
          className={`relative min-h-screen flex items-center justify-center overflow-hidden p-8 ${color ? '' : 'bg-[#F2F2F2] dark:bg-(--premium-black)'}`}
          style={color ? { backgroundColor: color } : undefined}
        >
          <div
            className={`absolute inset-0 pmg-texture ${barsColor ? '' : 'text-gray-900 dark:text-white'}`}
            style={barsColor ? { color: barsColor } : undefined}
          />
          <div className="relative text-center max-w-sm">
            <p className="pmg-bracket inline-block font-heading font-black text-lg text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {body}
            </p>
            <button onClick={() => window.location.reload()} className="btn-primary px-5">
              {reloadLabel}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
