import type { Meta, StoryObj } from '@storybook/react';
import { StatBand } from './StatBand';

const meta: Meta<typeof StatBand> = {
  title: 'Components/StatBand',
  component: StatBand,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The row of headline figures under a hero, on Premium Black with the industrial hatch. ' +
          'Values are strings ("75+") and never count up. `highlight` turns one amber.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof StatBand>;

export const Default: Story = {
  args: {
    label: 'Premium in numbers',
    items: [
      { value: '75+', label: 'Years of combined expertise' },
      { value: '[00]', label: 'Years in business', highlight: true, note: 'To confirm' },
      { value: '[000]+', label: 'Projects completed', highlight: true, note: 'To confirm' },
      { value: '4', label: 'Certifications and memberships' },
    ],
  },
};
