import { CSSProperties, ReactNode } from 'react';
import { WARNING_TEXT_CLASS } from '../../lib/severityColors';

export type StatusBadgeTone = 'success' | 'warning' | 'error' | 'neutral' | 'attention' | 'onColor' | 'onColorSoft';
export type StatusBadgeSize = 'sm' | 'md';

// The four color combos StatusBadge's own real uses already repeat by hand
// (approved/success green, pending/warning amber, rejected/error red,
// inactive/neutral gray) - genuinely generic across any app, unlike the
// STATUS WORDS themselves (which stay app-specific: see RoleBadge/
// TimesheetStatusBadge in timesheet-payroll-system, deliberately not part
// of this package because a different app's status vocabulary is its own).
const TONE_CLASSES: Record<StatusBadgeTone, string> = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: `bg-amber-100 dark:bg-amber-900/30 ${WARNING_TEXT_CLASS}`,
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  neutral: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400',
  // The brand amber (#FAAD00) for something waiting on the reader, the attention channel of the apps; `warning` is
  // Tailwind's amber.
  attention: 'bg-[#FAAD00]/15 text-[#7A5300] dark:bg-[#FAAD00]/10 dark:text-[#FAAD00]',
  // On a red band (a page header, a person's identity band): white on translucent white, where the light-surface tones
  // have no contrast. onColorSoft is the quieter one beside it (a status next to a role).
  onColor: 'bg-white/20 text-white',
  onColorSoft: 'bg-white/10 text-white/90',
};

const SIZE_CLASSES: Record<StatusBadgeSize, string> = {
  md: 'text-[10px] py-1',
  sm: 'text-[9px] py-0.5',
};

export interface StatusBadgeProps {
  label: string;
  // The common case - one of the four standard tones above, no Tailwind
  // classes to write. Defaults to neutral when neither tone nor colorClass
  // is given, rather than rendering unstyled.
  tone?: StatusBadgeTone;
  // Anything outside those four tones - a color that isn't one of them at
  // all, or an app's own semantic wrapper picking its own exact shades.
  // Wins over `tone` when both are given.
  colorClass?: string;
  className?: string;
  // For a color that isn't a Tailwind class - a caller-supplied brand color
  // (e.g. `RankBadge`'s filled top step), rather than one of this app's own
  // fixed variants.
  style?: CSSProperties;
  // A small colored dot before the label (a Tailwind background class, e.g.
  // 'bg-green-500') - omit for the plain pill, the common case. Two
  // sibling-app components each hand-rolled this exact same dot-plus-pill
  // markup around their own status color ramp before folding into this prop.
  dot?: string;
  // A small leading icon, for a state that is clearer with a glyph (clock, check).
  icon?: ReactNode;
  // sm: a smaller pill, for a card or a dense row.
  size?: StatusBadgeSize;
}

export function StatusBadge({ label, tone, colorClass, className = '', style, dot, icon, size = 'md' }: StatusBadgeProps) {
  const resolved = colorClass ?? TONE_CLASSES[tone ?? 'neutral'];
  return (
    <span
      style={style}
      className={`inline-flex items-center ${dot || icon ? 'gap-1.5 pl-1.5 pr-2.5' : 'px-2.5'} rounded-full font-heading font-bold uppercase tracking-wider leading-none ${SIZE_CLASSES[size]} ${resolved} ${className}`}
    >
      {dot && <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} />}
      {icon}
      {label}
    </span>
  );
}
