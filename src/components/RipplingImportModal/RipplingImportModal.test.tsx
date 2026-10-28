import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, Toaster } from '../Toaster';
import { RipplingImportModal, RipplingImportModalLabels } from './RipplingImportModal';
import type { RipplingImportCandidates } from '../RipplingBulk/types';

const labels: RipplingImportModalLabels = {
  heading: 'Import from Rippling',
  body: 'Workers with no account here.',
  loading: 'Loading',
  loadError: 'Could not load',
  retry: 'Try again',
  skippedNote: (c) => (c.knownEmail + c.noEmail > 0 ? `Left out: ${c.knownEmail + c.noEmail}` : ''),
  truncatedNote: (shown, total) => `Showing ${shown} of ${total}`,
  nothingToImport: 'Nothing to import',
  role: 'Role',
  division: 'Division',
  chooseDivision: 'Choose a division',
  manager: 'Manager',
  selectAll: (n) => `Select all (${n})`,
  colWorker: 'Rippling worker',
  colRole: 'Role in Rippling',
  colStart: 'Start',
  statusLabels: { HIRED: 'Hired, not started' },
  inactiveHint: 'Not active',
  create: (n) => `Create ${n}`,
  creating: 'Creating',
  close: 'Close',
  done: 'Done',
  resultCreated: (n) => `${n} created`,
  resultFailed: (n) => `${n} failed`,
  notEligible: 'Not eligible any more',
  createError: 'Could not create',
  tempPasswordsHeading: 'Temporary passwords',
  copyPasswords: 'Copy all',
  copiedPasswords: 'Copied',
};

const DATA: RipplingImportCandidates = {
  candidates: [
    { worker_id: 'w1', name: 'Ana Ruiz', email: 'ana@r.com', title: 'Taper', status: 'ACTIVE', start_date: '2026-01-05' },
    { worker_id: 'w2', name: 'Bruno Diaz', email: 'bruno@r.com', title: null, status: 'HIRED', start_date: null },
  ],
  total_eligible: 2, truncated: 0,
  skipped_no_email: 1, skipped_known_email: 2, skipped_identity_account: 0, skipped_terminated: 0, skipped_likely_match: 0,
};

function renderModal(over: Partial<React.ComponentProps<typeof RipplingImportModal>> = {}) {
  const props = {
    loadCandidates: vi.fn().mockResolvedValue(DATA),
    onApply: vi.fn().mockResolvedValue([{ worker_id: 'w1', name: 'Ana Ruiz', status: 'created', email: 'ana@r.com', temporary_password: 'Abc123xyz9' }]),
    roles: ['admin', 'manager', 'worker'],
    roleLabel: (r: string) => r.toUpperCase(),
    divisions: [{ id: 'd1', name: 'Caulking' }],
    managerOptionalRoles: ['admin'],
    renderManagerField: ({ value, onChange }: { value: string; onChange: (id: string) => void }) => (
      <input aria-label="manager picker" value={value} onChange={(e) => onChange(e.target.value)} />
    ),
    formatDate: (iso: string) => `on ${iso}`,
    onImported: vi.fn(),
    onClose: vi.fn(),
    labels,
    ...over,
  };
  render(<ToastProvider><RipplingImportModal {...props} /><Toaster /></ToastProvider>);
  return props;
}

describe('RipplingImportModal', () => {
  test('active workers start ticked, others not, with the status note and the start date', async () => {
    renderModal();
    expect(await screen.findByText('Ana Ruiz')).toBeInTheDocument();
    expect(screen.getByText('Hired, not started')).toBeInTheDocument();
    expect(screen.getByText('on 2026-01-05')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create 1' })).toBeDisabled();
    expect(screen.getByText('Left out: 3')).toBeInTheDocument();
  });

  test('the role defaults to worker and creating needs a division and a manager for that role', async () => {
    const props = renderModal();
    await screen.findByText('Ana Ruiz');
    expect((screen.getByLabelText(/^Role/) as HTMLSelectElement).value).toBe('worker');

    await userEvent.selectOptions(screen.getByLabelText(/^Division/), 'd1');
    expect(screen.getByRole('button', { name: 'Create 1' })).toBeDisabled();
    await userEvent.type(screen.getByLabelText('manager picker'), 'mgr-1');
    const create = screen.getByRole('button', { name: 'Create 1' });
    expect(create).toBeEnabled();

    await userEvent.click(create);
    await waitFor(() => expect(props.onApply).toHaveBeenCalledWith({ worker_ids: ['w1'], role: 'worker', division_id: 'd1', manager_id: 'mgr-1' }));
    expect(props.onImported).toHaveBeenCalled();
  });

  test('a role that needs no manager can be created without one', async () => {
    renderModal();
    await screen.findByText('Ana Ruiz');
    await userEvent.selectOptions(screen.getByLabelText(/^Role/), 'admin');
    await userEvent.selectOptions(screen.getByLabelText(/^Division/), 'd1');
    expect(screen.getByRole('button', { name: 'Create 1' })).toBeEnabled();
  });

  test('the result lists the temporary passwords and copies them', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    renderModal();
    await screen.findByText('Ana Ruiz');
    await userEvent.selectOptions(screen.getByLabelText(/^Division/), 'd1');
    await userEvent.type(screen.getByLabelText('manager picker'), 'mgr-1');
    await userEvent.click(screen.getByRole('button', { name: 'Create 1' }));
    expect(await screen.findByText('Abc123xyz9')).toBeInTheDocument();
    expect(screen.getByText('1 created')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Copy all' }));
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  test('accounts that were not created are named with the reason', async () => {
    renderModal({
      onApply: vi.fn().mockResolvedValue([
        { worker_id: 'w1', name: 'Ana Ruiz', status: 'failed', message: 'Email already used' },
        { worker_id: 'w2', name: 'Bruno Diaz', status: 'skipped', code: 'not_eligible' },
      ]),
    });
    await screen.findByText('Ana Ruiz');
    await userEvent.click(screen.getAllByRole('checkbox')[2]);
    await userEvent.selectOptions(screen.getByLabelText(/^Division/), 'd1');
    await userEvent.type(screen.getByLabelText('manager picker'), 'm');
    await userEvent.click(screen.getByRole('button', { name: 'Create 2' }));
    expect(await screen.findByText('Email already used')).toBeInTheDocument();
    expect(screen.getByText('Not eligible any more')).toBeInTheDocument();
    expect(screen.getByText('0 created', { exact: false })).toBeInTheDocument();
  });

  test('nothing to import and a failed load', async () => {
    const loadCandidates = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce({ ...DATA, candidates: [] });
    renderModal({ loadCandidates });
    expect(await screen.findByText('Could not load')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Nothing to import')).toBeInTheDocument();
  });
});
