import { describe, expect, test, vi } from 'vitest';
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { RowLink } from './RowLink';

describe('RowLink', () => {
  test('renders as a real link, so middle-click/"open in new tab" have an href to act on', () => {
    render(
      <table><tbody><tr><td className="relative"><RowLink href="/employees/e1" label="Open Alex Rivera" /></td></tr></tbody></table>,
    );
    expect(screen.getByRole('link', { name: 'Open Alex Rivera' })).toHaveAttribute('href', '/employees/e1');
  });

  test('a plain left-click calls onNavigate instead of letting the browser reload', () => {
    const onNavigate = vi.fn();
    render(
      <table><tbody><tr><td className="relative"><RowLink href="/employees/e1" label="Open Alex Rivera" onNavigate={onNavigate} /></td></tr></tbody></table>,
    );
    const link = screen.getByRole('link', { name: 'Open Alex Rivera' });
    const event = createEvent.click(link, { button: 0 });
    fireEvent(link, event);
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  test('a ctrl-click is left to the browser (no onNavigate, no preventDefault)', () => {
    const onNavigate = vi.fn();
    render(
      <table><tbody><tr><td className="relative"><RowLink href="/employees/e1" label="Open Alex Rivera" onNavigate={onNavigate} /></td></tr></tbody></table>,
    );
    const link = screen.getByRole('link', { name: 'Open Alex Rivera' });
    const event = createEvent.click(link, { button: 0, ctrlKey: true });
    fireEvent(link, event);
    expect(onNavigate).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  test('without onNavigate, even a plain left-click is left to the browser', () => {
    render(
      <table><tbody><tr><td className="relative"><RowLink href="/employees/e1" label="Open Alex Rivera" /></td></tr></tbody></table>,
    );
    const link = screen.getByRole('link', { name: 'Open Alex Rivera' });
    const event = createEvent.click(link, { button: 0 });
    fireEvent(link, event);
    expect(event.defaultPrevented).toBe(false);
  });

  test('a click that the link handles does not reach the row that holds it, so the page is opened once', () => {
    const onNavigate = vi.fn();
    const onRowClick = vi.fn();
    render(
      <table><tbody><tr onClick={onRowClick}><td className="relative"><RowLink href="/employees/e1" label="Open Alex Rivera" onNavigate={onNavigate} /></td></tr></tbody></table>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Open Alex Rivera' }), { button: 0 });
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  test('a click the link leaves to the browser (ctrl-click) is not swallowed', () => {
    const onRowClick = vi.fn();
    render(
      <table><tbody><tr onClick={onRowClick}><td className="relative"><RowLink href="/employees/e1" label="Open Alex Rivera" onNavigate={vi.fn()} /></td></tr></tbody></table>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Open Alex Rivera' }), { button: 0, ctrlKey: true });
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });
});
