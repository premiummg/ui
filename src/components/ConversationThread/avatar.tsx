import { Avatar as BrandAvatar } from '../Avatar';
import { initials } from '../../lib/initials';

// The chat's avatar is the shared one (steel grey disc, Montserrat initials),
// just at the small size a message row wants. Clickable when the app can open
// a profile.
export function Avatar({ name, onClick }: { name: string | null; onClick?: () => void }) {
  return <BrandAvatar fullName={name ?? '?'} size={28} onClick={onClick} />;
}

export { initials };
