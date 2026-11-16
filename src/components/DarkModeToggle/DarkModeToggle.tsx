import { FiSun, FiMoon } from 'react-icons/fi';

export interface DarkModeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  size?: number;
  className?: string;
  // Translated aria-label override for a localized consumer - defaults to
  // the English copy.
  ariaLabel?: string;
}

// Pair with the `useDarkMode` hook: `const { isDark, toggle } = useDarkMode()`.
// Kept as a plain controlled button (not wired to the hook itself) so it
// drops into a navbar, a page shell, or a Storybook story without pulling in
// document/localStorage access - same reasoning as every other component
// here taking its state as props instead of owning it.
// aria-pressed tells a screen reader whether dark mode is on, and the icon is
// grey-600 (not 400) so it clears the 3:1 that an icon-only control needs.
export function DarkModeToggle({ isDark, onToggle, size = 16, className = '', ariaLabel = 'Toggle dark mode' }: DarkModeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel}
      aria-pressed={isDark}
      className={`p-2 rounded-lg text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition ${className}`}
    >
      {isDark ? <FiSun size={size} /> : <FiMoon size={size} />}
    </button>
  );
}
