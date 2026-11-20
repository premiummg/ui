import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChoiceDialog } from './ChoiceDialog';

describe('ChoiceDialog', () => {
  test('offers each answer with its hint and a Cancel', () => {
    const here = vi.fn();
    const all = vi.fn();
    const onClose = vi.fn();
    render(
      <ChoiceDialog
        open
        onClose={onClose}
        title="Delete Ana?"
        message="Choose where."
        error="Could not delete"
        options={[
          { label: 'From this app only', hint: 'Keeps the account', onClick: here },
          { label: 'From all apps', hint: 'Removes the account', onClick: all, tone: 'danger' },
        ]}
      />,
    );
    expect(screen.getByText('Could not delete')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /From this app only/ }));
    expect(here).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /From all apps/ }));
    expect(all).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  test('renders nothing while closed', () => {
    render(<ChoiceDialog open={false} onClose={() => {}} title="x" options={[]} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
