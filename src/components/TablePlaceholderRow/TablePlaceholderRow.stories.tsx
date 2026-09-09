import type { Meta, StoryObj } from '@storybook/react';
import { TablePlaceholderRow } from './TablePlaceholderRow';

const meta: Meta<typeof TablePlaceholderRow> = {
  title: 'Components/TablePlaceholderRow',
  component: TablePlaceholderRow,
  decorators: [Story => <table><tbody><Story /></tbody></table>],
  args: { colSpan: 4 },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof TablePlaceholderRow>;

export const Empty: Story = {};
export const Loading: Story = { args: { loading: true } };
export const LoadingSmall: Story = { args: { loading: true, size: 'sm' } };
// No real spot in the app uses this size yet - see the component's own
// comment on `SIZE.lg`.
export const LoadingLarge: Story = { args: { loading: true, size: 'lg' } };
