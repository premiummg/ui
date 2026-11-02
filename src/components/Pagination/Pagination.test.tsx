import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination, PAGE_SIZE_ALL } from './Pagination';

describe('Pagination', () => {
  test('renders nothing when there is only one page and no children', () => {
    const { container } = render(<Pagination page={1} totalPages={1} total={5} limit={20} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('a single page still renders the range line when children is given', () => {
    render(
      <Pagination page={1} totalPages={1} total={5} limit={20} onPageChange={() => {}}>
        <button>Export all</button>
      </Pagination>,
    );
    expect(screen.getByRole('button', { name: 'Export all' })).toBeInTheDocument();
  });

  test('renders the range and total', () => {
    render(<Pagination page={2} totalPages={3} total={45} limit={20} onPageChange={() => {}} />);
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  test('an empty result set shows "0 of 0", not "1 of 0"', () => {
    render(
      <Pagination page={1} totalPages={1} total={0} limit={20} onPageChange={() => {}}>
        <button>Export</button>
      </Pagination>,
    );
    expect(screen.getAllByText('0')).toHaveLength(3); // from, to, and total all read 0
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  test('Previous is disabled on page 1, Next is disabled on the last page', () => {
    render(<Pagination page={1} totalPages={2} total={30} limit={20} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('Next page')).not.toBeDisabled();
  });

  test('clicking Next calls onPageChange with page + 1', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={2} total={30} limit={20} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByLabelText('Next page'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test('no page-size selector when onPageSizeChange is omitted', () => {
    render(<Pagination page={1} totalPages={2} total={30} limit={20} onPageChange={() => {}} />);
    expect(screen.queryByLabelText('per page')).not.toBeInTheDocument();
  });

  test('page-size selector renders and stays mounted even on a single page', () => {
    render(
      <Pagination page={1} totalPages={1} total={5} limit={20} onPageChange={() => {}} onPageSizeChange={() => {}} />,
    );
    expect(screen.getByLabelText('per page')).toBeInTheDocument();
  });

  test('changing the page-size selector calls onPageSizeChange with the picked value', async () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        page={1}
        totalPages={3}
        total={45}
        limit={20}
        onPageChange={() => {}}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    await userEvent.selectOptions(screen.getByLabelText('per page'), '50');
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  test('the page size that means everything reads as the "All" label, in the selector and in the language given', async () => {
    const onPageSizeChange = vi.fn();
    const { rerender } = render(
      <Pagination page={1} totalPages={1} total={45} limit={20} onPageChange={() => {}} pageSizeOptions={[20, 50, PAGE_SIZE_ALL]} onPageSizeChange={onPageSizeChange} />,
    );
    expect(screen.getByRole('option', { name: 'All' })).toHaveValue(String(PAGE_SIZE_ALL));
    await userEvent.selectOptions(screen.getByLabelText('per page'), String(PAGE_SIZE_ALL));
    expect(onPageSizeChange).toHaveBeenCalledWith(PAGE_SIZE_ALL);

    rerender(
      <Pagination page={1} totalPages={1} total={45} limit={PAGE_SIZE_ALL} onPageChange={() => {}} pageSizeOptions={[20, PAGE_SIZE_ALL]} onPageSizeChange={onPageSizeChange} allLabel="Tout" />,
    );
    expect(screen.getByRole('option', { name: 'Tout' })).toBeInTheDocument();
    // Everything on one page: the range ends at the total, not at the size of the page.
    expect(screen.getAllByText('45')).toHaveLength(2);
  });

  test('the selector always ends with All, even when the sizes given do not include it', () => {
    render(<Pagination page={1} totalPages={3} total={120} limit={20} onPageChange={() => {}} pageSizeOptions={[20, 50]} onPageSizeChange={() => {}} />);
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['20', '50', 'All']);
  });

  test('and so does the usual set of sizes', () => {
    render(<Pagination page={1} totalPages={3} total={120} limit={20} onPageChange={() => {}} onPageSizeChange={() => {}} />);
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['20', '50', '100', 'All']);
  });

  test('without a size handler there is no selector at all', () => {
    render(<Pagination page={1} totalPages={3} total={120} limit={20} onPageChange={() => {}} />);
    expect(screen.queryByLabelText('per page')).toBeNull();
  });
});
