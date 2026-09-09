import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TablePlaceholderRow } from './TablePlaceholderRow';

function renderInTable(ui: React.ReactElement) {
  return render(<table><tbody>{ui}</tbody></table>);
}

describe('TablePlaceholderRow', () => {
  test('shows the loading text and a spinning icon while loading', () => {
    const { container } = renderInTable(<TablePlaceholderRow colSpan={4} loading loadingText="Loading employees…" />);
    expect(screen.getByText('Loading employees…')).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveClass('animate-spin');
  });

  test('shows the empty text once not loading', () => {
    renderInTable(<TablePlaceholderRow colSpan={4} emptyText="No employees found" />);
    expect(screen.getByText('No employees found')).toBeInTheDocument();
  });

  test('custom children override the empty text', () => {
    renderInTable(
      <TablePlaceholderRow colSpan={4}>
        <span>Nothing matches these filters</span>
      </TablePlaceholderRow>,
    );
    expect(screen.getByText('Nothing matches these filters')).toBeInTheDocument();
  });

  test('defaults to the md spinner/text size', () => {
    const { container } = renderInTable(<TablePlaceholderRow colSpan={4} loading />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '18');
    expect(container.querySelector('td')).toHaveClass('text-sm');
  });

  test('sm and lg scale the spinner and the text together', () => {
    const { container, rerender } = renderInTable(<TablePlaceholderRow colSpan={4} loading size="sm" />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '14');
    expect(container.querySelector('td')).toHaveClass('text-xs');
    rerender(
      <table>
        <tbody>
          <TablePlaceholderRow colSpan={4} loading size="lg" />
        </tbody>
      </table>,
    );
    expect(container.querySelector('svg')).toHaveAttribute('width', '24');
    expect(container.querySelector('td')).toHaveClass('text-base');
  });
});
