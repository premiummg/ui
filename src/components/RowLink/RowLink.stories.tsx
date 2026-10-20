import type { Meta, StoryObj } from '@storybook/react';
import { RowLink } from './RowLink';

const meta: Meta<typeof RowLink> = {
  title: 'Components/RowLink',
  component: RowLink,
  args: { href: '/employees/e1', label: 'Open Alex Rivera', onNavigate: () => {} },
};
export default meta;

type Story = StoryObj<typeof RowLink>;

// The name cell is clickable anywhere in its box (not just the text) via
// the stretched RowLink sitting behind it - middle-click or Ctrl-click
// opens it in a new tab, a plain click calls onNavigate. Pair it with a
// `<tr onClick={...}>` of your own for "click anywhere in the row" on a
// plain left-click, same as this app's tables already do elsewhere -
// RowLink only adds real-link behavior to the one cell it's placed in.
export const PrimaryCellClickable: Story = {
  render: args => (
    <table className="w-full text-sm">
      <tbody>
        <tr className="hover:bg-gray-50">
          <td className="px-4 py-3 relative">
            <RowLink {...args} />
            Alex Rivera
          </td>
          <td className="px-4 py-3">Foreman</td>
          <td className="px-4 py-3 text-right">
            <button type="button" className="px-2 py-1 text-xs rounded border" onClick={() => alert('Message clicked')}>
              Message
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  ),
};
