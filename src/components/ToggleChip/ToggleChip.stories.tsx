import type { Meta, StoryObj } from '@storybook/react';
import { FiCoffee } from 'react-icons/fi';
import { ToggleChip } from './ToggleChip';

const meta: Meta<typeof ToggleChip> = {
  title: 'Components/ToggleChip',
  component: ToggleChip,
  args: { icon: FiCoffee, label: 'Lunch', active: false, onClick: () => {} },
};
export default meta;

type Story = StoryObj<typeof ToggleChip>;

export const Off: Story = {};
export const On: Story = { args: { active: true } };
export const ReadOnly: Story = { args: { active: true, onClick: undefined } };
