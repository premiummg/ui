import type { Meta, StoryObj } from '@storybook/react';
import { FiEdit, FiCopy, FiTrash2 } from 'react-icons/fi';
import { OverflowMenu } from './OverflowMenu';

const meta: Meta<typeof OverflowMenu> = {
  title: 'Components/OverflowMenu',
  component: OverflowMenu,
  parameters: {
    docs: {
      description: {
        component:
          '`align` picks which edge the menu hangs from (same contract as `WeekNav`\'s own ' +
          '`align`) - `"right"` (default) grows leftward from the trigger\'s right edge, right for ' +
          'a trigger toward the right of its row; `"left"` grows rightward instead, for a trigger ' +
          'near the left edge of its own container, which `"right"` would push off-screen.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof OverflowMenu>;

const ITEMS = {
  items: [
    { icon: FiEdit, label: 'Edit', onClick: () => {} },
    { icon: FiCopy, label: 'Duplicate', hint: 'Creates a copy with the same fields.', onClick: () => {} },
  ],
  dangerItems: [{ icon: FiTrash2, label: 'Delete', onClick: () => {} }],
};

// The common placement: trigger toward the right of its own row (the last
// of several toolbar icons), so the default `align="right"` has room to its
// left to grow into.
export const Default: Story = {
  args: { ...ITEMS },
  decorators: [Story => <div className="flex justify-end p-4"><Story /></div>],
};

// A trigger near the LEFT edge of its container instead - `align="right"`
// here would push the menu off-screen to the left (exactly what showed up
// as "broken" when this story had no room on the left at all); `align="left"`
// grows rightward from the trigger instead.
export const AlignLeft: Story = {
  args: { ...ITEMS, align: 'left' },
  decorators: [Story => <div className="p-4"><Story /></div>],
};

export const OnDark: Story = {
  args: { ...ITEMS, onDark: true },
  decorators: [Story => <div className="p-6 bg-(--premium-red) inline-block"><Story /></div>],
};
