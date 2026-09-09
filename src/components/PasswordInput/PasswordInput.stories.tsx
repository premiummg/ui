import type { Meta, StoryObj } from '@storybook/react';
import { FiLock } from 'react-icons/fi';
import { PasswordInput } from './PasswordInput';

const meta: Meta<typeof PasswordInput> = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  args: { label: 'Password', registration: { name: 'password' } },
};
export default meta;

type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {};
export const WithIcon: Story = { args: { icon: FiLock } };
export const WithError: Story = { args: { error: 'Incorrect password' } };
export const WithHint: Story = { args: { hint: '8 of 12 characters' } };
