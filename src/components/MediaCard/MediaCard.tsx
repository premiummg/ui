import { MouseEvent, ReactNode } from 'react';
import { isPlainLeftClick } from '../../lib/linkClick';

export type MediaCardAspect = 'square' | 'wide';

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
  // Given, the whole card is a real <a href> instead (a service tile that
  // opens its own page). With `onClick` as well, a plain click calls it
  // instead of loading the page - the hook for a client-side router - while
  // Ctrl/Cmd-click still opens a new tab.
  href?: string;
  // 'square' (default) for a program/category tile; 'wide' (16:10) for a
  // service or project tile, where the photo is a scene, not a portrait.
  aspect?: MediaCardAspect;
  // A small label pinned to the photo's bottom-left corner on a SECONDARY
  // red plate cut at the brand's 45deg (a service number, "New").
  tag?: ReactNode;
  // A last line pinned to the card's bottom edge (a "Learn more" arrow, a
  // date), so it lines up across a row of cards whose bodies differ in length.
  footer?: ReactNode;
  className?: string;
}

const ASPECTS: Record<MediaCardAspect, string> = {
  square: 'aspect-square',
  wide: 'aspect-[16/10]',
};

// A square photo over a title, a colored eyebrow line, and a body line - a
// program/category tile ("Adults, 14+, all levels welcome").
export function MediaCard({
  imageSrc, imageAlt = '', eyebrow, eyebrowColor = 'var(--premium-red-dark)', title, children, onClick,
  href, aspect = 'square', tag, footer, className = '',
}: MediaCardProps) {
  const body = (
    <>
      <div className={`relative ${ASPECTS[aspect]} bg-black/5 overflow-hidden`}>
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {tag && (
          <span
            className="absolute left-0 bottom-0 pl-4 pr-6 py-2 font-heading font-black text-sm tabular-nums text-white"
            style={{ backgroundColor: 'var(--premium-red-dark)', clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' }}
          >
            {tag}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
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
        {footer && <div className="mt-auto pt-4">{footer}</div>}
      </div>
    </>
  );

  const sharedClass =
    `group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-(--premium-steel-grey) border border-gray-200 dark:border-white/10 ${className}`;
  const liftClass = 'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/40';

  if (href !== undefined) {
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      if (!onClick || !isPlainLeftClick(e)) return;
      e.preventDefault();
      onClick();
    };
    return (
      <a href={href} onClick={handleClick} className={`${sharedClass} h-full ${liftClass}`}>
        {body}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${sharedClass} w-full h-full text-left ${liftClass}`}
      >
        {body}
      </button>
    );
  }

  return <div className={`${sharedClass} h-full`}>{body}</div>;
}
