import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LanguageToggle, Lang } from './LanguageToggle';

const meta: Meta<typeof LanguageToggle> = {
  title: 'Components/LanguageToggle',
  component: LanguageToggle,
  args: { names: { en: 'English', fr: 'Acadian French' } },
};
export default meta;

type Story = StoryObj<typeof LanguageToggle>;

export const Default: Story = {
  render: (args) => {
    function Demo() {
      const [lang, setLang] = useState<Lang>('en');
      return <LanguageToggle {...args} lang={lang} onChange={setLang} />;
    }
    return <Demo />;
  },
};

export const QuebecFlag: Story = {
  args: { names: { en: 'English', fr: 'Français' }, quebecFlag: true },
  render: (args) => {
    function Demo() {
      const [lang, setLang] = useState<Lang>('fr');
      return <LanguageToggle {...args} lang={lang} onChange={setLang} />;
    }
    return <Demo />;
  },
};
