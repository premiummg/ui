import { MouseEvent, ReactNode } from 'react';
import { FiImage } from 'react-icons/fi';
import { isPlainLeftClick } from '../../lib/linkClick';

export interface PostCardProps {
  // Optional: a post without a photo yet gets a hatched placeholder in the
  // same box, so a row of cards keeps one height.
  imageSrc?: string;
  imageAlt?: string;
  category: ReactNode;
  title: string;
  excerpt: ReactNode;
  // Machine-readable date for the <time> element (YYYY-MM-DD) and the date as
  // the reader should see it, already formatted in their language.
  date: string;
  dateLabel: ReactNode;
  // "5 min read" - already worded in the reader's language.
  readTime?: ReactNode;
  href: string;
  // Called instead of a page load for a plain click (a client-side router).
  onNavigate?: () => void;
  // The card's heading level, so a list under an h2 can use h3 and a list
  // that IS the page's main content can use h2.
  titleAs?: 'h2' | 'h3';
  className?: string;
}

// A blog post in a listing: photo, category, title, excerpt, then the date
// and reading time pinned to the bottom edge so a row of cards lines up even
// when their excerpts differ in length. Only the title is the link (its
// hit area stretched over the whole card), so a screen reader hears one link
// named after the post rather than a card's worth of text read as a link.
export function PostCard({
  imageSrc, imageAlt = '', category, title, excerpt, date, dateLabel, readTime, href, onNavigate,
  titleAs: Title = 'h3', className = '',
}: PostCardProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate || !isPlainLeftClick(e)) return;
    e.preventDefault();
    onNavigate();
  };

  return (
    <article
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-(--premium-steel-grey) border border-gray-200 dark:border-white/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/40 ${className}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-(--premium-steel-grey)">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-white/70">
            <div className="absolute inset-0 pmg-texture text-white" />
            <FiImage size={28} aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 gap-3 p-6">
        <p className="pmg-eyebrow text-(--premium-red-dark) dark:text-[#F0797D]">{category}</p>
        <Title className="font-heading font-extrabold text-xl leading-tight text-(--premium-black) dark:text-white">
          <a
            href={href}
            onClick={handleClick}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline"
          >
            {title}
          </a>
        </Title>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{excerpt}</p>
        <div className="mt-auto pt-3 flex items-center justify-between gap-3 border-t border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-gray-300">
          <time dateTime={date}>{dateLabel}</time>
          {readTime && <span>{readTime}</span>}
        </div>
      </div>
    </article>
  );
}
