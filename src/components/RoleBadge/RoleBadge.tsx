import { StatusBadge } from '../StatusBadge';

// The colour of each role of the company's apps, on one ramp by scope: the roles with less reach are quieter outlines,
// manager and director the heaviest ink, and only admin earns the brand red. Both apps wrote this table by hand.
export const ROLE_BADGE_CLASSES: Record<string, string> = {
  worker: 'border border-transparent text-gray-400 dark:text-gray-500',
  foreman: 'border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400',
  data_entry: 'border border-gray-300 dark:border-white/25 text-gray-700 dark:text-gray-300',
  finance: 'border border-gray-300 dark:border-white/25 text-gray-700 dark:text-gray-300',
  manager: 'border border-gray-400 dark:border-white/45 text-gray-900 dark:text-white',
  director: 'border border-gray-400 dark:border-white/45 text-gray-900 dark:text-white',
  admin: 'border border-transparent bg-(--premium-red) text-white',
};

// The roles in the order of that ramp, for a list of roles to show from least to most reach.
export const ROLE_RAMP = ['worker', 'foreman', 'data_entry', 'finance', 'manager', 'director', 'admin'];

const FALLBACK = 'bg-gray-100 text-gray-600 dark:bg-(--premium-steel-grey) dark:text-gray-400';

export interface RoleBadgeProps {
  // The role as the apps store it (worker, admin...): it picks the colour.
  role: string;
  // What the person reads, in their language; the app owns its role names.
  label: string;
  className?: string;
}

export function RoleBadge({ role, label, className = '' }: RoleBadgeProps) {
  return <StatusBadge label={label} colorClass={ROLE_BADGE_CLASSES[role] ?? FALLBACK} className={`whitespace-nowrap ${className}`} />;
}
