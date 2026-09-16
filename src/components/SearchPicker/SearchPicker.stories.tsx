import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchPicker, PickerItem } from './SearchPicker';

const meta: Meta<typeof SearchPicker> = {
  title: 'Components/SearchPicker',
  component: SearchPicker,
  args: {
    placeholder: 'Search employees…',
    groups: [
      {
        label: 'Foremen',
        items: [
          { id: '1', label: 'Michael Stafford', sub: 'Drywall' },
          { id: '2', label: 'Rodrigo Bustos', sub: 'Drywall' },
        ],
      },
      {
        label: 'Workers',
        items: [
          { id: '3', label: 'Dev Worker', sub: 'Drywall' },
          { id: '4', label: 'Dev Worker 2', sub: 'Drywall' },
        ],
      },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof SearchPicker>;

export const Default: Story = {
  render: args => {
    function Demo() {
      const [value, setValue] = useState<PickerItem | null>(null);
      return <div className="max-w-sm"><SearchPicker {...args} value={value} onChange={setValue} /></div>;
    }
    return <Demo />;
  },
};
