import type { Meta, StoryObj } from '@storybook/react';
import { PremiumLogo } from './PremiumLogo';

const meta: Meta<typeof PremiumLogo> = {
  title: 'Components/PremiumLogo',
  component: PremiumLogo,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['stacked', 'horizontal'] },
  },
};
export default meta;

type Story = StoryObj<typeof PremiumLogo>;

export const Stacked: Story = { args: { variant: 'stacked', size: 'lg' } };
export const Horizontal: Story = { args: { variant: 'horizontal', size: 'md' } };

// A footer that's always Premium Black, in both app themes - the logo has to
// stay pinned to the dark-mode artwork there regardless of the visitor's own
// theme choice, which is what mode="dark" is for.
export const PinnedDarkOnAFixedSurface: Story = {
  args: { variant: 'horizontal', size: 'sm', mode: 'dark' },
  decorators: [Story => <div className="p-6 bg-(--premium-black) inline-block"><Story /></div>],
};
