import { MouseEvent, ReactNode } from 'react';
import { isPlainLeftClick } from '../../lib/linkClick';

export interface PhotoTileProps {
  imageSrc: string;
  imageAlt: string;
  // Small amber line above the caption (a service, a category).
  eyebrow?: ReactNode;
  // The caption over the bottom of the photo (a project name and place).
  title: ReactNode;
  // 'feature' spans two columns and two rows of the grid it sits in from
  // `md` up - one lead photo among smaller ones. The grid sets the row height.
  size?: 'default' | 'feature';
  // Given, the tile is a real link (a project's own page); `onClick` then
  // stands in for a plain click, the hook for a client-side router. With
  // `onClick` and no `href`, the tile is a button.
  href?: string;
  onClick?: () => void;
  className?: string;
}

// A project photograph that fills its grid cell, with the caption set on a
// black gradient rising from the bottom edge so it clears contrast over any
// shot. Photography is the one thing a contractor has that a competitor
// can't copy, so it's shown as the evidence, not as decoration behind text.
export function PhotoTile({ imageSrc, imageAlt, eyebrow, title, size = 'default', href, onClick, className = '' }: PhotoTileProps) {
  const span = size === 'feature' ? 'md:col-span-2 md:row-span-2' : '';
  const inner = (
    <>
      <img
        src={imageSrc}
        alt={imageAlt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
      <figcaption className="absolute inset-x-5 bottom-4 flex flex-col gap-2">
        {eyebrow && <span className="pmg-eyebrow text-(--premium-orange)">{eyebrow}</span>}
        <span className={`font-heading font-extrabold leading-snug text-white ${size === 'feature' ? 'text-xl md:text-2xl' : 'text-base'}`}>
          {title}
        </span>
      </figcaption>
    </>
  );
  const shell = `group relative block overflow-hidden rounded-xl bg-(--premium-steel-grey) min-h-56 ${span} ${className}`;

  if (href !== undefined) {
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      if (!onClick || !isPlainLeftClick(e)) return;
      e.preventDefault();
      onClick();
    };
    return (
      <a href={href} onClick={handleClick} className={shell}>
        <figure className="m-0 absolute inset-0">{inner}</figure>
      </a>
    );
  }
  // An `onClick` with no `href` (open the photo in a viewer, say) makes the tile a button: it used to be dropped.
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${shell} w-full p-0 text-left cursor-pointer`}>
        <figure className="m-0 absolute inset-0">{inner}</figure>
      </button>
    );
  }
  return <figure className={`m-0 ${shell}`}>{inner}</figure>;
}
