import type { Meta, StoryObj } from '@storybook/react';
import { FiEdit2, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  args: { 'aria-label': 'Edit', children: <FiEdit2 size={14} /> },
};
export default meta;

type Story = StoryObj<typeof IconButton>;

export const Neutral: Story = {};
export const Danger: Story = { args: { 'aria-label': 'Delete', tone: 'danger', children: <FiTrash2 size={14} /> } };
export const OnColor: Story = {
  render: () => (
    <div className="pmg-field p-6 rounded-xl">
      <IconButton aria-label="Refresh" tone="onColor" size="md"><FiRefreshCw size={14} /></IconButton>
    </div>
  ),
};
export const Disabled: Story = { args: { disabled: true } };
