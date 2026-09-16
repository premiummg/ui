// The "heads up, not destructive" amber text color - shared by StatusBadge's
// `warning` tone and ConfirmDialog's `caution` tone, which mean the same
// brand-level severity but had drifted a full Tailwind shade step apart
// (amber-600 vs amber-700 in light mode) with no shared source keeping them
// in sync. `danger`/`error` don't need an equivalent constant here: they
// already both resolve to the same brand red token (`var(--premium-red)` /
// Button's `danger` variant), not independently-typed Tailwind classes.
export const WARNING_TEXT_CLASS = 'text-amber-700 dark:text-amber-400';
