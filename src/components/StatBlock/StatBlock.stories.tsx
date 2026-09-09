import type { Meta, StoryObj } from '@storybook/react';
import { StatBlock } from './StatBlock';

const meta: Meta<typeof StatBlock> = {
  title: 'Components/StatBlock',
  component: StatBlock,
  parameters: {
    docs: {
      description: {
        component:
          'One big centered figure with a short label - a headline number a marketing page leads ' +
          'with. Not the dashboard `StatCard` (left-accented, left-aligned, meant for a data ' +
          'table\'s summary row).',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof StatBlock>;

export const Row: Story = {
  render: () => (
    <div className="grid sm:grid-cols-3 gap-5" style={{ maxWidth: 480, background: '#F2F2F2', padding: 24 }}>
      <StatBlock value="56%" label="Openness to new ideas" />
      <StatBlock value="43%" label="Confidence under pressure" />
      <StatBlock value="61%" label="Discipline and focus" />
    </div>
  ),
};

// Otoshi's navy, the same sister-brand color ColorField/PortraitFigure use
// in their own CustomColor stories - a color plainly different from the
// default red, not a slightly darker shade of it.
export const CustomColor: Story = {
  render: () => (
    <div style={{ maxWidth: 200, background: '#F2F2F2', padding: 24 }}>
      <StatBlock value="56%" label="Openness to new ideas" color="#1A2C6E" />
    </div>
  ),
};
