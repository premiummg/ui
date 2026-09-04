/** @type {import('tailwindcss').Config} */
//
// Brand theme as a Tailwind PRESET - the single source of truth this package
// exists to provide. Every literal below comes from the official brand book
// (pg. 12 primary palette, pg. 13 secondary palette, pg. 14 typography), not
// from sampling the logo artwork. See BRAND.md in the consuming apps for
// full provenance and usage rules.
//
// Before this package existed, timesheet-payroll-system and pmg-intranet each
// kept a hand-copied, manually-synced tailwind.config.js. This preset
// replaces both copies - consume it instead of pasting the theme again.
//
// KEEP THIS FILE v3-FORMAT: no `content`/`darkMode` (those are app-specific,
// a preset should not set them) and no v4-only `@theme {}` syntax. A
// consuming app's own tailwind.config.js does:
//
//   import pmgPreset from '@premiummg/ui/tailwind-preset';
//   export default {
//     presets: [pmgPreset],
//     darkMode: 'class',
//     content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}',
//               './node_modules/@premiummg/ui/dist/**/*.{js,cjs}'],
//   };
//
// A Tailwind v4 app loads that same consumer config via `@config "./tailwind.config.js";`
// in its CSS entry, same as pmg-intranet already does today.
export default {
  theme: {
    extend: {
      fontFamily: {
        // Poppins is the SECONDARY font (body copy) but the default here,
        // since body text is the common case. Montserrat is the brand's
        // PRIMARY font and is prescribed for headings AND large numbers /
        // data displays - see BRAND.md "Fonts".
        sans: ['Poppins', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      colors: {
        brand: {
          // True tints of #E62027 mixed with white, for soft backgrounds
          // (badges, icon tiles, hover fills).
          50: '#FEF5F5',
          100: '#FDEBEC',
          200: '#FAD7D8',
          300: '#F7B8BA',
          400: '#F18488',

          // Premium Red MAIN (Pantone EC 2027) - interactive elements, CTAs,
          // focus rings, small accents.
          500: '#E62027',
          // Same color as 500. Existing markup says brand-600 in many
          // places; kept as an alias, do NOT repurpose to a different value.
          600: '#E62027',

          // Premium Red SECONDARY - hover/pressed for primary controls, and
          // the fill for large "bold red fields". Never use MAIN red for big
          // solid areas; the book's own red panels are all this color.
          700: '#A51E26',

          // Darker steps derived from #A51E26. Rare.
          800: '#7C171D',
          900: '#530F13',

          // Secondary palette (pg. 13) + Premium Black (pg. 12).
          black: '#000000', // Premium Black
          dark: '#212121', // Dark Grey  - bold text, strong contrast
          steel: '#3A3A3A', // Steel Grey - "optional for industrial applications"
          grey: '#F2F2F2', // Light Grey - backgrounds, subtle divisions
          orange: '#FAAD00', // Orange-Yellow - hi-vis accent for highlights/callouts
        },
      },
    },
  },
  plugins: [],
};
