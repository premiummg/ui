import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Save changes' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'danger', 'onColor'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Cancel' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Delete' } };

// A white pill for app chrome that itself sits on a solid colored field
// (PageHeader's own `actions` slot, see its own IndexPage story) - no fixed
// text color on the variant itself, so it's supplied here via style, the
// same way SiteButton's onRed/onDark do for the marketing-page equivalent.
export const OnColor: Story = {
  render: () => (
    <div className="pmg-field p-6 rounded-xl">
      <Button variant="onColor" style={{ color: 'var(--premium-red-dark)' }}>Add employee</Button>
    </div>
  ),
};
export const Small: Story = { args: { size: 'sm' } };
export const ExtraSmall: Story = { args: { size: 'xs', children: 'Reorder' } };
// Same size SiteButton's own hero CTA ships today, just available on this
// component too.
export const Large: Story = { args: { size: 'lg', children: 'Get an estimate' } };
export const ExtraLarge: Story = { args: { size: 'xl', children: 'Get an estimate' } };
export const Disabled: Story = { args: { disabled: true } };
export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Add employee
    </Button>
  ),
};
