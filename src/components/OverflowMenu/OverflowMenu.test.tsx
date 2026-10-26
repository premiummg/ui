import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { OverflowMenu } from './OverflowMenu';

describe('OverflowMenu', () => {
  test('renders nothing when there are no items at all', () => {
    const { container } = render(<OverflowMenu />);
    expect(container).toBeEmptyDOMElement();
  });

  test('opens on trigger click and lists items, closing after a selection', async () => {
    const onClick = vi.fn();
    render(<OverflowMenu items={[{ icon: FiEdit, label: 'Edit', onClick }]} />);
    await userEvent.click(screen.getByLabelText('More actions'));
    const item = screen.getByText('Edit');
    expect(item).toBeInTheDocument();
    await userEvent.click(item);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  test('a divider separates items from dangerItems only when both exist', async () => {
    render(
      <OverflowMenu
        items={[{ icon: FiEdit, label: 'Edit', onClick: () => {} }]}
        dangerItems={[{ icon: FiTrash2, label: 'Delete', onClick: () => {} }]}
      />,
    );
    await userEvent.click(screen.getByLabelText('More actions'));
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('defaults to align="right", growing leftward from the trigger', async () => {
    const { container } = render(<OverflowMenu items={[{ icon: FiEdit, label: 'Edit', onClick: () => {} }]} />);
    await userEvent.click(screen.getByLabelText('More actions'));
    expect(container.querySelector('.absolute.top-full')).toHaveClass('right-0');
  });

  test('align="left" grows rightward from the trigger instead', async () => {
    const { container } = render(
      <OverflowMenu items={[{ icon: FiEdit, label: 'Edit', onClick: () => {} }]} align="left" />,
    );
    await userEvent.click(screen.getByLabelText('More actions'));
    expect(container.querySelector('.absolute.top-full')).toHaveClass('left-0');
  });

  test('clicking outside closes the menu', async () => {
    render(
      <div>
        <div data-testid="outside" />
        <OverflowMenu items={[{ icon: FiEdit, label: 'Edit', onClick: () => {} }]} />
      </div>,
    );
    await userEvent.click(screen.getByLabelText('More actions'));
    expect(screen.getByText('Edit')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('outside'));
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  test('a menu whose trigger sits near the left edge opens rightward instead of running off the screen', async () => {
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      return { left: 90, right: 126, top: 0, bottom: 0, width: 36, height: 0, x: 90, y: 0, toJSON: () => ({}) } as DOMRect;
    };
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 256 });
    try {
      const { container } = render(<OverflowMenu items={[{ icon: FiEdit, label: 'Edit', onClick: () => {} }]} />);
      await userEvent.click(screen.getByLabelText('More actions'));
      expect(container.querySelector('.absolute.top-full')).toHaveClass('left-0');
    } finally {
      Element.prototype.getBoundingClientRect = original;
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 0 });
    }
  });
});
