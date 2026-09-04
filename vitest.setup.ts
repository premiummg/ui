import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Vitest doesn't auto-wire Testing Library's cleanup the way Jest's global
// afterEach does - without this, DOM nodes from one test are still mounted
// when the next test in the same file queries the document.
afterEach(() => {
  cleanup();
});
