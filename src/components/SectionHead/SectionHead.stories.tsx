import type { Meta, StoryObj } from '@storybook/react';
import { SectionHead } from './SectionHead';

const meta: Meta<typeof SectionHead> = {
  title: 'Components/SectionHead',
  component: SectionHead,
  args: {
    eyebrow: 'Our approach',
    title: 'Built with heart, run with discipline.',
    sub: 'Every project gets the same crew, the same standards, and a straight answer when something changes.',
  },
};
export default meta;

type Story = StoryObj<typeof SectionHead>;

export const Default: Story = {};
export const Centered: Story = { args: { center: true } };
export const DarkTone: Story = {
  args: { tone: 'dark' },
  decorators: [Story => <div className="p-8 bg-(--premium-black)"><Story /></div>],
};
