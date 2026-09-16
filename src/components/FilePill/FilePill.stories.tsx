import type { Meta, StoryObj } from '@storybook/react';
import { FilePill } from './FilePill';

const meta: Meta<typeof FilePill> = {
  title: 'Components/FilePill',
  component: FilePill,
  args: { name: 'Q3-invoice.pdf' },
};
export default meta;

type Story = StoryObj<typeof FilePill>;

export const Default: Story = {
  render: args => (
    <div className="max-w-xs">
      <FilePill {...args} onRemove={() => {}} />
    </div>
  ),
};
