import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FiGrid } from 'react-icons/fi';
import { Layout } from './Layout';
import { Navbar } from '../Navbar';
import { DarkModeToggle } from '../DarkModeToggle';

const meta: Meta<typeof Layout> = {
  title: 'Components/Layout',
  component: Layout,
};
export default meta;

type Story = StoryObj<typeof Layout>;

// The real Navbar this package ships, not a placeholder <header> - Layout's
// whole reason for taking `navbar` as a prop instead of owning one is this
// exact composition (Navbar + DarkModeToggle, from this same package).
function ExampleNavbar() {
  const [isDark, setIsDark] = useState(false);
  return (
    <Navbar tone="black">
      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition">
        <FiGrid size={14} /> Dashboard
      </button>
      <DarkModeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} className="text-white/60! hover:text-white! hover:bg-white/10!" />
    </Navbar>
  );
}

export const WithNavbar: Story = {
  render: () => (
    <Layout navbar={<ExampleNavbar />}>
      <div className="bg-white dark:bg-(--premium-dark-grey) rounded-2xl border border-gray-100 dark:border-white/10 p-6">
        Page content
      </div>
    </Layout>
  ),
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
