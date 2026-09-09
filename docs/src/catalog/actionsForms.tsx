import type { ComponentDoc } from '../components/doc/ComponentBlock';
import { demosFromModule } from '../lib/renderStory';

import * as ButtonStories from '../../../src/components/Button/Button.stories';
import * as FormLabelStories from '../../../src/components/FormLabel/FormLabel.stories';
import * as FieldErrorStories from '../../../src/components/FieldError/FieldError.stories';
import * as FieldGroupStories from '../../../src/components/FieldGroup/FieldGroup.stories';
import * as SearchInputStories from '../../../src/components/SearchInput/SearchInput.stories';
import * as PasswordInputStories from '../../../src/components/PasswordInput/PasswordInput.stories';
import * as UnitFieldStories from '../../../src/components/UnitField/UnitField.stories';
import * as DashedAddButtonStories from '../../../src/components/DashedAddButton/DashedAddButton.stories';
import * as SegmentedControlStories from '../../../src/components/SegmentedControl/SegmentedControl.stories';
import * as ColorFieldStories from '../../../src/components/ColorField/ColorField.stories';
import * as DatePickerStories from '../../../src/components/DatePicker/DatePicker.stories';

export const actionsForms: ComponentDoc[] = [
  {
    name: 'Button',
    summary: 'variant: primary (MAIN red) / secondary (neutral outline) / danger (an alias of primary - the brand book uses the same red for both, so there is no second red for destructive actions) / onColor (white pill for app chrome that itself sits on a solid colored field, e.g. PageHeader’s own actions slot - no fixed text color, supplied via style since the field it sits on isn’t always the same color).',
    notes: 'size runs xs through xl - xs is the exact compact padding used app-wide for an inline action beside other chips in a table row, lg matches SiteButton’s own hero-CTA size, xl is one step extrapolated (no real spot for it exists yet). Takes children, not text, unlike Alert/FormLabel - a button routinely needs an icon next to a label, so it keeps the same composition slot every native <button> gets. type defaults to "button", not the HTML "submit", so one dropped into a <form> never submits it by accident.',
    demos: demosFromModule(ButtonStories),
  },
  {
    name: 'FormLabel',
    summary: 'text, not children - always the field’s own name, never a composition slot. required adds a red asterisk, optional adds a "(optional)" hint.',
    demos: demosFromModule(FormLabelStories),
  },
  {
    name: 'FieldError',
    summary: 'Validation text under a field. Renders nothing at all without a message, so it’s always safe to mount unconditionally.',
    demos: demosFromModule(FieldErrorStories),
  },
  {
    name: 'FieldGroup',
    summary: 'The .pmg-bracket section heading + a Card panel underneath, with an optional footnote row.',
    demos: demosFromModule(FieldGroupStories),
  },
  {
    name: 'SearchInput',
    summary: 'Debounced text input with a clear button, .input-field styling.',
    demos: demosFromModule(SearchInputStories),
  },
  {
    name: 'PasswordInput',
    summary: 'Show/hide toggle built in. Spread a form library’s register() result via the registration prop.',
    demos: demosFromModule(PasswordInputStories),
  },
  {
    name: 'UnitField',
    summary: 'A <select> that also accepts a value outside its own list - picking "Other…" swaps in a plain text input, with a "back to list" undo.',
    notes: 'options defaults to a common physical-units list but takes any string list. capitalize (on by default) title-cases every option and the typed-custom value without changing what’s actually stored - turn it off for a list of abbreviations (kg, ft, gal) that read oddly title-cased.',
    demos: demosFromModule(UnitFieldStories),
  },
  {
    name: 'DashedAddButton',
    summary: 'Full-width dashed "add" affordance, for line items and similar repeating rows.',
    demos: demosFromModule(DashedAddButtonStories),
  },
  {
    name: 'SegmentedControl',
    summary: 'A row of 2-3 mutually-exclusive choices where picking one changes what else the form needs (e.g. Delivery vs. Pickup deciding whether an address field appears) - worth reading at a glance rather than as two checkboxes that were really one choice.',
    notes: 'Generic over its own option type, icons optional per option.',
    demos: demosFromModule(SegmentedControlStories),
  },
  {
    name: 'ColorField',
    summary: 'A bold solid-color field with the brand’s 45deg diagonal bars running through it - "solid blocks of color that command attention" (brand book, pg. 16).',
    notes: 'color defaults to Premium’s own secondary red, but takes any CSS color: the device (field + bars) is what’s brand-specific, not the color itself, so a sister brand gets the same component with its own color rather than a second one. barsColor overrides the bars independently of the field - the brand book’s own semi-transparent white reads fine on a dark saturated color but not on every color, so a paler or differently-toned field can give the bars their own color instead.',
    demos: demosFromModule(ColorFieldStories),
  },
  {
    name: 'DatePicker',
    summary: 'Day/month/year calendar dropdown, built on date-fns. minDate/maxDate, plus unavailableDates shown struck-through and unselectable.',
    demos: demosFromModule(DatePickerStories),
  },
];
