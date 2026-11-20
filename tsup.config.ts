import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  minify: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  // Stories and tests live alongside their component (Card/Card.stories.tsx)
  // but are never imported from index.ts, so esbuild never pulls them into
  // the bundle - nothing extra needed here to keep them out of dist.
  esbuildOptions(options) {
    // The eight PremiumLogo PNGs (~60KB total: the stacked ones are 400px tall, twice the largest size they are shown
    // at, and every one is 256 colors; at full size they were 430KB of the bundle) get inlined as base64 data
    // URIs at build time instead of shipped as separate files - unlike the
    // fonts (referenced from CSS via url(), resolved by the consuming app's
    // own build), an <img src> import needs a real path a browser can fetch,
    // and a package's dist/ isn't served by a consuming app's dev server.
    // A data URI sidesteps that with no extra runtime wiring.
    options.loader = { ...options.loader, '.png': 'dataurl' };
  },
});
