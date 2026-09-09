import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FiClock } from 'react-icons/fi';
import { WeekNav } from './WeekNav';
import { PageHeader } from '../PageHeader';
import { StatCard } from '../StatCard';

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
// band. The real PageHeader component, not a hand-rolled pmg-field/pmg-bars
// band - it's the same page-header chrome, so there's no reason to
// reconstruct it here.
export const InAHeroPageHeader: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <div className="w-full max-w-2xl">
          <PageHeader>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="pmg-eyebrow text-white/70 mb-1.5">My dashboard</p>
                <h1 className="font-heading font-black text-2xl text-white leading-none">This week</h1>
              </div>
              <WeekNav value={value} onChange={setValue} variant="hero" align="left" />
            </div>
          </PageHeader>
          <div className="pmg-stripe h-0.75" />
        </div>
      );
    }
    return <Demo />;
  },
};

// Real context #2: the default (non-hero) variant, replacing a stat card's
// period caption - this is exactly OverviewPage.tsx's "Hours this week"
// card. The real StatCard, not a hand-rolled lookalike - its icon prop and
// its hint slot (a real element, not just a caption string) exist for
// exactly this composition. onClick is deliberately omitted: WeekNav's own
// dropdown trigger is itself interactive, and a real <button> can't contain
// another.
export const InAStatCard: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <div className="w-72">
          <StatCard
            label="Hours this week"
            value="38.2"
            icon={FiClock}
            hint={<div className="-ml-1"><WeekNav value={value} onChange={setValue} align="left" /></div>}
          />
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
