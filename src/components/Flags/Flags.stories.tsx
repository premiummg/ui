import type { Meta, StoryObj } from '@storybook/react';
import { FlagCanada, FlagAcadian, AcadianStar } from './Flags';

const meta: Meta<typeof FlagCanada> = {
  title: 'Components/Flags',
  component: FlagCanada,
  parameters: {
    docs: {
      description: {
        component:
          'For a real bilingual EN/FR language switcher built on the two flags, see ' +
          '`LanguageToggle`. `AcadianStar` is just the flag\'s own gold star, on its own, for ' +
          'blending into something else - see `Hero`\'s `overlay="acadian"`.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof FlagCanada>;

export const Both: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <FlagCanada className="w-8 h-6 rounded-sm shadow-sm" />
      <FlagAcadian className="w-8 h-6 rounded-sm shadow-sm" />
    </div>
  ),
};

export const Star: Story = {
  render: () => <AcadianStar className="w-16 h-16" />,
};
