import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  args: {
    padding: true,
    children: 'Card content goes here.',
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {};
export const NoPadding: Story = { args: { padding: false, children: <div className="p-2">Custom padding</div> } };
