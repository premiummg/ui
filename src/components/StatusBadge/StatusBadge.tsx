import { CSSProperties } from 'react';

export type StatusBadgeTone = 'success' | 'warning' | 'error' | 'neutral';

// The four color combos StatusBadge's own real uses already repeat by hand
// (approved/success green, pending/warning amber, rejected/error red,
// inactive/neutral gray) - genuinely generic across any app, unlike the
// STATUS WORDS themselves (which stay app-specific: see RoleBadge/
// TimesheetStatusBadge in timesheet-payroll-system, deliberately not part
// of this package because a different app's status vocabulary is its own).
const TONE_CLASSES: Record<StatusBadgeTone, string> = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  neutral: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400',
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
}

export function StatusBadge({ label, tone, colorClass, className = '', style }: StatusBadgeProps) {
  const resolved = colorClass ?? TONE_CLASSES[tone ?? 'neutral'];
  return (
    <span
      style={style}
      className={`inline-block px-2.5 py-1 rounded-full font-heading font-bold uppercase tracking-wider text-[10px] leading-none ${resolved} ${className}`}
    >
      {label}
    </span>
  );
}
