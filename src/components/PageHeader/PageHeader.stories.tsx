import type { Meta, StoryObj } from '@storybook/react';
import { FiPlus } from 'react-icons/fi';
import { PageHeader } from './PageHeader';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: {
    docs: {
      description: {
        component:
          'The red band shell every real page opens with. `title`/`count`/`actions` cover the ' +
          'common index-page row - `children` is an escape hatch for header rows that do not fit ' +
          'that shape (a detail page\'s avatar + status pill).',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof PageHeader>;

// The common case: an index page's title, row count, and a primary action.
export const IndexPage: Story = {
  args: {
    backLabel: 'Dashboard',
    onBack: () => {},
    title: 'Employees',
    count: 15,
    actions: (
      <button
        className="inline-flex items-center gap-2 px-3 h-9 rounded-lg bg-white text-sm font-semibold hover:bg-white/90 transition"
        style={{ color: 'var(--premium-red-dark)' }}
      >
        <FiPlus size={16} /> Add employee
      </button>
    ),
  },
};

export const NoActions: Story = {
  args: { backLabel: 'Dashboard', onBack: () => {}, title: 'Employees', count: 15 },
};

// A detail page: back link to the list it came from, an avatar tile, a
// status pill inverted for contrast on red - doesn't fit title/count/actions,
// so it's composed via `children` instead.
export const DetailPage: Story = {
  render: () => (
    <PageHeader backLabel="Employees" onBack={() => {}} className="py-4">
      <div className="flex flex-wrap items-start gap-3.5 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-white/15 grid place-items-center text-white text-lg font-heading font-bold shrink-0">
          KJ
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="font-heading font-black text-2xl text-white leading-none truncate">Kris Jenkins</h1>
            <span className="inline-block px-2.5 py-1 rounded-full bg-white/20 text-white font-heading font-bold uppercase tracking-wider text-[10px] leading-none">
              Foreman
            </span>
          </div>
          <p className="text-sm text-white/75 truncate">kris.jenkins@premiummg.ca</p>
        </div>
      </div>
    </PageHeader>
  ),
};

// No drill-down to go back to (e.g. a top-level account/profile page) -
// omit `onBack` and the back row disappears entirely.
export const NoBackLink: Story = {
  render: () => (
    <PageHeader className="py-4">
      <div className="flex flex-wrap items-center gap-3.5 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-white/15 grid place-items-center text-white text-lg font-heading font-bold shrink-0">
          KJ
        </div>
        <div className="min-w-0">
          <h1 className="font-heading font-black text-2xl text-white leading-none truncate">Kris Jenkins</h1>
          <p className="text-sm text-white/75 truncate">Foreman</p>
        </div>
      </div>
    </PageHeader>
  ),
};
