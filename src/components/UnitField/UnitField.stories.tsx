import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { UnitField } from './UnitField';

const meta: Meta<typeof UnitField> = {
  title: 'Components/UnitField',
  component: UnitField,
};
export default meta;

type Story = StoryObj<typeof UnitField>;

// The stored value stays lowercase ("pcs") - `capitalize` only changes the
// display, and defaults on.
export const Default: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('pcs');
      return <UnitField value={value} onChange={setValue} className="input-field" />;
    }
    return <Demo />;
  },
};

export const CustomOptionsList: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('each');
      return <UnitField value={value} onChange={setValue} className="input-field" options={['each', 'dozen', 'gross', 'pallet']} />;
    }
    return <Demo />;
  },
};

export const AlreadyACustomValue: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('shipping containers');
      return <UnitField value={value} onChange={setValue} className="input-field" />;
    }
    return <Demo />;
  },
};

// Opt out for a list of abbreviations ("kg", "ft", "gal") that read oddly
// capitalized ("Kg", "Ft", "Gal") - `capitalize` defaults on, so this is the
// exception, not the common case.
export const Lowercase: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('kg');
      return <UnitField value={value} onChange={setValue} className="input-field" capitalize={false} />;
    }
    return <Demo />;
  },
};
