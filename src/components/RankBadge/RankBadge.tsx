import { StatusBadge } from '../StatusBadge';

const FALLBACK = 'border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400';

// The app's own role-badge ramp (BRAND.md's two chromatic colors, red and
// amber, are both already spoken for elsewhere, so this runs on border
// opacity and ink weight stepping up together rather than fill shade).
// Literal classes, not computed ones: an interpolated arbitrary opacity
// (built as a string like `white/${n}`) is silently dropped by Tailwind's
// JIT scanner, which only generates classes it can see written out - the
// exact bug the original five-step ramp had to design around once already.
const OUTLINE_STEPS = [
  'border border-transparent text-gray-400 dark:text-gray-500',
  'border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400',
  'border border-gray-300 dark:border-white/25 text-gray-700 dark:text-gray-300',
  'border border-gray-400 dark:border-white/45 text-gray-900 dark:text-white',
  'border border-gray-500 dark:border-white/60 text-gray-900 dark:text-white',
];

// The common case (up to 5 levels, matching the app's own real ramp
// exactly) uses each predefined step directly, in order. Only a `levels`
// list with MORE outline positions than that spreads them evenly across
// the same fixed set instead of running out and repeating the last one.
function outlineStep(i: number, count: number): string {
  if (count <= OUTLINE_STEPS.length) return OUTLINE_STEPS[i];
  if (count <= 1) return OUTLINE_STEPS[0];
  const idx = Math.round((i / (count - 1)) * (OUTLINE_STEPS.length - 1));
  return OUTLINE_STEPS[idx];
}

export interface RankBadgeProps {
  // The value to render - a role, a priority, a tier, any string a data
  // model already stores.
  value: string;
  // Defaults to `value` itself. Pass a lookup of your own when the stored
  // value isn't already the text a person should read.
  label?: string;
  // Ordered low -> high (e.g. ['worker', 'foreman', 'finance', 'manager',
  // 'admin']). Where `value` falls in this list picks its step on the
  // built-in ramp above - the last entry always gets the filled, brand-
  // colored top step, every other entry an outline step spread evenly
  // across the ramp. This is the common case: on-brand badges for your own
  // ordered vocabulary with no Tailwind classes to write yourself.
  levels?: string[];
  // Full manual control instead: value -> Tailwind classes for that step,
  // bypassing the built-in ramp entirely - for a caller with its own color
  // system (a sister brand's own palette), not this one generalized.
  styles?: Record<string, string>;
  // The top step's fill color, when using the built-in ramp (`levels`).
  // Defaults to Premium's own secondary red, same default as `ColorField`/
  // `PortraitFigure`/`StatBlock`.
  color?: string;
  className?: string;
}

// One badge out of an ordered set - a role, a priority, a tier - where each
// step should read as more or less weight than its neighbors without
// competing with an actual status pill sitting in the same row. Give it
// `levels` for the built-in on-brand ramp, or `styles` for full control.
export function RankBadge({ value, label, levels, styles, color = 'var(--premium-red)', className }: RankBadgeProps) {
  const text = label ?? value;

  if (styles) {
    return <StatusBadge label={text} colorClass={styles[value] ?? FALLBACK} className={className} />;
  }

  const i = levels?.indexOf(value) ?? -1;
  if (!levels || i === -1) {
    return <StatusBadge label={text} colorClass={FALLBACK} className={className} />;
  }

  if (i === levels.length - 1) {
    return (
      <StatusBadge
        label={text}
        colorClass="border border-transparent text-white"
        style={{ backgroundColor: color }}
        className={className}
      />
    );
  }

  return <StatusBadge label={text} colorClass={outlineStep(i, levels.length - 1)} className={className} />;
}
