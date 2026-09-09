import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FiGrid, FiClipboard, FiMessageSquare, FiBell, FiLogOut } from 'react-icons/fi';
import { Navbar } from './Navbar';
import { NAV_TONES, NavTone } from './navTone';
import { DarkModeToggle } from '../DarkModeToggle';

const meta: Meta<typeof Navbar> = {
  title: 'Components/Navbar',
  component: Navbar,
  parameters: {
    docs: {
      description: {
        component:
          'The shell only - logo, brand-tone background, hi-vis stripe. Real nav items ' +
          '(notification bell, profile menu, sign-out) are wired to one app\'s own auth/API state, ' +
          'so they\'re supplied as `children` rather than owned by this component. Compose it with ' +
          '`DarkModeToggle` and `NotificationBell` from this same package, then hand the whole thing ' +
          'to `Layout`\'s `navbar` prop.',
      },
    },
  },
  argTypes: {
    tone: { control: 'select', options: Object.keys(NAV_TONES) },
  },
};
export default meta;

type Story = StoryObj<typeof Navbar>;

function ExampleActions() {
  const [isDark, setIsDark] = useState(true);
  return (
    <>
      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition">
        <FiGrid size={14} /> Dashboard
      </button>
      <div className="w-px h-5 bg-gray-200 dark:bg-white/15 mx-0.5" />
      <DarkModeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} />
      <button className="relative p-2 rounded-lg text-gray-400 dark:text-white/60 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition">
        <FiClipboard size={16} />
        <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-yellow-900 rounded-full flex items-center justify-center bg-yellow-400">3</span>
      </button>
      <button className="p-2 rounded-lg text-gray-400 dark:text-white/60 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition">
        <FiMessageSquare size={16} />
      </button>
      <button className="relative p-2 rounded-lg text-gray-400 dark:text-white/60 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition">
        <FiBell size={16} />
        <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--premium-red)' }}>2</span>
      </button>
      <button className="inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-heading font-bold shrink-0" style={{ backgroundColor: 'var(--premium-red)' }}>
          CO
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm font-medium text-gray-700 dark:text-white">Caliche Orozco</span>
          <span className="pmg-eyebrow text-[9px] text-gray-400 dark:text-white/50">Admin</span>
        </div>
      </button>
      <button className="p-2 rounded-lg text-gray-400 dark:text-white/60 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-white/10 transition">
        <FiLogOut size={16} />
      </button>
    </>
  );
}

// A full, realistically-composed navbar. In dark mode (toggle the toolbar
// above) it uses whichever tone the Controls panel's `tone` select picks -
// `render` takes `args` here specifically so that control does something,
// unlike a plain `render: () => (...)` which would show the control without
// it actually driving anything.
export const FullyComposed: Story = {
  args: { tone: 'black' },
  render: (args) => (
    <Navbar {...args}>
      <ExampleActions />
    </Navbar>
  ),
};

// The three tone options side by side, forced into dark mode locally (`.dark`
// as a wrapper class, not the page toolbar) so the comparison doesn't depend
// on your Storybook theme setting - this mirrors the "Layout & Navigation"
// section of the /design proposal page this component was lifted from.
export const AllTones: Story = {
  render: () => (
    <div className="dark bg-(--premium-black) p-6 space-y-6 rounded-2xl">
      {(Object.keys(NAV_TONES) as NavTone[]).map(tone => (
        <div key={tone}>
          <p className="pmg-eyebrow text-gray-100 mb-2">{NAV_TONES[tone].name}</p>
          <div className="rounded-2xl overflow-hidden border border-white/10">
            <Navbar tone={tone}>
              <ExampleActions />
            </Navbar>
          </div>
          <p className="text-xs text-gray-400 mt-2 max-w-2xl leading-relaxed">{NAV_TONES[tone].why}</p>
        </div>
      ))}
    </div>
  ),
};
