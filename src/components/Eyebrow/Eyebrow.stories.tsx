import type { Meta, StoryObj } from '@storybook/react';
import { Eyebrow } from './Eyebrow';

const meta: Meta<typeof Eyebrow> = {
  title: 'Components/Eyebrow',
  component: Eyebrow,
  args: { text: 'Our approach' },
};
export default meta;

type Story = StoryObj<typeof Eyebrow>;

// Each tone is shown in the surface it's actually meant for - not just the
// bare label - so the tone reads as a deliberate choice for that surface
// rather than three colors of the exact same thing. All three pair the
// eyebrow with the headline it sits above in every real use (Hero,
// PageHeader, SectionHead, ColorField's own CTA): the eyebrow is a
// secondary label, not something read on its own.

// red: "a plain light/dark surface" - the default, no colored backing needed.
export const Red: Story = {
  render: () => (
    <div className="w-full p-6 bg-white dark:bg-(--premium-dark-grey)">
      <Eyebrow text="Our approach" tone="red" />
      <h2 className="font-heading font-black text-2xl text-gray-900 dark:text-gray-100 mt-1">Built on trust</h2>
    </div>
  ),
};

// white: sitting on a dark/solid-color field. Deliberately text-white/60,
// not full white - alone, that reads as "faded" rather than intentional;
// paired with the bold white headline it actually sits above, the dimmer
// eyebrow is what gives the headline somewhere to step up FROM.
export const White: Story = {
  render: () => (
    <div className="w-full p-6 bg-(--premium-black)">
      <Eyebrow text="Our approach" tone="white" />
      <h2 className="font-heading font-black text-2xl text-white mt-1">Built on trust</h2>
    </div>
  ),
};

// amber: for a callout - the same hi-vis "attention, not alarm" amber used
// elsewhere in the system (StatusDot, the .pmg-stripe nav bar), never the
// destructive/error red.
export const Amber: Story = {
  render: () => (
    <div className="w-full p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60">
      <Eyebrow text="Limited spots" tone="amber" />
      <h2 className="font-heading font-black text-2xl text-gray-900 dark:text-gray-100 mt-1">Enrollment closes soon</h2>
    </div>
  ),
};
