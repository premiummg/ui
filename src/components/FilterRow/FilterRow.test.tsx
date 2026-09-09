import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterRow } from './FilterRow';

describe('FilterRow', () => {
  test('renders nothing when options is empty', () => {
    const { container } = render(
      <FilterRow label="Status" options={[]} selected={[]} onToggle={() => {}} onClear={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('renders a pill per plain-string option', () => {
    render(
      <FilterRow label="Role" options={['admin', 'manager']} selected={['admin']} onToggle={() => {}} onClear={() => {}} />,
    );
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('manager')).toBeInTheDocument();
  });

  test('accepts {value,label} pairs and toggles by value', async () => {
    const onToggle = vi.fn();
    render(
      <FilterRow
        label="Division"
        options={[{ value: 'd1', label: 'Concrete' }]}
        selected={[]}
        onToggle={onToggle}
        onClear={() => {}}
      />,
    );
    await userEvent.click(screen.getByText('Concrete'));
    expect(onToggle).toHaveBeenCalledWith('d1');
  });

  test('Clear only appears once something is selected, and calls onClear', async () => {
    const onClear = vi.fn();
    const { rerender } = render(
      <FilterRow label="Role" options={['admin']} selected={[]} onToggle={() => {}} onClear={onClear} />,
    );
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    rerender(<FilterRow label="Role" options={['admin']} selected={['admin']} onToggle={() => {}} onClear={onClear} />);
    await userEvent.click(screen.getByText('Clear'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
