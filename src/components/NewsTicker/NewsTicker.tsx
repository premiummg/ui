import { useMemo } from 'react';

export interface NewsTickerItem {
  id: string | number;
  title: string;
  important?: boolean;
  // When set, the headline renders as a real link (opened in a new tab)
  // instead of a plain button - onItemClick, if also given, still fires
  // alongside the navigation (e.g. for click tracking).
  href?: string;
}

export interface NewsTickerProps {
  items: NewsTickerItem[];
  // Shown as a solid red tab on the left, same device PageHeader's own
  // eyebrow band uses for "here's what this whole strip is."
  label?: string;
  onItemClick?: (item: NewsTickerItem) => void;
  className?: string;
}

// A continuously-scrolling marquee of headlines for a home/dashboard page -
// built for an intranet's "Latest News" strip, general enough for any
// scrolling-announcements use. The list is repeated several times back to
// back so a -50%→0% transform loops with no visible seam, and the loop
// pauses on hover (.news-ticker-track in styles.css) so a headline holds
// still long enough to actually read or click.
export function NewsTicker({ items, label = 'Latest News', onItemClick, className = '' }: NewsTickerProps) {
  // 6 copies is enough head-room that the visible viewport never runs out of
  // content before the track wraps back to its start, at any reasonable
  // container width. Memoized since this strip sits on a dashboard/home page
  // that plausibly re-renders often (polling, unrelated sibling state) - not
  // just when `items` itself changes.
  const repeated = useMemo(
    () => [...Array(6)].flatMap(() => items).concat([...Array(6)].flatMap(() => items)),
    [items],
  );
  if (!items.length) return null;

  return (
    <div className={`flex items-center overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-(--premium-dark-grey) ${className}`}>
      <span className="shrink-0 whitespace-nowrap px-4 py-3 pmg-eyebrow text-white bg-(--premium-red)">
        {label}
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div
          className="news-ticker-track flex w-max gap-10 whitespace-nowrap py-3 pl-6"
          // 30s per item keeps a constant scroll speed at any item count - a
          // fixed floor here (an earlier version had one) makes a short list
          // crawl far slower than a long one for the exact same reason a
          // fixed-duration marquee always does: the same time budget has to
          // cover less content, so a short list looks like it's dragging.
          style={{ animationDuration: `${items.length * 30}s` }}
        >
          {repeated.map((item, i) => {
            const linkClassName = `text-xs font-medium transition ${
              item.important
                ? 'px-2.5 py-1 rounded-lg text-white hover:opacity-85 bg-(--premium-red)'
                : 'text-gray-700 dark:text-gray-200 hover:text-(--premium-red) dark:hover:text-(--premium-red)'
            }`;
            const handleClick = onItemClick ? () => onItemClick(item) : undefined;
            return (
              <div key={`${item.id}-${i}`} className="flex items-center gap-3">
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={linkClassName}>
                    {item.title}
                  </a>
                ) : (
                  <button type="button" onClick={handleClick} className={linkClassName}>
                    {item.title}
                  </button>
                )}
                <span className="text-gray-300 dark:text-gray-600">&bull;</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
