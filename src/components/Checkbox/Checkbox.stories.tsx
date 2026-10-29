import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = { title: 'Components/Checkbox', component: Checkbox };
export default meta;

export const Default: StoryObj<typeof Checkbox> = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Checkbox checked={checked} onChange={setChecked} label="Open in a new tab" />;
  },
};
