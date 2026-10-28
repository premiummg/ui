import type { IconType } from 'react-icons';
import { FiArrowRight } from 'react-icons/fi';

export interface NavTileProps {
  icon: IconType;
  label: string;
  description: string;
  // A real URL for the tile. With it the tile renders as an <a>, so
  // middle-click, Ctrl/Cmd/Shift-click and "Open in new tab" all work natively
  // (a <button> has no href for the browser to act on). Pair it with `onClick`
  // for client-side routing: a plain left-click calls onClick instead of a full
  // page load, exactly like RowLink's `onNavigate`. Without `href` it stays a
  // plain button.
  href?: string;
  onClick?: () => void;
}

// A big clickable tile for "go to this section of the app" grids (a
// dashboard's list of destinations). The 45deg corner notch on hover echoes
// the brand mark's own slant grid; the left accent bar grows in from the
// top rather than just appearing, so the hover state reads as a beat rather
// than a snap.
export function NavTile({ icon: Icon, label, description, href, onClick }: NavTileProps) {
  const className = `group relative ${href ? 'block ' : ''}text-left bg-white dark:bg-(--premium-dark-grey) rounded-xl border border-gray-100 dark:border-white/10 p-5 overflow-hidden
                 hover:border-(--premium-red) dark:hover:border-(--premium-red) hover:shadow-lg dark:hover:shadow-black/40
                 hover:-translate-y-0.5 transition-all duration-200`;
  const body = (
    <>
      <span
        className="absolute top-0 right-0 w-0 h-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ borderLeft: '18px solid transparent', borderTop: '18px solid var(--premium-red)' }}
      />
      <span
        className="absolute left-0 top-0 bottom-0 w-0.75 scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-200"
        style={{ backgroundColor: 'var(--premium-red)' }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg grid place-items-center transition-colors duration-200 group-hover:bg-(--premium-red)!"
          style={{ backgroundColor: 'var(--premium-red-light)' }}
        >
          <Icon size={19} className="transition-colors duration-200 group-hover:text-white!" style={{ color: 'var(--premium-red)' }} />
        </div>
        <FiArrowRight
          size={15}
          // dark:group-hover: (not just group-hover:) is required here: on an
          // equal-specificity tie between two single-variant utilities both
          // setting `color` (dark:text-gray-600 vs group-hover:text-red),
          // Tailwind's dark: rule sorts after group-hover:'s in the sheet and
          // wins on hover in dark mode too, unless the hover rule is itself
          // written as the compound dark:group-hover: variant.
          className="text-gray-300 dark:text-gray-600 group-hover:text-(--premium-red) dark:group-hover:text-(--premium-red) group-hover:translate-x-0.5 transition-all duration-200 mt-1"
        />
      </div>
      <p className="font-heading font-bold text-gray-900 dark:text-gray-100 text-sm leading-snug">{label}</p>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">{description}</p>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={className}
        onClick={(e) => {
          if (!onClick || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          onClick();
        }}
      >
        {body}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  );
}
