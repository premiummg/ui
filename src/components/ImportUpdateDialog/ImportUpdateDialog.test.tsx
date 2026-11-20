import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImportUpdateDialog } from './ImportUpdateDialog';

const matched = [
  { key: 'ana@x.com', name: 'Ana', email: 'ana@x.com', diffs: [{ label: 'Phone', from: '1', to: '2' }] },
  { key: 'luis@x.com', name: 'Luis', diffs: [{ label: 'Role', from: 'Worker', to: 'Foreman' }] },
];

describe('ImportUpdateDialog', () => {
  test('lists the changes and hands back the people left unchecked', () => {
    const onConfirm = vi.fn();
    render(<ImportUpdateDialog matched={matched} message="2 to update" onConfirm={onConfirm} onCancel={() => {}} />);
    expect(screen.getByText('Phone:', { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Yes, update them' }));
    expect(onConfirm).toHaveBeenCalledWith(new Set(['luis@x.com']));
  });

  test('with everyone unchecked it continues without updates', () => {
    const onConfirm = vi.fn();
    render(<ImportUpdateDialog matched={matched} message="" onConfirm={onConfirm} onCancel={() => {}} />);
    screen.getAllByRole('checkbox').forEach((c) => fireEvent.click(c));
    fireEvent.click(screen.getByRole('button', { name: "Don't update, continue" }));
    expect(onConfirm.mock.calls[0][0].size).toBe(2);
  });
});
