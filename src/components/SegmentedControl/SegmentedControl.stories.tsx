import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FiTruck, FiPackage } from 'react-icons/fi';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
};
export default meta;

type Story = StoryObj<typeof SegmentedControl>;

// The exact real usage this was lifted from: a purchase order's fulfillment
// method, where the choice decides whether a delivery-address field appears
// below it.
export const FulfillmentMethod: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<'delivery' | 'pickup' | null>(null);
      return (
        <SegmentedControl
          options={[
            { value: 'delivery', label: 'Delivery', icon: FiTruck },
            { value: 'pickup', label: 'Pickup', icon: FiPackage },
          ]}
          value={value}
          onChange={setValue}
        />
      );
    }
    return <Demo />;
  },
};

export const NoIcons: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<'weekly' | 'biweekly' | 'monthly' | null>('weekly');
      return (
        <SegmentedControl
          options={[
            { value: 'weekly', label: 'Weekly' },
            { value: 'biweekly', label: 'Biweekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
          value={value}
          onChange={setValue}
        />
      );
    }
    return <Demo />;
  },
};
