import pmgPreset from '../tailwind-preset.js';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [pmgPreset],
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../src/**/*.{js,ts,jsx,tsx}',
  ],
};
