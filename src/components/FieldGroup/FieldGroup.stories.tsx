import type { Meta, StoryObj } from '@storybook/react';
import { FieldGroup } from './FieldGroup';

const meta: Meta<typeof FieldGroup> = {
  title: 'Components/FieldGroup',
  component: FieldGroup,
  args: {
    title: 'Compensation',
    note: 'Visible to admins and finance only.',
    children: (
      <div className="space-y-3">
        <input className="input-field w-full" placeholder="Hourly rate" />
        <input className="input-field w-full" placeholder="Overtime rate" />
      </div>
    ),
  },
};
export default meta;

type Story = StoryObj<typeof FieldGroup>;

export const Default: Story = {};
