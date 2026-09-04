import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  argTypes: {
    variant: { control: 'select', options: ['error', 'success', 'warning', 'info'] },
  },
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Error: Story = { args: { variant: 'error', children: 'Something needs your attention.' } };
export const Success: Story = { args: { variant: 'success', children: 'Purchase order approved.' } };
export const Warning: Story = { args: { variant: 'warning', children: 'This timesheet is over budget.' } };
export const Info: Story = { args: { variant: 'info', children: 'Backdated timesheets are disabled for this division.' } };
