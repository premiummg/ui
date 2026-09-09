import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  parameters: {
    docs: {
      description: {
        component:
          'tone covers the four standard colors (success/warning/error/neutral) with no Tailwind ' +
          'classes to write. colorClass stays for anything outside those four - an app\'s own ' +
          'semantic wrapper (RoleBadge, TimesheetStatusBadge) still owns its own status vocabulary; ' +
          'this only saves rewriting the same 4 color pairs by hand.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Approved: Story = { args: { label: 'approved', tone: 'success' } };
export const Pending: Story = { args: { label: 'pending', tone: 'warning' } };
export const Rejected: Story = { args: { label: 'rejected', tone: 'error' } };
export const Inactive: Story = { args: { label: 'inactive', tone: 'neutral' } };

// Outside the four standard tones - colorClass still takes full manual
// control, same as before tone existed.
export const CustomColorClass: Story = {
  args: { label: 'flagged', colorClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};
