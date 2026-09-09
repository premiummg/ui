import { ReactNode } from 'react';

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  // 'left' (default): icon, title and body all left-aligned, stacked -
  // LandingProposalPage's "Why us" tile. 'center': icon centered above
  // centered title/body - OtoshiProposalPage's "Community" tile layout
  // (without that one's own colored hover-fill chip behind the icon, which
  // is a separate, single-brand treatment, not a matter of position).
  align?: 'left' | 'center';
  className?: string;
}

// A short "why us" tile: an icon, a bold title, a line of body copy. The icon
// is rendered as-is (no size/color forced on it) so a caller's own
// react-icons element - already carrying its own size and, via currentColor,
// its own color - drops in unchanged.
export function FeatureCard({ icon, title, children, align = 'left', className = '' }: FeatureCardProps) {
  return (
    <div
      className={`h-full rounded-2xl p-7 bg-white dark:bg-(--premium-dark-grey) border border-gray-200 dark:border-white/10 ${
        align === 'center' ? 'flex flex-col items-center text-center' : ''
      } ${className}`}
    >
      <div className="w-11 h-11 grid place-items-center">{icon}</div>
      <h3 className="font-heading font-extrabold text-base mt-5 text-(--premium-black) dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed mt-2.5 text-gray-600 dark:text-gray-400">{children}</p>
    </div>
  );
}
