import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DarkModeToggle } from './DarkModeToggle';

const meta: Meta<typeof DarkModeToggle> = {
  title: 'Components/DarkModeToggle',
  component: DarkModeToggle,
};
export default meta;

type Story = StoryObj<typeof DarkModeToggle>;

export const Default: Story = {
  render: () => {
    function Demo() {
      const [isDark, setIsDark] = useState(false);
      return <DarkModeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} />;
    }
    return <Demo />;
  },
};
