import type { Meta, StoryObj } from '@storybook/react';
import { FilterLabel } from './FilterLabel';

const meta: Meta<typeof FilterLabel> = {
  title: 'Components/FilterLabel',
  component: FilterLabel,
  args: { text: 'Status' },
};
export default meta;

type Story = StoryObj<typeof FilterLabel>;

export const Default: Story = {};
