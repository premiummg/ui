import { ReactNode } from 'react';

export interface MediaCardProps {
  imageSrc: string;
  imageAlt?: string;
  eyebrow?: ReactNode;
  // Any CSS color for the eyebrow line. Defaults to Premium's own secondary
  // red - same default as `ColorField`/`PortraitFigure`/`StatBlock`.
  eyebrowColor?: string;
  title: string;
  children: ReactNode;
  // Given, the whole card becomes a real <button> (reachable by keyboard,
  // announced correctly to a screen reader) with a hover lift; omitted, it's
  // a plain non-interactive card. A square photo that only reads as
  // decoration shouldn't promise a click it can't deliver.
  onClick?: () => void;
  className?: string;
}

// A square photo over a title, a colored eyebrow line, and a body line - a
// program/category tile ("Adults, 14+, all levels welcome").
export function MediaCard({
  imageSrc, imageAlt = '', eyebrow, eyebrowColor = 'var(--premium-red-dark)', title, children, onClick, className = '',
}: MediaCardProps) {
  const body = (
    <>
      <div className="relative aspect-square bg-black/5 overflow-hidden">
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-5">
        {/* break-words: without it, a single long word (no space for the
            browser's default wrapping to break at) overflows a narrow grid
            column instead of wrapping - invisibly, since the card's own
            overflow-hidden (needed to clip the image's rounded corners and
            hover-scale) silently clips that overflow instead of showing it. */}
        <h3 className="font-heading font-extrabold text-lg text-(--premium-black) dark:text-white wrap-break-word">{title}</h3>
        {eyebrow && (
          <p className="pmg-eyebrow mt-1" style={{ color: eyebrowColor }}>
            {eyebrow}
          </p>
        )}
        <p className="text-sm leading-relaxed mt-3 text-gray-600 dark:text-gray-400">{children}</p>
      </div>
    </>
  );

  const sharedClass =
    `group rounded-2xl overflow-hidden bg-white dark:bg-(--premium-steel-grey) border border-gray-200 dark:border-white/10 ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${sharedClass} w-full h-full text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/40`}
      >
        {body}
      </button>
    );
  }

  return <div className={`${sharedClass} h-full`}>{body}</div>;
}
