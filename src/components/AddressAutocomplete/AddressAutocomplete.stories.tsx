import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AddressAutocomplete } from './AddressAutocomplete';
import type { AddressSuggestion } from './nominatim';

const meta: Meta<typeof AddressAutocomplete> = {
  title: 'Components/AddressAutocomplete',
  component: AddressAutocomplete,
};
export default meta;

type Story = StoryObj<typeof AddressAutocomplete>;

// Hits the real OpenStreetMap/Nominatim API - same as this component does in
// every real consumer, no mock to keep in sync. countryCodes narrows results
// so a demo typed as "123 Main" comes back with something relevant instead of
// a global grab-bag.
export const Default: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('');
      const [selected, setSelected] = useState<AddressSuggestion | null>(null);
      return (
        <div>
          <AddressAutocomplete
            value={value}
            onChange={setValue}
            onSelect={(s) => { setSelected(s); setValue(s.street ? `${s.street}, ${s.city}` : s.city); }}
            placeholder="Start typing an address…"
            countryCodes="ca"
          />
          {selected && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Picked: {selected.city}, {selected.province} {selected.postalCode}
            </p>
          )}
        </div>
      );
    }
    return <Demo />;
  },
};

export const Disabled: Story = {
  args: { value: '123 Main St', onChange: () => {}, onSelect: () => {}, disabled: true },
};
