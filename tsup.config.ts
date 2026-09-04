import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  // Stories and tests live alongside their component (Card/Card.stories.tsx)
  // but are never imported from index.ts, so esbuild never pulls them into
  // the bundle - nothing extra needed here to keep them out of dist.
});
