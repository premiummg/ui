import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
};
export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: () => {
    function Demo() {
      const [page, setPage] = useState(2);
      return <Pagination page={page} totalPages={5} total={98} limit={20} onPageChange={setPage} />;
    }
    return <Demo />;
  },
};

// Renders NOTHING below - by design, per the component's own doc comment:
// "Hides itself at 1 page unless children is given." A single-page result
// set doesn't need Prev/Next or a range line, so it disappears rather than
// showing a paginator with both arrows permanently disabled.
export const SinglePage: Story = {
  render: () => (
    <div>
      <p className="text-xs text-gray-400 mb-2">Nothing renders below this line:</p>
      <Pagination page={1} totalPages={1} total={8} limit={20} onPageChange={() => {}} />
    </div>
  ),
};

// The one way a single-page result still shows something: pass `children`
// (e.g. an export/download link) and the range line renders just to carry it.
export const SinglePageWithChildren: Story = {
  render: () => (
    <Pagination page={1} totalPages={1} total={8} limit={20} onPageChange={() => {}}>
      <button className="text-(--premium-red) hover:underline font-medium">Export all</button>
    </Pagination>
  ),
};

// With onPageSizeChange passed, a "per page" selector appears next to the
// range line, and the component stays mounted even at a single page so the
// selector is always reachable.
export const WithPageSizeSelector: Story = {
  render: () => {
    function Demo() {
      const [page, setPage] = useState(1);
      const [limit, setLimit] = useState(20);
      const total = 98;
      return (
        <Pagination
          page={page}
          totalPages={Math.max(1, Math.ceil(total / limit))}
          total={total}
          limit={limit}
          onPageChange={setPage}
          onPageSizeChange={(n) => { setLimit(n); setPage(1) }}
        />
      );
    }
    return <Demo />;
  },
};
