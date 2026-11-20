import { useState, useEffect } from 'react';

// The dark mode of the page: the `dark` class on <html> (set before paint by the app's index.html from the stored
// choice or the system's), kept in step with a toggle. Nothing is written on mount: until the person toggles, the
// page follows the system, live, as it changes; only a toggle stores an explicit choice ("theme" in localStorage),
// which from then on wins. (Writing on mount used to freeze whatever the system said the first time.)
export function useDarkMode() {
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem('theme')) return; // an explicit choice was made since mount
      } catch {}
      setIsDark(e.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    setIsDark((d) => {
      const next = !d;
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

  return { isDark, toggle };
}
