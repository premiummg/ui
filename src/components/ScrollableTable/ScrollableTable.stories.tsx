import type { Meta, StoryObj } from '@storybook/react';
import { ScrollableTable } from './ScrollableTable';

const meta: Meta<typeof ScrollableTable> = {
  title: 'Components/ScrollableTable',
  component: ScrollableTable,
};
export default meta;

type Story = StoryObj<typeof ScrollableTable>;

export const Default: Story = {
  args: {
    maxHeight: '200px',
    children: (
      <table>
        <tbody>
          {Array.from({ length: 20 }, (_, i) => (
            <tr key={i}><td className="px-4 py-2 whitespace-nowrap">Row {i + 1} - a fairly wide cell of content</td></tr>
          ))}
        </tbody>
      </table>
    ),
  },
};
