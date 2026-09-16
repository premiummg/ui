export interface AvatarProps {
  fullName: string;
  size?: number;
  // Overrides the default Steel Grey fill - e.g. to give each person in a
  // list a distinct, stable color (hash their id into a palette) instead of
  // every avatar reading the same neutral grey.
  color?: string;
  className?: string;
}

// Initials-only avatar - no photo upload/storage exists anywhere in a
// Premium app yet, so this is the one shape every "who did this" spot
// (a comment, an assignee chip, a directory row) actually needs today.
// Steel Grey background regardless of theme by default: an avatar is a
// small, low-contrast UI element next to a name that's already doing the
// identifying work, not something that needs its own brand-red emphasis.
export function Avatar({ fullName, size = 40, color, className = '' }: AvatarProps) {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className={`shrink-0 rounded-full grid place-items-center font-heading font-bold text-white ${color ? '' : 'bg-(--premium-steel-grey)'} ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36), ...(color ? { backgroundColor: color } : {}) }}
    >
      {initials}
    </div>
  );
}
