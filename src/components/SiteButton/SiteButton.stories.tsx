import type { Meta, StoryObj } from '@storybook/react';
import { SiteButton } from './SiteButton';

const meta: Meta<typeof SiteButton> = {
  title: 'Components/SiteButton',
  component: SiteButton,
  args: { children: 'Get an estimate' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'ghost', 'onRed', 'onDark'] },
  },
};
export default meta;

type Story = StoryObj<typeof SiteButton>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const OnRed: Story = {
  args: { variant: 'onRed' },
  decorators: [Story => <div className="p-6 bg-(--premium-red) inline-block"><Story /></div>],
};
export const OnDark: Story = {
  args: { variant: 'onDark' },
  decorators: [Story => <div className="p-6 bg-(--premium-black) inline-block"><Story /></div>],
};
