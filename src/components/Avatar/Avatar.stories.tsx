import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  args: { fullName: 'Jordan Reid' },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <Avatar fullName="Jordan Reid" size={24} />
      <Avatar fullName="Jordan Reid" size={32} />
      <Avatar fullName="Jordan Reid" size={40} />
      <Avatar fullName="Jordan Reid" size={56} />
    </div>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <Avatar fullName="Jordan Reid" color="#2563eb" />
      <Avatar fullName="Alex Chen" color="#059669" />
      <Avatar fullName="Sam Okafor" color="#d97706" />
    </div>
  ),
};

export const Clickable: Story = {
  args: { onClick: () => alert('Avatar clicked') },
};
