import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  test('renders children', () => {
    render(<Modal onClose={() => {}}>content</Modal>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  test('clicking the backdrop calls onClose', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal onClose={onClose}>
        <div data-testid="panel">content</div>
      </Modal>,
    );
    await userEvent.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalled();
  });

  test('clicking inside the panel does not call onClose', async () => {
    const onClose = vi.fn();
    render(<Modal onClose={onClose}>content</Modal>);
    await userEvent.click(screen.getByText('content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  test('a text selection dragged from the panel out past the backdrop does not call onClose', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal onClose={onClose}>
        <div data-testid="panel">selectable content</div>
      </Modal>,
    );
    const overlay = container.firstChild as Element;
    const panel = screen.getByTestId('panel');
    fireEvent.mouseDown(panel);
    fireEvent.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });

  test('pressing Escape calls onClose', async () => {
    const onClose = vi.fn();
    render(<Modal onClose={onClose}>content</Modal>);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  test('renders title and description, and still renders children under them', () => {
    render(
      <Modal onClose={() => {}} title="Delete this employee?" description="This cannot be undone.">
        <button>Delete</button>
      </Modal>,
    );
    expect(screen.getByText('Delete this employee?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  test('title alone (no description) gets the looser bottom margin', () => {
    render(<Modal onClose={() => {}} title="Manage Companies" />);
    expect(screen.getByText('Manage Companies').className).toContain('mb-4');
  });

  test('title with a description gets the tighter bottom margin', () => {
    render(<Modal onClose={() => {}} title="Delete this?" description="No undo." />);
    expect(screen.getByText('Delete this?').className).toContain('mb-1');
  });
});
