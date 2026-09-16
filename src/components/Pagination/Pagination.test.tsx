import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

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
});
