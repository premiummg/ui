// tsup bundles JS/TS only - the hand-authored CSS (custom properties, the
// pmg-* utility layer, @font-face rules) and the font files it points at
// are copied through as-is so a consuming app's own Tailwind/Vite build
// processes them, the same way it processes its own index.css.
import { cpSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
mkdirSync(path.join(root, 'dist', 'fonts'), { recursive: true });
cpSync(path.join(root, 'src', 'styles.css'), path.join(root, 'dist', 'styles.css'));
cpSync(path.join(root, 'src', 'fonts'), path.join(root, 'dist', 'fonts'), { recursive: true });
console.log('Copied styles.css and fonts/ into dist/');
