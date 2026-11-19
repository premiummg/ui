import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { FiTrash2 } from 'react-icons/fi';
import { ImportResultsCard, BulkResultsCard } from './index';
import { BulkActionBar } from '../BulkActionBar';
import { UiLangProvider } from '../../lib/i18n';

describe('ImportResultsCard', () => {
  test('summarises, lists each line with its reason, and dismisses', async () => {
    const onDismiss = vi.fn();
    render(
      <ImportResultsCard
        results={[{ name: 'Tape', status: 'ok' }, { name: 'Mud', status: 'error', message: 'Duplicate name' }]}
        summary={(ok, failed) => `${ok} created, ${failed} failed`}
        onDismiss={onDismiss}
      />,
    );
    expect(screen.getByText('1 created, 1 failed')).toBeTruthy();
    expect(screen.getByText('Done')).toBeTruthy();
    expect(screen.getByText('Failed')).toBeTruthy();
    expect(screen.getByText('(Duplicate name)')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalled();
  });

  test('speaks French, and its labels still override', () => {
    render(
      <UiLangProvider lang="fr">
        <ImportResultsCard results={[{ name: 'A', status: 'ok' }]} summary={() => 's'} onDismiss={() => {}} failedLabel="Non" />
      </UiLangProvider>,
    );
    expect(screen.getByText('Terminé')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeTruthy();
  });
});

describe('BulkResultsCard', () => {
  test('names each id through labelFor', () => {
    render(<BulkResultsCard results={[{ id: '1', status: 'error', message: 'In use' }]} labelFor={id => `Vendor ${id}`} summary={() => 'x'} onDismiss={() => {}} />);
    expect(screen.getByText('Vendor 1')).toBeTruthy();
    expect(screen.getByText('(In use)')).toBeTruthy();
  });
});

describe('BulkActionBar', () => {
  const base = { countLabel: (n: number) => `${n} selected`, emptyPrompt: 'Pick who to delete', onCancel: () => {}, cancelLabel: 'Cancel', actionLabel: 'Delete', actionIcon: FiTrash2 };

  test('asks to pick until something is ticked, and the action stays off', () => {
    render(<BulkActionBar {...base} count={0} onAction={() => {}} />);
    expect(screen.getByText('Pick who to delete')).toBeTruthy();
    expect((screen.getByRole('button', { name: /Delete/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  test('shows the count, offers select all, and runs the action', async () => {
    const onAction = vi.fn();
    const onSelectAll = vi.fn();
    render(<BulkActionBar {...base} count={2} onAction={onAction} onSelectAll={onSelectAll} selectAllLabel={n => `Select all ${n}`} selectableCount={5} danger />);
    expect(screen.getByText('2 selected')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Select all 5' }));
    expect(onSelectAll).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }));
    expect(onAction).toHaveBeenCalled();
  });
});
