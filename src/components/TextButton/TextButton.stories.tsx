import type { Meta, StoryObj } from '@storybook/react';
import { TextButton } from './TextButton';

const meta: Meta<typeof TextButton> = {
  title: 'Components/TextButton',
  component: TextButton,
  args: { children: 'Clear all filters' },
};
export default meta;

type Story = StoryObj<typeof TextButton>;

export const Muted: Story = {};
export const Accent: Story = { args: { tone: 'accent', children: 'View all' } };
