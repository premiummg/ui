import type { Meta, StoryObj } from '@storybook/react';
import { FiUsers, FiBriefcase, FiShoppingCart, FiClock } from 'react-icons/fi';
import { NavTile } from './NavTile';

const meta: Meta<typeof NavTile> = {
  title: 'Components/NavTile',
  component: NavTile,
  args: { onClick: () => {} },
};
export default meta;

type Story = StoryObj<typeof NavTile>;

export const Default: Story = { args: { icon: FiUsers, label: 'Employees', description: 'Manage team members' } };

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
      <NavTile icon={FiUsers} label="Employees" description="Manage team members" onClick={() => {}} />
      <NavTile icon={FiBriefcase} label="Projects" description="View and manage projects" onClick={() => {}} />
      <NavTile icon={FiShoppingCart} label="Purchase Orders" description="Manage purchase orders" onClick={() => {}} />
      <NavTile icon={FiClock} label="Create Timesheet" description="Log hours for you or a team member" onClick={() => {}} />
    </div>
  ),
};
