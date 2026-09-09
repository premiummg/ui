import type { Meta, StoryObj } from '@storybook/react';
import { Reveal } from './Reveal';

const meta: Meta<typeof Reveal> = {
  title: 'Components/Reveal',
  component: Reveal,
  parameters: {
    docs: {
      description: {
        component:
          'Fades content in the first time it scrolls into view. Storybook renders it already ' +
          'in the viewport, so this story shows the settled (revealed) state - scroll it out of ' +
          'view and back into a real page to see the transition itself.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Reveal>;

export const Default: Story = {
  args: {
    children: (
      <div className="p-6 rounded-2xl bg-white dark:bg-(--premium-dark-grey) border border-gray-100 dark:border-white/10 max-w-sm">
        <p className="font-heading font-bold text-gray-900 dark:text-gray-100">Revealed content</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fades and lifts in once, the first time this scrolls into view.</p>
      </div>
    ),
  },
};

export const Staggered: Story = {
  render: () => (
    <div className="space-y-3">
      {[0, 150, 300].map(delay => (
        <Reveal key={delay} delay={delay} className="block">
          <div className="p-4 rounded-xl bg-white dark:bg-(--premium-dark-grey) border border-gray-100 dark:border-white/10 max-w-sm">
            delay={delay}ms
          </div>
        </Reveal>
      ))}
    </div>
  ),
};
