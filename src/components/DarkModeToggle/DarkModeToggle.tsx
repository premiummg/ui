import { FiSun, FiMoon } from 'react-icons/fi';

export interface DarkModeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  size?: number;
  className?: string;
}

// Pair with the `useDarkMode` hook: `const { isDark, toggle } = useDarkMode()`.
// Kept as a plain controlled button (not wired to the hook itself) so it
// drops into a navbar, a page shell, or a Storybook story without pulling in
// document/localStorage access - same reasoning as every other component
// here taking its state as props instead of owning it.
export function DarkModeToggle({ isDark, onToggle, size = 16, className = '' }: DarkModeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle dark mode"
      className={`p-2 rounded-lg text-gray-400 dark:text-white/60 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition ${className}`}
    >
      {isDark ? <FiSun size={size} /> : <FiMoon size={size} />}
    </button>
  );
}
