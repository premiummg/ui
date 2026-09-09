import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Approved: Story = { args: { label: 'approved', colorClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' } };
export const Pending: Story = { args: { label: 'pending', colorClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' } };
export const Rejected: Story = { args: { label: 'rejected', colorClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' } };
