import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
};
export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('2026-03-15');
      return <DatePicker value={value} onChange={setValue} className="max-w-xs" />;
    }
    return <Demo />;
  },
};

export const WithUnavailableDates: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('');
      return (
        <DatePicker
          value={value}
          onChange={setValue}
          className="max-w-xs"
          unavailableDates={['2026-03-10', '2026-03-11', '2026-03-20']}
        />
      );
    }
    return <Demo />;
  },
};

export const Disabled: Story = { args: { value: '2026-03-15', onChange: () => {}, disabled: true, className: 'max-w-xs' } };
