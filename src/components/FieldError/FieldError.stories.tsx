import type { Meta, StoryObj } from '@storybook/react';
import { FieldError } from './FieldError';

const meta: Meta<typeof FieldError> = {
  title: 'Components/FieldError',
  component: FieldError,
};
export default meta;

type Story = StoryObj<typeof FieldError>;

export const Default: Story = { args: { message: 'This field is required.' } };
export const Empty: Story = { args: { message: undefined } };
