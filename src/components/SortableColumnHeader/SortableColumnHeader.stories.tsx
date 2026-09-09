import type { Meta, StoryObj } from '@storybook/react';
import { SortableColumnHeader } from './SortableColumnHeader';

const meta: Meta<typeof SortableColumnHeader> = {
  title: 'Components/SortableColumnHeader',
  component: SortableColumnHeader,
  decorators: [Story => <table><thead><tr><Story /></tr></thead></table>],
  args: { col: 'name', label: 'Name', sortBy: 'name', sortDir: 'asc', onSort: () => {} },
};
export default meta;

type Story = StoryObj<typeof SortableColumnHeader>;

export const Active: Story = {};
export const Inactive: Story = { args: { sortBy: 'date' } };
