export interface PortraitFigureProps {
  imageSrc: string;
  name: string;
  role: string;
  // Any CSS color for the corner tag. Defaults to Premium's own secondary
  // red - the same default as `ColorField`, since it's the same "solid
  // color field that commands attention" device (BRAND.md pg. 16), just
  // diagonal-cut into a corner tag instead of a full-width band.
  color?: string;
  className?: string;
}

// A portrait photo with a name/role tag cut into its corner at the brand's
// own 45deg angle, rather than a plain rounded box borrowed from a UI kit.
// On a trade where the real decision a visitor makes is "do I trust these
// people", a named face reads as a person rather than as decoration - worth
// the one dedicated component instead of an `<img>` with text floating over
// it in every place a team member gets introduced.
export function PortraitFigure({ imageSrc, name, role, color = 'var(--premium-red-dark)', className = '' }: PortraitFigureProps) {
  return (
    <figure className={`relative ${className}`}>
      <div className="relative aspect-4/5 rounded-2xl overflow-hidden">
        <img src={imageSrc} alt={`${name}, ${role}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <figcaption
        className="absolute left-5 bottom-5 px-5 py-3 text-white"
        style={{ backgroundColor: color, clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)' }}
      >
        <p className="font-heading font-black leading-tight">{name}</p>
        <p className="pmg-eyebrow text-white/70 mt-1">{role}</p>
      </figcaption>
    </figure>
  );
}
