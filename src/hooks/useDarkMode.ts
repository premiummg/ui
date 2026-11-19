import { useState, useEffect } from 'react';

// Reads/toggles the class (`html.dark`) that drives every `dark:` utility in
// the app. Whoever mounts this app is expected to have already set that
// class once at boot, before React hydrates, from `localStorage` (`'theme'`)
// falling back to `prefers-color-scheme` - this hook only tracks and flips
// it from then on, and persists the choice back to `localStorage` itself.
export function useDarkMode() {
  // No document while a page is rendered ahead of time (prerender, SSR): light until the browser takes over.
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    // A blocked or full storage must not crash the toggle: the choice just lasts until the page is closed.
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch {}
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(d => !d) };
}
