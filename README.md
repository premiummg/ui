# @premiummg/ui

The Premium MG design system: brand tokens, a Tailwind preset, and ready-to-use React
components, shared across every Premium application (`timesheet-payroll-system`,
`pmg-intranet`, and future apps) instead of each one hand-copying and slowly drifting from
`BRAND.md`.

Targets **React 19** and **Tailwind v4**.

## Install

This package publishes to GitHub Packages under the `@premiummg` scope. Add to the
consuming app's `.npmrc` (or `~/.npmrc`):

```
@premiummg:registry=https://npm.pkg.github.com/
```

You'll also need a GitHub personal access token with `read:packages` scope available as
`NODE_AUTH_TOKEN` (or in `~/.npmrc` as `//npm.pkg.github.com/:_authToken=...`) to install it.

```bash
npm install @premiummg/ui
```

## Set up Tailwind

`@premiummg/ui` ships its theme as a Tailwind **preset** (colors, fonts) plus a plain CSS
file (custom properties, `@font-face`, and the `.pmg-*` / `.btn-primary` / `.input-field`
utility layer) - not a compiled bundle of utility classes. Your app's own Tailwind build
still generates the utilities components use, which is why `content` below must include
this package.

**1. Compose the preset in your `tailwind.config.js`:**

```js
import pmgPreset from '@premiummg/ui/tailwind-preset';

export default {
  presets: [pmgPreset],
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@premiummg/ui/dist/**/*.{js,cjs}',
  ],
};
```

**2. Import the brand CSS in your app's own CSS entry, after your Tailwind import** (so the
`@layer components` rules land inside Tailwind's own components layer):

```css
/* Tailwind v4 */
@import "tailwindcss";
@config "./tailwind.config.js";
@import "@premiummg/ui/styles.css";
```

```css
/* Tailwind v3 */
@tailwind base;
@tailwind components;
@tailwind utilities;
@import "@premiummg/ui/styles.css";
```

Do this once, in one file. Do not `<link>` `styles.css` directly - it has to pass through
your own Tailwind/PostCSS build so `@layer` and the font-face `url()` paths resolve.

## Use a component

```tsx
import { Button, Card, Alert } from '@premiummg/ui';

function Example() {
  return (
    <Card padding>
      <Alert variant="warning">This timesheet is over budget.</Alert>
      <Button variant="primary">Save changes</Button>
      <Button variant="secondary">Cancel</Button>
    </Card>
  );
}
```

## Components (v0.1.0)

| Component | Notes |
|---|---|
| `Button` | `variant`: `primary` (MAIN red, `.btn-primary`) / `secondary` (neutral outline) / `danger` (alias of `primary` - the brand book uses the same red for both). `size`: `sm` / `md`. |
| `Card` | Bordered rounded container. `padding` defaults to **false**. |
| `Alert` | Inline banner. `variant`: `error` / `success` / `warning` / `info`, each with its own icon and left-edge accent. |

More of the ~25 components already living in `timesheet-payroll-system/frontend/src/components/shared/`
(see that repo's `BRAND.md`) will move here over time - check this table before building a
new one-off primitive in a consuming app.

## Develop

```bash
npm install
npm run storybook   # visual dev/catalog at localhost:6006
npm test             # vitest + React Testing Library
npm run typecheck
npm run build        # tsup -> dist/ (ESM + CJS + .d.ts), then copies styles.css + fonts
```

`tailwind.config.js` at the package root is **dev-only** (Storybook), not published - it
exists to compose `tailwind-preset.js` the same way a consuming app will, so Storybook is
also the first place a preset regression would show up.

## Why a preset instead of shipping compiled CSS

`timesheet-payroll-system` and `pmg-intranet` each kept a hand-copied `tailwind.config.js`
manually synced against `BRAND.md` - the exact duplication this package replaces. A preset
composes into each app's own Tailwind build, so JIT still scans real usage (no unused-utility
bloat) and dark mode / arbitrary-value rules keep working exactly like first-party app code.
Font files ship inside the package (`dist/fonts/`) so nothing needs to be copied into a
consuming app's own `public/` folder.

## Known caveats (inherited from BRAND.md - still true here)

- `bg-brand-steel` and the other named `brand.*` color keys **do not compile**. Use the CSS
  custom properties instead: `bg-[var(--premium-steel-grey)]`.
- Never put a Tailwind opacity modifier on a `var()` color (`bg-[var(--premium-red)]/15`
  produces nothing). Use the literal hex instead: `bg-[#E62027]/15`.
