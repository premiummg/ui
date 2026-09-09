import type { Meta, StoryObj } from '@storybook/react';
import { DashedAddButton } from './DashedAddButton';

const meta: Meta<typeof DashedAddButton> = {
  title: 'Components/DashedAddButton',
  component: DashedAddButton,
  args: { label: 'Add line item', onClick: () => {} },
};
export default meta;

type Story = StoryObj<typeof DashedAddButton>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
