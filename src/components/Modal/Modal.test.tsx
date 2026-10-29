import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
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

  test('is a named modal dialog', () => {
    render(<Modal onClose={() => {}} title="Delete this?" description="No undo." />);
    const dialog = screen.getByRole('dialog', { name: 'Delete this?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('No undo.');
  });

  test('without a title it takes the ariaLabel', () => {
    render(<Modal onClose={() => {}} ariaLabel="Custom form" />);
    expect(screen.getByRole('dialog', { name: 'Custom form' })).toBeInTheDocument();
  });

  test('focus moves in, wraps with Tab, and returns to the opener on close', async () => {
    function Host() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>open</button>
          {open && <Modal onClose={() => setOpen(false)}><button>first</button><button>last</button></Modal>}
        </>
      );
    }
    render(<Host />);
    const opener = screen.getByRole('button', { name: 'open' });
    await userEvent.click(opener);
    expect(screen.getByRole('dialog')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'last' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(opener).toHaveFocus();
  });

  test('only the top modal answers Escape', async () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(<Modal onClose={outer}>under</Modal>);
    render(<Modal onClose={inner}>over</Modal>);
    await userEvent.keyboard('{Escape}');
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  test('dismissable={false} ignores Escape and the backdrop', async () => {
    const onClose = vi.fn();
    const { container } = render(<Modal onClose={onClose} dismissable={false}>x</Modal>);
    await userEvent.keyboard('{Escape}');
    await userEvent.click(container.firstChild as Element);
    expect(onClose).not.toHaveBeenCalled();
  });

  test('the overlay scrolls, so a modal taller than the screen can still be reached', () => {
    const { container } = render(<Modal onClose={() => {}}>tall</Modal>);
    expect(container.firstChild).toHaveClass('overflow-y-auto');
  });
});
