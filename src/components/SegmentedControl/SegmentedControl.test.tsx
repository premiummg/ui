import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiTruck, FiPackage } from 'react-icons/fi';
import { SegmentedControl } from './SegmentedControl';

const OPTIONS = [
  { value: 'delivery', label: 'Delivery', icon: FiTruck },
  { value: 'pickup', label: 'Pickup', icon: FiPackage },
] as const;

describe('SegmentedControl', () => {
  test('renders every option', () => {
    render(<SegmentedControl options={OPTIONS} value={null} onChange={() => {}} />);
    expect(screen.getByText('Delivery')).toBeInTheDocument();
    expect(screen.getByText('Pickup')).toBeInTheDocument();
  });

  test('marks the selected option aria-pressed and gives it the filled style', () => {
    render(<SegmentedControl options={OPTIONS} value="pickup" onChange={() => {}} />);
    const pickup = screen.getByRole('button', { name: /Pickup/ });
    const delivery = screen.getByRole('button', { name: /Delivery/ });
    expect(pickup).toHaveAttribute('aria-pressed', 'true');
    expect(delivery).toHaveAttribute('aria-pressed', 'false');
    expect(pickup).toHaveStyle({ backgroundColor: 'var(--premium-red)' });
  });

  test('clicking an option calls onChange with its value', async () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={OPTIONS} value={null} onChange={onChange} />);
    await userEvent.click(screen.getByText('Delivery'));
    expect(onChange).toHaveBeenCalledWith('delivery');
  });

  test('value=null selects nothing', () => {
    render(<SegmentedControl options={OPTIONS} value={null} onChange={() => {}} />);
    for (const btn of screen.getAllByRole('button')) {
      expect(btn).toHaveAttribute('aria-pressed', 'false');
    }
  });
});
