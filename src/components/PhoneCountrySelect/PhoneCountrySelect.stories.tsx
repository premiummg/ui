import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { PhoneCountrySelect } from './PhoneCountrySelect';

// PhoneCountrySelect is a drop-in `countrySelectComponent` for
// react-phone-number-input's <PhoneInput> - it has no dependency on that
// library itself (see its own doc comment), but the only realistic way to
// demo it is inside a real <PhoneInput>, which is what actually supplies its
// `options`/`iconComponent` props. react-phone-number-input is a devDependency
// of this package for that reason alone - not a real dependency of the
// shipped component.
const meta: Meta<typeof PhoneCountrySelect> = {
  title: 'Components/PhoneCountrySelect',
  component: PhoneCountrySelect,
};
export default meta;

type Story = StoryObj<typeof PhoneCountrySelect>;

export const Default: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<string | undefined>('+15065551234');
      return (
        <PhoneInput
          defaultCountry="CA"
          value={value}
          onChange={setValue}
          className="phone-input-field"
          countrySelectComponent={PhoneCountrySelect}
          // Otherwise typing digits that happen to look like a leading
          // country/calling code can silently switch the country - it should
          // only ever change through the dropdown itself. Same setting every
          // real consumer of this component uses.
          countryCallingCodeEditable={false}
        />
      );
    }
    return <Demo />;
  },
};

export const Empty: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<string | undefined>();
      return (
        <PhoneInput
          defaultCountry="CA"
          value={value}
          onChange={setValue}
          className="phone-input-field"
          countrySelectComponent={PhoneCountrySelect}
          countryCallingCodeEditable={false}
        />
      );
    }
    return <Demo />;
  },
};

export const Disabled: Story = {
  render: () => (
    <PhoneInput
      defaultCountry="CA"
      value="+15065551234"
      onChange={() => {}}
      disabled
      className="phone-input-field"
      countrySelectComponent={PhoneCountrySelect}
    />
  ),
};
