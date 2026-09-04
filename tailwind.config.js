/** @type {import('tailwindcss').Config} */
//
// LOCAL config, for Storybook/dev only - not shipped (see package.json
// "files"). This exists so Storybook can render components with real
// Tailwind utilities, and doubles as a live check that composing
// tailwind-preset.js via `presets: [...]` actually works, the same way a
// consuming app's own tailwind.config.js will.
import pmgPreset from './tailwind-preset.js';

export default {
  presets: [pmgPreset],
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
};
