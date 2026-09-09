import type { Meta, StoryObj } from '@storybook/react';
import { CountBadge } from './CountBadge';

const meta: Meta<typeof CountBadge> = {
  title: 'Components/CountBadge',
  component: CountBadge,
  args: { count: 128 },
};
export default meta;

type Story = StoryObj<typeof CountBadge>;

export const Default: Story = {};
export const Overflow: Story = { args: { count: '99+' } };
