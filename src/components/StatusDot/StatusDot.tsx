export interface StatusDotProps {
  // Access to this app.
  active: boolean;
  // Account status across every Premium application. Signing in needs both,
  // so someone active here but deactivated account-wide still cannot get in -
  // painting that green would repeat the exact bug this dot is meant to expose.
  // Null (identity-service didn't report it) is treated as fine, so an older
  // backend never raises a false alarm.
  identityActive?: boolean | null;
  className?: string;
  // "presence" pins the dot to the bottom-right of a relatively positioned
  // avatar and gives it a ring in the surface colour, so it reads as attached
  // to the person rather than as a bullet beside their name.
  variant?: 'inline' | 'presence';
  // Overrides for the three tooltip/aria-label strings - e.g. translated text
  // for a localized consumer. Each defaults to the English copy.
  inactiveLabel?: string;
  deactivatedLabel?: string;
  activeLabel?: string;
}

// Tiny at-a-glance state marker for list rows. Colour alone is never the whole
// story - the title gives the same information on hover.
export function StatusDot({
  active,
  identityActive,
  className = '',
  variant = 'inline',
  inactiveLabel = 'Inactive - no access to this app',
  deactivatedLabel = 'Deactivated across all Premium apps - cannot sign in',
  activeLabel = 'Active',
}: StatusDotProps) {
  const globallyOff = identityActive === false;
  const color = !active
    ? 'bg-gray-300 dark:bg-[#4A4A4A]'
    : globallyOff
      ? 'bg-[#FAAD00]'
      : 'bg-green-500';
  const title = !active
    ? inactiveLabel
    : globallyOff
      ? deactivatedLabel
      : activeLabel;

  const shape = variant === 'presence'
    ? 'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border-2 border-white dark:border-(--premium-dark-grey)'
    : 'inline-block h-2 w-2';

  return (
    <span
      title={title}
      aria-label={title}
      className={`shrink-0 rounded-full ${shape} ${color} ${className}`}
    />
  );
}
