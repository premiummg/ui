export interface CredentialBadge {
  // The mark exactly as the issuing body publishes it.
  src: string;
  // Name of the certification - the image's alt text and the link's name.
  name: string;
  // The issuing body's own site. Given, the plate links there in a new tab.
  href?: string;
}

export type CredentialBadgesSize = 'sm' | 'md' | 'lg';

export interface CredentialBadgesProps {
  items: CredentialBadge[];
  size?: CredentialBadgesSize;
  // A hairline around each plate, for a white or light-grey surface where a
  // white plate would otherwise disappear into the page.
  bordered?: boolean;
  className?: string;
}

const SIZES: Record<CredentialBadgesSize, string> = {
  sm: 'w-14 h-14 p-1.5',
  md: 'w-[72px] h-[72px] p-2',
  lg: 'w-24 h-24 p-2.5',
};

// Certification and membership marks (UL, FCIA, COR, NFCA...) on fixed
// white plates. A certification mark is not ours to recolour or knock out -
// inverting one to survive a dark background is exactly the alteration these
// bodies prohibit - so each one keeps a white plate on every surface and in
// both themes. Each mark carries its name as alt text: an unnamed badge is a
// small coloured square to anyone who doesn't already know it, and nothing
// at all to a screen reader.
export function CredentialBadges({ items, size = 'md', bordered = false, className = '' }: CredentialBadgesProps) {
  const plate = `grid place-items-center shrink-0 rounded-lg bg-white ${SIZES[size]} ${bordered ? 'border border-gray-200' : ''}`;
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {items.map(item => {
        const img = <img src={item.src} alt={item.name} loading="lazy" className="max-w-full max-h-full object-contain" />;
        return (
          <li key={item.name}>
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${plate} transition-transform duration-200 hover:-translate-y-0.5`}
              >
                {img}
              </a>
            ) : (
              <span className={plate}>{img}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
