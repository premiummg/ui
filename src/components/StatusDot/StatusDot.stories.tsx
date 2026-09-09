import type { Meta, StoryObj } from '@storybook/react';
import { StatusDot } from './StatusDot';

const meta: Meta<typeof StatusDot> = {
  title: 'Components/StatusDot',
  component: StatusDot,
};
export default meta;

type Story = StoryObj<typeof StatusDot>;

export const Active: Story = { args: { active: true } };
export const Inactive: Story = { args: { active: false } };
export const GloballyDeactivated: Story = { args: { active: true, identityActive: false } };
// "presence" pins the dot to an avatar's own corner, ringed in the surface
// color so it reads as attached to the person, not floating beside a name -
// pair it with any relatively-positioned avatar, like this initials circle.
export const Presence: Story = {
  render: args => (
    <div className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-(--premium-red) text-white text-sm font-heading font-bold">
      KJ
      <StatusDot {...args} />
    </div>
  ),
  args: { active: true, variant: 'presence' },
};
