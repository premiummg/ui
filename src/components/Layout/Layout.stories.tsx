import type { Meta, StoryObj } from '@storybook/react';
import { Layout } from './Layout';

const meta: Meta<typeof Layout> = {
  title: 'Components/Layout',
  component: Layout,
};
export default meta;

type Story = StoryObj<typeof Layout>;

export const WithNavbar: Story = {
  args: {
    navbar: (
      <header className="bg-white dark:bg-(--premium-steel-grey) px-4 py-2.5 border-b border-gray-100 dark:border-white/10">
        <span className="font-heading font-black text-gray-900 dark:text-gray-100">Your app's own navbar goes here</span>
      </header>
    ),
    children: (
      <div className="bg-white dark:bg-(--premium-dark-grey) rounded-2xl border border-gray-100 dark:border-white/10 p-6">
        Page content
      </div>
    ),
  },
};

export const NoNavbar: Story = {
  args: {
    children: (
      <div className="bg-white dark:bg-(--premium-dark-grey) rounded-2xl border border-gray-100 dark:border-white/10 p-6">
        A navbar-less page (e.g. a public design preview)
      </div>
    ),
  },
};
