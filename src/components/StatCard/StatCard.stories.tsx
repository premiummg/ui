import type { Meta, StoryObj } from '@storybook/react';
import { FiTrendingUp } from 'react-icons/fi';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  decorators: [Story => <div className="grid grid-cols-2 gap-3 w-full max-w-md"><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof StatCard>;

export const Grid: Story = {
  render: () => (
    <>
      <StatCard label="Hours this week" value="38.2" hint="this week" />
      <StatCard label="Hours this month" value="142.5" hint="this month" />
      <StatCard label="Pending" value="3" hint="awaiting review" tone="amber" onClick={() => {}} />
      <StatCard label="Flagged" value="0" hint="still open" />
    </>
  ),
};

export const Default: Story = { args: { label: 'Hours this week', value: '38.2', hint: 'this week' } };
export const Amber: Story = { args: { label: 'Pending', value: '3', hint: 'awaiting review', tone: 'amber' } };
export const Clickable: Story = { args: { label: 'Open POs', value: '5', hint: 'in progress', onClick: () => {} } };

// icon is purely decorative; hint takes a real element, not just a caption
// string - see MonthNav/WeekNav's own InAStatCard stories for the actual
// reason that matters: a period picker replacing the caption in place.
export const WithIcon: Story = { args: { label: 'Hours this month', value: '142.5', icon: FiTrendingUp } };
