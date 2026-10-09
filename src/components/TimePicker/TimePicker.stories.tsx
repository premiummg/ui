import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TimePicker } from './TimePicker';

const meta: Meta<typeof TimePicker> = {
  title: 'Components/TimePicker',
  component: TimePicker,
};
export default meta;

type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('09:00');
      return <TimePicker value={value} onChange={setValue} className="max-w-xs" />;
    }
    return <Demo />;
  },
};

export const Empty: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('');
      return <TimePicker value={value} onChange={setValue} className="max-w-xs" />;
    }
    return <Demo />;
  },
};

// A start/end-time pair is this picker's most common real use - start
// seeding end to the same value (so the worker scrolls forward from there
// instead of back to a generic default) is the consuming app's own choice,
// not something baked into the component, but it's worth showing together
// since it's the shape almost every consumer will actually reach for.
export const StartAndEnd: Story = {
  render: () => {
    function Demo() {
      const [start, setStart] = useState('');
      const [end, setEnd] = useState('');
      return (
        <div className="flex gap-3">
          <TimePicker
            value={start}
            onChange={v => { setStart(v); if (v) setEnd(v); }}
            placeholder="Start time"
            className="max-w-40"
          />
          <TimePicker value={end} onChange={setEnd} placeholder="End time" className="max-w-40" />
        </div>
      );
    }
    return <Demo />;
  },
};

export const Disabled: Story = { args: { value: '09:00', onChange: () => {}, disabled: true, className: 'max-w-xs' } };
