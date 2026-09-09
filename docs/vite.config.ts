import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// react/react-dom are NOT a dependency of this app on purpose: src/components
// (rendered here straight from source, not from dist/) resolve their own
// react from the root node_modules since docs/ isn't their ancestor
// directory. Aliasing this app's own react imports to that same install
// keeps everything on ONE react copy - two would throw "Invalid hook call"
// the moment any stateful component (DatePicker, Toaster, MonthNav, ...)
// renders inside this page's tree.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, '../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
    },
  },
  server: {
    // Vite's dev server otherwise 403s any request for a file outside its
    // own root (fonts referenced by ../src/styles.css's @font-face rules,
    // in particular) - this app's whole reason for being is importing real
    // source from the parent package, so the parent directory needs to be
    // an explicitly allowed root.
    fs: { allow: [path.resolve(__dirname, '..')] },
  },
});
