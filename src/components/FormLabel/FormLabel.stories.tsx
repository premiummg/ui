import type { Meta, StoryObj } from '@storybook/react';
import { FormLabel } from './FormLabel';

const meta: Meta<typeof FormLabel> = {
  title: 'Components/FormLabel',
  component: FormLabel,
  args: { text: 'Employee name' },
};
export default meta;

type Story = StoryObj<typeof FormLabel>;

export const Default: Story = {};
export const Required: Story = { args: { required: true } };
export const Optional: Story = { args: { optional: true } };
