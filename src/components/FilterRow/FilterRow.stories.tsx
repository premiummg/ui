import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FilterRow } from './FilterRow';

const meta: Meta<typeof FilterRow> = {
  title: 'Components/FilterRow',
  component: FilterRow,
  parameters: {
    docs: {
      description: {
        component:
          '`options` takes one of two shapes, picked per call site, never mixed in the same row: ' +
          'plain strings ("admin", "pending") when the value IS the display label - see ' +
          '`PlainStringOptions` below - or `{ value, label }` objects when the label can repeat and ' +
          'only `value` actually identifies the option (division/company/team names can collide ' +
          'across rows) - see `IdKeyedOptions` below. `options` has no useful Controls editor here ' +
          '(it is a union, not a single shape Storybook can render a form for) - copy one of the two ' +
          'stories\' code instead of editing it from the Controls panel.',
      },
    },
  },
  // Turns the raw "options" widget off in Controls - a `string | EntityOption`
  // array has no one shape a generic control can edit meaningfully, and the
  // JSON editor Storybook falls back to is exactly the confusing blob this
  // is meant to replace with the two concrete stories below.
  argTypes: {
    options: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof FilterRow>;

// Plain strings: the value IS the label. Right for role/status/app - a
// fixed, known vocabulary where "admin" reads fine as both the stored value
// and the pill text.
export const PlainStringOptions: Story = {
  render: () => {
    function Demo() {
      const [selected, setSelected] = useState<string[]>(['admin']);
      return (
        <FilterRow
          label="Role"
          options={['admin', 'manager', 'foreman', 'finance']}
          selected={selected}
          onToggle={v => setSelected(s => (s.includes(v) ? s.filter(x => x !== v) : [...s, v]))}
          onClear={() => setSelected([])}
          capitalize
        />
      );
    }
    return <Demo />;
  },
};

// {value, label} objects: for a facet whose display name can repeat across
// rows (two divisions both named "Concrete" in different companies) - only
// `value` (the id) actually identifies which one is selected.
export const IdKeyedOptions: Story = {
  args: {
    label: 'Division',
    options: [{ value: 'd1', label: 'Concrete' }, { value: 'd2', label: 'Aggregates' }],
    selected: ['d1'],
    onToggle: () => {},
    onClear: () => {},
  },
};
