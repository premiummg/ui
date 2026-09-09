import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { MonthNav } from './MonthNav';

const meta: Meta<typeof MonthNav> = {
  title: 'Components/MonthNav',
  component: MonthNav,
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

type Story = StoryObj<typeof MonthNav>;

// Real context #1: next to a big page title, on a solid brand-red header
// band (`variant="hero"`) - this is what the OverviewPage.tsx dashboard uses.
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
                <h1 className="font-heading font-black text-2xl text-white leading-none">September 2026</h1>
              </div>
              <MonthNav value={value} months={['2026-08', '2026-07', '2026-06']} onChange={setValue} variant="hero" />
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
// period caption - it states the range AND lets you change it, in place.
export const InAStatCard: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <div className="w-72 relative bg-white dark:bg-(--premium-dark-grey) rounded-2xl border border-gray-100 dark:border-white/10 p-5">
          <span className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-2xl" style={{ backgroundColor: 'var(--premium-red)' }} />
          <div className="flex items-start justify-between mb-3 pl-1">
            <p className="pmg-eyebrow text-gray-400 dark:text-gray-500">Hours this month</p>
            <FiTrendingUp size={15} className="text-(--premium-red)" />
          </div>
          <p className="pmg-figure text-4xl leading-none pl-1 text-gray-900 dark:text-gray-100">142.5</p>
          <div className="pl-1 mt-2 -ml-1">
            <MonthNav value={value} months={['2026-08', '2026-07']} onChange={setValue} />
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
      return <MonthNav value={value} onChange={setValue} />;
    }
    return <Demo />;
  },
};

export const RestrictedToAvailableMonths: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<string | null>(null);
      return <MonthNav value={value} months={['2026-01', '2025-12', '2025-11']} onChange={setValue} />;
    }
    return <Demo />;
  },
};
