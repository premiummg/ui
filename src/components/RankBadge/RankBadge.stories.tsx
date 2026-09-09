import type { Meta, StoryObj } from '@storybook/react';
import { RankBadge } from './RankBadge';

const meta: Meta<typeof RankBadge> = {
  title: 'Components/RankBadge',
  component: RankBadge,
  parameters: {
    docs: {
      description: {
        component:
          'One badge out of an ordered ramp - a role, a priority, a tier - where each step should ' +
          'read as more or less weight than its neighbors. Give it `levels` (ordered low to high) ' +
          'for the built-in on-brand ramp - the same one this app\'s own role badges use - with no ' +
          'Tailwind classes to write yourself; the last entry always gets the filled, brand-colored ' +
          'top step. Pass `styles` instead for full manual control (a sister brand\'s own palette).',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof RankBadge>;

const ROLE_LEVELS = ['worker', 'foreman', 'finance', 'manager', 'admin'];

// The common case: just the ordered values, in order. No classes to write -
// the ramp (outline opacity/ink weight stepping up, filled red top step) is
// built in, matching the app's own role badges exactly.
export const RoleRamp: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {ROLE_LEVELS.map(role => (
        <RankBadge key={role} value={role} levels={ROLE_LEVELS} />
      ))}
    </div>
  ),
};

// A different project, a different ramp entirely - same `levels` prop, its
// own values and its own top-step color (Otoshi's navy instead of Premium
// red), still the same built-in outline steps underneath.
const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent'];

export const CustomRamp: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {PRIORITY_LEVELS.map(p => (
        <RankBadge key={p} value={p} levels={PRIORITY_LEVELS} color="#1A2C6E" />
      ))}
    </div>
  ),
};

export const UnmappedValue: Story = {
  render: () => <RankBadge value="contractor" levels={ROLE_LEVELS} />,
};

// Full manual control instead of the built-in ramp - a caller with its own
// complete color system (its own fill color per step, not just the top one).
const MANUAL_STYLES: Record<string, string> = {
  low: 'border border-transparent text-gray-400',
  medium: 'border border-gray-300 dark:border-white/25 text-gray-700 dark:text-gray-300',
  high: 'border border-transparent bg-[#FAAD00] text-white',
  urgent: 'border border-transparent bg-[#1A2C6E] text-white',
};

export const ManualStyles: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <RankBadge value="low" label="Low" styles={MANUAL_STYLES} />
      <RankBadge value="medium" label="Medium" styles={MANUAL_STYLES} />
      <RankBadge value="high" label="High" styles={MANUAL_STYLES} />
      <RankBadge value="urgent" label="Urgent" styles={MANUAL_STYLES} />
    </div>
  ),
};
