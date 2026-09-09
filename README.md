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
      <Alert variant="warning" text="This timesheet is over budget." />
      <Button variant="primary">Save changes</Button>
      <Button variant="secondary">Cancel</Button>
    </Card>
  );
}
```

## Components (v0.2.0)

| Component | Notes |
|---|---|
| `Button` | `variant`: `primary` (MAIN red, `.btn-primary`) / `secondary` (neutral outline) / `danger` (alias of `primary` - the brand book uses the same red for both). `size`: `xs` (a compact inline action, e.g. beside other chips in a table row) / `sm` / `md` / `lg` (`SiteButton`'s own hero-CTA padding, for app chrome that wants that same weight) / `xl` (one more step up from `lg` - no real spot for it exists in the app yet, so it's an extrapolation of the scale rather than a match for something real). `children`, not `text` - unlike `Alert`, a button routinely needs an icon next to a label, so it stays a real composition slot like every native `<button>`. `type` defaults to `"button"`, not the HTML default of `"submit"`, so one dropped into a `<form>` never submits it by accident. |
| `Card` | Bordered rounded container. `padding` defaults to **false**. |
| `Alert` | Inline banner. `variant`: `error` / `success` / `warning` / `info`, each with its own icon and left-edge accent. `text`, not `children` - every real use is one line of message text, not a composition slot. |
| `FormLabel` | `text`, not `children` - always the field's own name, never a composition slot. `required` adds a red asterisk, `optional` adds a "(optional)" hint. |
| `FieldError` | Renders nothing without a `message`. Validation text under a field. |
| `CountBadge` | Small red pill for a total, e.g. next to a `PageHeader` title. |
| `StatusBadge` | Capitalized pill; caller supplies `colorClass` for the variant. Optional `style` passthrough for a color that isn't a Tailwind class at all (an arbitrary brand color, e.g. `RankBadge`'s filled top step). |
| `StatusDot` | Three-state access dot (`active` + optional `identityActive`). `variant="presence"` pins it to an avatar's corner. |
| `RankBadge` | One badge out of an ordered ramp - a role, a priority, a tier - where each step should read as more or less weight than its neighbors. Give it `levels` (your values, ordered low to high) for the built-in on-brand ramp - the exact one the app's own role badges use, outline opacity/ink weight stepping up with a filled `color` (defaults to Premium red) on the last, top entry - with no Tailwind classes to write. Pass `styles` instead (value -> Tailwind classes) for full manual control, e.g. a sister brand with its own complete color system. A value missing from either still renders, as a neutral outline pill, rather than coming out unstyled. |
| `Pagination` | Range + total (`.pmg-figure` numerals), Prev/Next. Hides itself at 1 page unless `children` is given. |
| `Modal` | Centered overlay, closes on Escape or backdrop click. Optional `title` + `description` cover the confirm/edit-modal shape every real one already hand-rolls (an `<h3>`, sometimes a `<p>` under it, both inside a `p-6` wrapper) - `title` alone gets a looser bottom margin than `title` + `description` together, matching the two spacings real modals split between. `children` still renders under them for the actual body (a form, a confirm/cancel row); omit `title`/`description` and build your own header in `children` for anything richer. `maxWidth` / `zIndex` overridable. |
| `SearchInput` | Debounced text input with a clear button, `.input-field` styling. |
| `PageHeader` | The red band shell every real page opens with - `.pmg-field` + `.pmg-bars`, rounded at the top, with an optional back-link row (arrow + `backLabel`, omit `onBack` for a page with nothing to go back to). `title`/`count`/`actions` cover the common index-page row (an item-start layout, so a taller `actions` button never pushes the title down away from the back-link; `actions` itself wraps onto its own line rather than overflowing when it holds more than one control on a narrow screen). `children`, given, replaces that row entirely - the escape hatch for a detail page's avatar+status pill or a form page's eyebrow date line, which don't fit the same three props. |
| `SortableColumnHeader` | `<th>` with a sort toggle button and up/down indicator. |
| `TablePlaceholderRow` | Single centered `<tr>` for a table's loading/empty state. `loading` shows a spinning `FiRefreshCw` above `loadingText` - the same icon the app already hand-rolls next to a loading table, here built in instead of copied at every call site. `size`: `sm` (14px icon) / `md` (18px, default) both match real spinners elsewhere in the app; `lg` (24px) is one step extrapolated, no real spot for it yet. |
| `FilterLabel` | Tiny uppercase facet label. `text`, not `children`. |
| `FilterPill` | Toggleable filter chip; `active` fills brand red. |
| `FilterRow` | A label + a row of `FilterPill`s + "Clear". Renders nothing with no options. `options` is `Array<string \| { value, label }>` - plain strings when the value IS the label (role, status), `{value, label}` when the display name can repeat and only `value` identifies the option (division/company/team names) - see its two stories, `PlainStringOptions` and `IdKeyedOptions`, for one of each rather than guessing the shape from the type alone. |
| `DashedAddButton` | Full-width dashed "add" affordance (line items, etc). |
| `PasswordInput` | Show/hide toggle; spread a form library's `register()` result via `registration`. |
| `OverflowMenu` | "More actions" popover; `items` vs `dangerItems` (divided, red). `onDark` inverts the trigger for a red field. Narrower (`w-56`) below the `sm` breakpoint - the trigger is usually one of several icon buttons clustered together rather than flush against the screen's own right edge, so the full `w-64` can push the menu's left edge past x=0 on a narrow phone. Its own wrapper is `inline-block`, not a bare `<div>` - see the note below the table on why that matters for where the dropdown actually lands. `align` (`"right"` default / `"left"`, same contract as `WeekNav`'s own `align`) picks which edge the menu grows from - a trigger near the left edge of its own container needs `"left"`, or `"right"` pushes the menu off-screen. |
| `ScrollableTable` | Wraps a table with fade edges + chevron nudge buttons on overflowing sides. |
| `FieldGroup` | `.pmg-bracket` section heading + `Card` panel, with an optional footnote. |
| `ErrorBoundary` | Class boundary with a branded fallback; auto-reloads once on a stale deployed-chunk error. |
| `DarkModeToggle` | Sun/moon icon button. Controlled - pair it with `useDarkMode`. |
| `PremiumLogo` | The Premium wordmark itself (bundled as inline assets - no files to copy into a consuming app's `public/`). `size`: `sm`/`md`/`lg`/`xl`. `variant`: `stacked`/`horizontal`. `mode="auto"` (default) watches `html.dark` and swaps artwork with the theme; `mode="light"`/`"dark"` pins it instead, for a surface whose own color is fixed regardless of theme (a solid-red band, a footer that's always Premium Black). |
| `Toaster` + `ToastProvider` | A full toast subsystem, not just the display component: wrap the app in `ToastProvider` once, mount `Toaster` once, call `useToast().toast(message, variant)` anywhere. `emitToast(...)` fires one from outside React (an axios interceptor, a top-level handler) - a no-op if no provider is mounted yet. `Toaster` itself takes no props - correctly, not a gap - since it only ever displays whatever the context currently holds; its own story's four buttons (each colored to match the variant it fires) are the closest thing to a Controls panel it has. |
| `DatePicker` | Day/month/year calendar dropdown (built on `date-fns`, now a real dependency of this package). `minDate`/`maxDate`, plus `unavailableDates` (shown struck-through, unselectable). |
| `NotificationBell` + `NotificationBellEmpty` | The icon-with-badge-that-opens-a-dropdown shell shared by a notifications bell, a "pending review" counter, and an unread-messages list - trigger, outside-click-to-close, header (+ optional action), scrollable body, optional footer link. The body is `children`, fully custom, since a notification row and a "5 timesheets pending" row don't share a shape worth forcing into one prop. See its stories for all three use cases built on the same shell. |
| `MonthNav` | Prev/next month arrows + a click-to-open month/year picker. `months` restricts it to a specific sorted list (otherwise unrestricted going back, capped at the current month going forward). `variant="hero"` for sitting on a solid brand-color field. |
| `WeekNav` | Same idea as `MonthNav`, one level down - a week (Monday-anchored) picker whose dropdown still lets you jump by month/year to get there. `weeks` restricts it the same way `MonthNav`'s `months` does; `align` picks which edge the dropdown hangs from. |

| `AuthShell` + `AuthError` | The shared page shell for a sign-in flow (sign in, two-factor, set new password, ...): centered card, brand band, dark-mode toggle, footer line - built on `PremiumLogo` and `useDarkMode` from this same package. `AuthError` is the red inline error banner for inside it. |
| `Layout` | The shell every *other* page sits in: brand-neutral background + `<main>` padding. Takes your app's own navbar as the `navbar` prop rather than owning one. |
| `Navbar` + `NAV_TONES` | The navbar's shell: logo, one of three brand-dark tones (`tone`: `black`/`dark`/`steel`, `NAV_TONES` carries the rationale for each), the hi-vis stripe underneath. No nav items of its own - compose it with `DarkModeToggle`, `NotificationBell` and your own buttons via `children`, then hand the result to `Layout`'s `navbar` prop. See its `AllTones` story for the three side by side. |
| `UnitField` + `DEFAULT_UNIT_OPTIONS` | A `<select>` that also accepts a value outside its own list - picking "Other…" swaps in a plain text input, with a "back to list" undo. `options` defaults to a common physical-units list but takes any string list, so the same "pick one, or type your own" behavior reuses for other closed-but-extensible lists. `capitalize` (defaults **on**) title-cases the display of every option and the typed-custom value, without changing what's actually stored - pass `false` for a list of abbreviations (`kg`, `ft`, `gal`) that read oddly title-cased. |
| `StatCard` | A small at-a-glance figure - label, `pmg-figure` value, optional hint, colored left edge (`accent="amber"` for a "needs attention" state). Renders as a real `<button>` when `onClick` is given, a plain `<div>` otherwise. |
| `NavTile` | A big clickable destination tile for a dashboard's "go here" grid - icon in a tinted square, arrow that slides on hover, a 45deg corner notch and a growing left accent bar. |
| `Reveal` | Fades a section in, once, the first time it scrolls into view. `motion-safe:` respects `prefers-reduced-motion`; a 1.5s deadman-switch timeout reveals the content anyway if `IntersectionObserver` never fires, so a landing page's copy is never silently invisible. |
| `Eyebrow` | The small uppercase micro-caps label above a marketing section title. `text`, not `children`. `tone`: `red` (default) / `white` (on a dark/solid field) / `amber`. |
| `SectionHead` | A marketing-page section heading: `Eyebrow` + headline + optional subhead, `tone="dark"` for sitting on a solid dark/color field, `center` for a centered layout. |
| `SiteButton` | A landing-page button - distinct from `Button` (which is scoped to app chrome: a dashboard, a form, a table, always on a plain white/dark surface). A marketing page's buttons sit on whatever surface the section around them uses - a plain background, a solid red band, a dark footer - so `variant`: `primary` / `ghost` / `onRed` / `onDark`, the last two inverting so a button never disappears against its own colored section (`Button` has no equivalent, since app chrome never needs it). Always one size (`px-6 py-3`, `Button`'s own `lg`), since a marketing page's CTAs don't need `Button`'s `xs`-`xl` range. |
| `FlagCanada` / `FlagAcadian` / `AcadianStar` | Real flag SVGs for a bilingual EN/FR language toggle. Acadian rather than a generic France flag - the correct mark for Maritime Canada's French-speaking community, not a stand-in for "French" in general. `AcadianStar` is just the flag's own gold star, on its own - see `Hero`'s `overlay="acadian"`. |
| `LanguageToggle` | The actual EN/FR segmented switch built on the two flags above - both languages always visible, the live one filled. Not a single icon that toggles to show only the other language, which is the pattern that makes half a bilingual audience guess which state they're in. Each flag ships at `w-6 h-4.5` - big enough that the Acadian flag's own gold star (the one detail that keeps it from reading as a plain France tricolor) is actually visible, not just present in the SVG. |
| `Hero` | A full-bleed landing-page hero: eyebrow + headline + subhead, up to two `SiteButton` actions, an optional caption line. `imageSrc` and `videoSrc` are both optional and independent - image alone, video alone (no poster attribute), both (the image becomes the video's poster, and what a `prefers-reduced-motion` visitor gets instead of ever downloading the video), or neither (a plain dark field behind the copy). `overlay`: `"scrim"` (default, plain black, carries the industrial `.pmg-texture` hatch) or `"acadian"` (Acadian blue-to-red with the flag's own gold star blended into the blue side via `mix-blend-screen` - not `overlay`, whose effect flips direction with the base color and would go invisible on the blue half; no `.pmg-texture` here, since the flag gradient is already its own two-color material and gains nothing from a second layer) - from `/design/otoshi`'s hero. `wedge` (off by default) is Premium's own 45deg brand device - opt in only for a genuinely Premium-branded page, not a sister brand or client site. Never wrapped in `Reveal` anywhere it's used - it's the largest contentful paint on the page. |
| `SegmentedControl` | A row of 2-3 mutually-exclusive choices where picking one changes what else the form needs (e.g. Delivery vs. Pickup deciding whether an address field appears) - worth reading at a glance rather than two checkboxes that were really one choice. Generic over its option type; icons optional per option. |
| `ColorField` | A bold solid-color field with the 45deg diagonal bars running through it - "solid blocks of color that command attention" (BRAND.md pg. 16). `color` defaults to Premium's own secondary red, but takes any CSS color: the device (field + bars) is what's brand-specific, not the color itself, so a sister brand gets the same component with its own color rather than a second one. Compose content inside with `Eyebrow` (`tone="white"`) and `SiteButton` (`variant="onRed"`). |
| `PortraitFigure` | A team-member/founder photo with a name+role tag cut into its corner at the brand's own 45deg angle. `color` defaults to Premium's secondary red, same as `ColorField` - any CSS color works for a sister brand. |
| `SiteFooter` + `FooterColumn` | The dark marketing-site footer shell: a responsive column grid on Premium Black, a copyright bar below a hairline. Ships the real grid/bar structure (unlike `Navbar`'s empty shell) since that part is genuinely the same across most marketing sites - only the column *content* (which services are listed, contact details, a newsletter form's own state) is composed in via `children`/`FooterColumn`. |
| `FeatureCard` | An icon (centered in its own slot) + bold title + one line of body copy - the "why us" tile from a landing page's features grid. Pass any react-icons element; its own size/color come along unchanged. `align`: `"left"` (default, stacked) / `"center"` (icon and text all centered) - the second matches OtoshiProposalPage's own "Community" tile layout. |
| `NumberedCard` | A numbered process step ("01 Contact and evaluation"), one corner cut at the brand's 45deg angle. `color` defaults to Premium red and is selectable for a sister brand - its dark-mode figure color is derived from whatever `color` is given via `color-mix()`, so a custom color still gets a readable dark counterpart instead of failing contrast on the dark card ground the way the plain color alone would. |
| `QuoteCard` | A customer quote with the brand's own `.pmg-bracket` corner mark instead of a generic quotation glyph. Render several side by side, not in a carousel - nothing should slide sideways while it's being read. |
| `StatBlock` | One big centered figure with a short label underneath (e.g. "56% / Openness to new ideas") - a headline number a marketing page leads with. Not the dashboard `StatCard` above (left-accented, left-aligned, meant for a data table's summary row) - a different, unrelated component that happens to share the word "stat". `color` defaults to Premium's secondary red. |
| `MediaCard` | A square photo over a title, a colored eyebrow line, and a body line - a program/category tile (e.g. "Adult, Ages 14+, all levels welcomed"). Renders as a real `<button>` with a hover lift when `onClick` is given, a plain non-interactive card otherwise. |

Also exported: `useOutsideClick` (closes a menu/dropdown on an outside mousedown),
`useDarkMode` (reads/toggles `html.dark`, persists the choice to `localStorage` - pair it with
`DarkModeToggle` for the actual button), and `usePrefersReducedMotion` (the hook `Reveal` itself
uses, exported in case a consumer needs the raw value for something other than a reveal).

That's every component from `timesheet-payroll-system/frontend/src/components/shared/` and its
top-level `components/` that's actually app-agnostic (checked both directories end to end, not
just the ones that seemed likely) - plus `StatCard` and `NavTile`, which weren't in either
directory: both lived inline in `DashboardPage.tsx`'s own JSX rather than as extracted
components, which is exactly why they were missed on the first pass. Worth remembering next
time: a reusable pattern can be hiding inside a *page* file, not just the components folders.

What's left in that repo and staying there, because it's tied to one app's specific data model
or APIs rather than being a UI pattern: `ProjectSearch` (searches `Project[]` from that repo's
own API types), `RoleBadge` and `TimesheetStatusBadge` (hardcode that app's specific role/status
vocabularies onto the generic `StatusBadge`/`StatusDot` primitives already in this package - the
*shape* `RoleBadge` and its `ROLE_COLORS` ramp use, an ordered lookup with a safe fallback, is
what became `RankBadge` above; the five actual roles and their exact colors stay in that repo,
since another project reusing `RankBadge` almost certainly has its own levels, not these five),
`TaskBreakdownEditor` and `CatalogueEntryModal` (both keyed to that app's task/catalogue data
model), and `AnnouncementGate`/`SendMessageModal`/`UnlinkedEmployeesModal` (each wired to one
specific API: announcements, employees/divisions). The rows *inside* `Navbar`'s notification bell
/ pending-review / messages dropdowns are the same story - only the shell they share was
generalizable, see `NotificationBell` above.

`OverviewPage.tsx`'s own richer stat-card had an `icon` and an action slot for a `MonthNav`/
`WeekNav` that this package's `StatCard` didn't - both now ported (`icon` prop, `hint` widened to
accept a real element, not just a caption string; see `MonthNav`/`WeekNav`'s own `InAStatCard`
stories for the actual composition). Still not ported: the `size="lg"` variant and the separate
"needs your attention" render path - flagging those here so they don't need re-discovering.

`PageHeader`'s first version was ported from `components/shared/PageHeader.tsx` - a plain flat
title bar with no visual relation to any real screen. Turned out that file is dead code, imported
nowhere in the app; the header every real page actually opens with (a red `.pmg-field`/`.pmg-bars`
band with a back-link above the title) is copy-pasted inline across ~25 page files instead. Rewrote
`PageHeader` from scratch against that real, load-bearing markup. Lesson to add to the running
list above: grep for whether a "shared" component is actually imported anywhere before trusting its
name - an unused file can look exactly as canonical as a real one.

`Navbar`'s `tone` prop was always real, but neither of its stories drove it through Storybook's
Controls - both used a plain `render: () => (...)` with `tone` hardcoded (or looped over) inside,
which shows the auto-generated control with no wiring to make it do anything. Fixed by giving
`FullyComposed` a `render: (args) => (...)` and an `args: { tone: 'black' }`, so the Controls
panel's `tone` select actually re-renders the story - a story using `render` bypasses `args`-driven
controls entirely unless it explicitly reads from `args` itself, worth checking on any other
`render`-based story that looks like it should have a working control and doesn't.

A real, reproducible bug (not a story artifact) found by actually opening `OverflowMenu` in
Storybook's own manager UI, not just the isolated `iframe.html` preview this package's own testing
had exclusively used up to that point: its wrapping `<div className="relative">` is a bare block
element, which stretches to its *parent's* full width unless that parent happens to be a flex or
inline-block context - true every time this ships composed inside a real toolbar row, which is
exactly why it was never caught there. The dropdown's `right-0` then anchors to that stretched
div's edge, not the small trigger button's, and can land the menu anywhere from "roughly right" to
"floating disconnected in the far corner of the screen" depending on how wide the surrounding
non-flex context happens to be. Fixed by adding `inline-block` alongside `relative`, and audited
every other component with the same trigger-button-plus-absolutely-positioned-dropdown shape for
the same latent bug: `MonthNav`, `WeekNav` and `NotificationBell` all had it too, all fixed the
same way. Lesson: a Storybook check that only ever uses `iframe.html` directly skips exactly the
layout context (the manager's own non-flex canvas wrapper) this bug needed to surface in.

`LanguageToggle` had the identical `flex`-not-`inline-flex` bug - missed in the original pass since
that audit only checked components with an absolutely-positioned dropdown, and `LanguageToggle`
has none; it stretched to its parent's full width the same way regardless. Broadened the check
this time to any bare block-level root wrapper on a component meant to render as a compact,
inline-sized control (not just ones with a popup) - audited every remaining component in the
package against that wider net and confirmed nothing else was missed.

The `inline-block` fix above corrects the dropdown's *width*, but a `right-0`-anchored menu still
assumes there's room to its *left* - a trigger sitting at the left edge of its own container (as
`OverflowMenu`'s own bare `Default` story did) pushes the menu off-screen regardless. Added `align`
(`"right"` default / `"left"`) to fix that directly, the same prop `WeekNav` already had for the
identical reason - and fixed the `Default` story itself to place its trigger somewhere `align="right"`
actually suits (the right side of a row), with a new `AlignLeft` story for the other case instead of
leaving the default story position-dependent on which side of the canvas it happened to render near.

Two stories turned out to be confusing rather than broken. `Pagination`'s `SinglePage` story
rendered nothing at all - correct (it hides itself at 1 page with no `children`, exactly as
documented), but with no caption saying so it read as a broken story; added one, plus a
`SinglePageWithChildren` story showing the one case that still renders something.
`StatusDot`'s `Presence` story pinned the dot to a bare grey circle, easy to miss at that size
against no other visual weight; swapped in an initials avatar so the "attached to a person" idea
in its own doc comment is actually visible in the story, not just described by it.

`Eyebrow`, `FormLabel` and `FilterLabel` were all renamed `children` -> `text`, the same fix
`Alert` got earlier - checked every real usage of all three first, and every one of them passed a
single plain label string, never a composition. `Button` stayed `children` on purpose: unlike
those four, its content routinely mixes an icon with a label, so it keeps the same real slot every
native `<button>` and every other button component already gives it. `Button` also gained an `xs`
size (a compact padding/text pair actually used app-wide for an inline action beside other chips,
not invented) and, on request, `lg`/`xl` - `lg` matches `SiteButton`'s own real hero-CTA size,
`xl` is one more step extrapolated from the existing scale, flagged in its own comment as not
matched against anything real the way every other size here is.

`PageHeader`'s `actions` row and `OverflowMenu`'s dropdown width were both fixed after a mobile
responsiveness sweep of the real app turned up the same two bugs there first (~16 page files each
had a `shrink-0` flex row with no `flex-wrap`, and `OverflowMenu`'s fixed `w-64` overflowed the
left edge on a narrow phone). `shrink-0` is the sharper lesson: it silently defeats `flex-wrap` on
the very same element, since it disables the shrink flexbox needs to size that element below its
own unwrapped content width in the first place - `flex-wrap` alone is not enough, check for
`shrink-0` sitting right next to it.

One fix applied while porting `NavTile`: its hover state referenced `border-brand-500` /
`text-brand-500`, both instances of the named `brand.*` Tailwind color keys documented above as
not compiling - a latent no-op in the source app, most likely unnoticed there because the rest of
the hover state (the shadow, the lift, the icon color, the corner notch) still fired. Ported here
as the working `border-(--premium-red)` / `text-(--premium-red)` instead.

`LanguageToggle`, `Hero` and `SegmentedControl` came from a second pass over
`LandingProposalPage.tsx` and `PurchaseOrderFormPage.tsx` after the first pass missed them
(`Flags` alone had shipped with a rough placeholder toggle demo in its story instead of the real
segmented-control design actually used in the proposal - now corrected, see `LanguageToggle`
itself). Worth remembering alongside the `StatCard`/`NavTile` note above: a genuinely reusable
control can be sitting inside a live app form (`SegmentedControl` was the purchase order form's
fulfillment-method picker), not just a components folder or a design proposal page.

`FeatureCard`, `NumberedCard`, `QuoteCard`, `StatBlock` and `MediaCard` came from a pass over
`LandingProposalPage.tsx`'s Why/Process/Reviews sections and `OtoshiProposalPage.tsx`'s stat
block and Programs grid - four different card shapes that were each already generic (icon+copy,
numbered step, quote, photo tile), just never pulled out of the page files they were written
inline in. Same lesson as `StatCard`/`NavTile` above, a third time now: check the page files, not
just a components folder, before concluding something isn't reusable yet.

`RankBadge` originally required a full hand-written `styles` map every time - even for the common
case of just wanting the app's own on-brand ramp applied to a new ordered list. Added `levels`
(ordered values, no classes to write) as the default path, `styles` staying for full manual
control; `StatusBadge` gained an optional `style` passthrough so `RankBadge`'s filled top step
could use an arbitrary `color`, not just a Tailwind class. Caught one real bug in the ramp-
spreading logic itself while adding tests for it: for exactly the common case (5 or fewer levels,
matching the app's own real ramp), the step-spreading formula was stretching to use the outline
ramp's own extra step (added to support more than 5 levels) instead of mapping each level to the
next step in order, giving a middle level the WRONG weight compared to the real ramp it's meant to
match exactly. Fixed by using each predefined step directly whenever there are few enough levels
to have one each, and only interpolating across the fixed set for a `levels` list longer than
that.

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
- `.pmg-texture`'s opacity is doubled in dark mode (`html.dark .pmg-texture`, in `styles.css`).
  Measured, not assumed: the same 3.5% `currentColor` opacity is an identical ~8-9/255
  luminance step in both themes, but that step reads as present in light mode and as "missing"
  in dark mode, because a small step is far harder to perceive near pure black than near white.
  Every component that uses the texture (`ErrorBoundary`, `AuthShell`, `Navbar`, `Hero`) picks
  this up automatically - nothing to do per-component.
- `.pmg-texture`'s line weight matches `.pmg-bars` (2px line, 12px repeat) rather than the
  original 1px/9px - the two are meant to read as one family (a low-opacity version for sitting
  behind body text, a bold fixed-white version for empty space inside a red field), and 1px read
  as noticeably thinner/weaker than the bars version it's supposed to be a quieter sibling of.
