import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FiClock } from 'react-icons/fi';
import { WeekNav } from './WeekNav';

const meta: Meta<typeof WeekNav> = {
  title: 'Components/WeekNav',
  component: WeekNav,
  parameters: {
    docs: {
      description: {
        component:
          'Not a form field like `DatePicker` - a compact "which period am I viewing" control ' +
          'that sits inside something else (a page header, a stat card), so it never carries its ' +
          'own border/box. Both stories below show it in the two real contexts it actually ships in.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof WeekNav>;

// Real context #1: next to a big page title, on a solid brand-red header
// band (`variant="hero"`).
export const InAHeroPageHeader: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <div className="w-full max-w-2xl">
          <div className="relative pmg-field px-6 py-5 rounded-t-2xl">
            <div className="absolute inset-0 pmg-bars pointer-events-none" />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="pmg-eyebrow text-white/70 mb-1.5">My dashboard</p>
                <h1 className="font-heading font-black text-2xl text-white leading-none">This week</h1>
              </div>
              <WeekNav value={value} onChange={setValue} variant="hero" align="left" />
            </div>
          </div>
          <div className="pmg-stripe h-0.75" />
        </div>
      );
    }
    return <Demo />;
  },
};

// Real context #2: the default (non-hero) variant, replacing a stat card's
// period caption - this is exactly OverviewPage.tsx's "Hours this week" card.
export const InAStatCard: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <div className="w-72 relative bg-white dark:bg-(--premium-dark-grey) rounded-2xl border border-gray-100 dark:border-white/10 p-5">
          <span className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-2xl" style={{ backgroundColor: 'var(--premium-red)' }} />
          <div className="flex items-start justify-between mb-3 pl-1">
            <p className="pmg-eyebrow text-gray-400 dark:text-gray-500">Hours this week</p>
            <FiClock size={15} className="text-(--premium-red)" />
          </div>
          <p className="pmg-figure text-4xl leading-none pl-1 text-gray-900 dark:text-gray-100">38.2</p>
          <div className="pl-1 mt-2 -ml-1">
            <WeekNav value={value} onChange={setValue} align="left" />
          </div>
        </div>
      );
    }
    return <Demo />;
  },
};

// The bare control, with nothing around it - useful for checking its own
// states in isolation, but not how it ships in a real page (see the two
// stories above for that).
export const BareControl: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<string | null>(null);
      return <WeekNav value={value} onChange={setValue} />;
    }
    return <Demo />;
  },
};
