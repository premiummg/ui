import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchInput } from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Components/SearchInput',
  component: SearchInput,
};
export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('');
      return <SearchInput value={value} onChange={setValue} placeholder="Search employees…" />;
    }
    return <Demo />;
  },
};
