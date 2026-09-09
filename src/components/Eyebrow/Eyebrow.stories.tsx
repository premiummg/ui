import type { Meta, StoryObj } from '@storybook/react';
import { Eyebrow } from './Eyebrow';

const meta: Meta<typeof Eyebrow> = {
  title: 'Components/Eyebrow',
  component: Eyebrow,
  args: { text: 'Our approach' },
};
export default meta;

type Story = StoryObj<typeof Eyebrow>;

export const Red: Story = { args: { tone: 'red' } };
export const White: Story = {
  args: { tone: 'white' },
  decorators: [Story => <div className="p-4 bg-(--premium-black) inline-block"><Story /></div>],
};
export const Amber: Story = { args: { tone: 'amber' } };
