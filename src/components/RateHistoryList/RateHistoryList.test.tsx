import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RateHistoryList } from './RateHistoryList';
import { MoneyInput } from './MoneyInput';

const base = { title: 'Hourly rate history', emptyText: 'No hourly rate yet', onRemove: () => {} };

describe('RateHistoryList', () => {
  test('lists each rate with its start and removes one', () => {
    const onRemove = vi.fn();
    const rates = [{ id: 1, rate: 25, effective_from: '1900-01-01' }, { id: 2, rate: '27.5', effective_from: '2026-03-01' }];
    render(<RateHistoryList {...base} rates={rates} onRemove={onRemove} />);
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    expect(screen.getByText('· since the beginning')).toBeInTheDocument();
    expect(screen.getByText('$27.50')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove this rate' })[1]);
    expect(onRemove).toHaveBeenCalledWith(rates[1]);
  });

  test('the sole rate since the beginning is kept unless asked otherwise', () => {
    const rates = [{ id: 1, rate: 25, effective_from: '1900-01-01' }];
    const { rerender } = render(<RateHistoryList {...base} rates={rates} />);
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<RateHistoryList {...base} rates={rates} keepSoleBeginning={false} />);
    expect(screen.getByRole('button', { name: 'Remove this rate' })).toBeInTheDocument();
  });

  test('says when it is loading, failed or empty', () => {
    const { rerender } = render(<RateHistoryList {...base} rates={[]} loading />);
    expect(screen.getByText('Loading the rates…')).toBeInTheDocument();
    rerender(<RateHistoryList {...base} rates={[]} failed />);
    expect(screen.getByText(/Could not load the rates/)).toBeInTheDocument();
    rerender(<RateHistoryList {...base} rates={[]} />);
    expect(screen.getByText('No hourly rate yet')).toBeInTheDocument();
  });
});

describe('MoneyInput', () => {
  test('is a two-decimal number field with a dollar sign', () => {
    render(<MoneyInput aria-label="Rate" />);
    const input = screen.getByLabelText('Rate');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('step', '0.01');
    expect(screen.getByText('$')).toBeInTheDocument();
  });
});
