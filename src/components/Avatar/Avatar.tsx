import { useEffect, useState } from 'react';
import { initials } from '../../lib/initials';

export interface AvatarProps {
  fullName: string;
  size?: number;
  // The address of the person's photo. When it is given and loads, the photo is shown; without it, or when it fails to
  // load (deleted, no network), the initials are shown as before.
  src?: string | null;
  // `circle` (the default), or `tile`, a rounded square, for a header that puts the person in a tile.
  shape?: 'circle' | 'tile';
  // Overrides the default Steel Grey fill - e.g. to give each person in a
  // list a distinct, stable color (hash their id into a palette) instead of
  // every avatar reading the same neutral grey.
  color?: string;
  // When given, the avatar becomes a real button (cursor-pointer, keyboard
  // reachable) instead of a purely decorative initials tile.
  onClick?: () => void;
  className?: string;
}

// A person's photo when there is one, their initials when there is not. Steel Grey background regardless of theme by
// default: an avatar is a small, low-contrast UI element next to a name that's already doing the identifying work, not
// something that needs its own brand-red emphasis.
export function Avatar({ fullName, size = 40, src, shape = 'circle', color, onClick, className = '' }: AvatarProps) {
  const label = initials(fullName);
  // A photo that failed to load is not tried again on every render, only when its address changes.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  useEffect(() => setFailedSrc(null), [src]);
  const showPhoto = !!src && failedSrc !== src;
  return (
    <div
      onClick={onClick}
      className={`shrink-0 overflow-hidden ${shape === 'tile' ? 'rounded-xl' : 'rounded-full'} grid place-items-center font-heading font-bold text-white ${showPhoto || color ? '' : 'bg-(--premium-steel-grey)'} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36), ...(color && !showPhoto ? { backgroundColor: color } : {}) }}
    >
      {showPhoto ? (
        <img
          src={src!}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(src!)}
        />
      ) : (
        label
      )}
    </div>
  );
}
