import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiCoffee } from 'react-icons/fi';
import { ToggleChip } from './ToggleChip';

describe('ToggleChip', () => {
  test('a switch reports its state and fires onClick', async () => {
    const onClick = vi.fn();
    render(<ToggleChip icon={FiCoffee} label="Lunch" active={false} onClick={onClick} />);
    const chip = screen.getByRole('button', { name: /Lunch/ });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('active is filled with the brand red', () => {
    render(<ToggleChip icon={FiCoffee} label="Lunch" active onClick={() => {}} />);
    const chip = screen.getByRole('button', { name: /Lunch/ });
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(chip.style.backgroundColor).toBe('var(--premium-red)');
  });

  test('without onClick it is a read only indicator that cannot be focused', () => {
    render(<ToggleChip icon={FiCoffee} label="Piece work" active />);
    const chip = screen.getByRole('button', { name: /Piece work/ });
    expect(chip).toHaveAttribute('aria-disabled', 'true');
    expect(chip).toHaveAttribute('tabindex', '-1');
  });

  test('children render next to the label', () => {
    render(<ToggleChip icon={FiCoffee} label="Lunch" active onClick={() => {}}><span>-0:30</span></ToggleChip>);
    expect(screen.getByText('-0:30')).toBeInTheDocument();
  });
});
