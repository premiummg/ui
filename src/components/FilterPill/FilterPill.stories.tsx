import type { Meta, StoryObj } from '@storybook/react';
import { FilterPill } from './FilterPill';

const meta: Meta<typeof FilterPill> = {
  title: 'Components/FilterPill',
  component: FilterPill,
  args: { label: 'Admin', onClick: () => {} },
};
export default meta;

type Story = StoryObj<typeof FilterPill>;

export const Active: Story = { args: { active: true } };
export const Inactive: Story = { args: { active: false } };
