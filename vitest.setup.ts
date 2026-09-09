import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Vitest doesn't auto-wire Testing Library's cleanup the way Jest's global
// afterEach does - without this, DOM nodes from one test are still mounted
// when the next test in the same file queries the document.
afterEach(() => {
  cleanup();
});

// Node 22+'s own experimental global `localStorage` (gated behind
// --localstorage-file, unset here) shadows jsdom's real implementation and
// is missing methods (no .clear/.removeItem) - it's the same object as
// `window.localStorage`, just broken. Swap in a plain in-memory polyfill so
// any test that touches localStorage (useDarkMode, etc.) works the same
// regardless of which Node version/flags happen to run the suite.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  key(index: number) { return [...this.store.keys()][index] ?? null; }
  removeItem(key: string) { this.store.delete(key); }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
}
Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
