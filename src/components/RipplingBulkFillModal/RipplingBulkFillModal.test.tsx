import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, Toaster } from '../Toaster';
import { RipplingBulkFillModal, RipplingBulkFillModalLabels } from './RipplingBulkFillModal';
import type { RipplingBulkFillPreview } from '../RipplingBulk/types';

const labels: RipplingBulkFillModalLabels = {
  heading: 'Fill from Rippling',
  body: 'Everyone linked at once.',
  loading: 'Checking',
  loadError: 'Could not load',
  retry: 'Try again',
  failedNote: (n) => `${n} could not be read`,
  truncatedNote: (shown, total) => `Showing ${shown} of ${total}`,
  nothingMissing: 'Nothing to fill',
  selectAll: (n) => `Select all (${n})`,
  fieldsCount: (n) => `${n} fields`,
  fill: (n) => `Fill ${n} selected`,
  filling: 'Filling',
  close: 'Close',
  done: 'Done',
  resultFilled: (n) => `${n} filled`,
  resultSkipped: (n) => `${n} skipped`,
  skipCodes: { not_linked: 'Not linked to Rippling' },
  fillError: 'Could not fill',
};

const PREVIEW: RipplingBulkFillPreview = {
  rows: [
    { employee_id: 'e1', employee_name: 'Ana Ruiz', fields: { phone: '506-555-0100', city: 'Moncton' } },
    { employee_id: 'e2', employee_name: 'Bruno Diaz', fields: { phone: '506-555-0199' } },
  ],
  failed: 0, total: 2, truncated: 0,
};

function renderModal(over: Partial<React.ComponentProps<typeof RipplingBulkFillModal>> = {}) {
  const props = {
    loadPreview: vi.fn().mockResolvedValue(PREVIEW),
    onApply: vi.fn().mockResolvedValue({ filled: [{ employee_id: 'e1', employee_name: 'Ana Ruiz', fields: ['phone'] }], skipped: [] }),
    fieldLabel: (f: string) => ({ phone: 'Phone', city: 'City' }[f] ?? f),
    onFilled: vi.fn(),
    onClose: vi.fn(),
    labels,
    ...over,
  };
  render(<ToastProvider><RipplingBulkFillModal {...props} /><Toaster /></ToastProvider>);
  return props;
}

describe('RipplingBulkFillModal', () => {
  test('everyone starts ticked and each row shows its missing fields by name', async () => {
    renderModal();
    expect(await screen.findByText('Ana Ruiz')).toBeInTheDocument();
    expect(screen.getByText('2 fields')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('Moncton')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fill 2 selected' })).toBeInTheDocument();
  });

  test('untick one and fill: only the ticked ones are sent, then it reports and closes', async () => {
    const props = renderModal();
    await userEvent.click((await screen.findAllByRole('checkbox'))[2]);
    await userEvent.click(screen.getByRole('button', { name: 'Fill 1 selected' }));
    await waitFor(() => expect(props.onApply).toHaveBeenCalledWith(['e1']));
    expect(props.onFilled).toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });

  test('skipped employees are named with their reason and the dialog stays open', async () => {
    const props = renderModal({ onApply: vi.fn().mockResolvedValue({ filled: [], skipped: [{ employee_id: 'e2', code: 'not_linked' }] }) });
    await userEvent.click(await screen.findByRole('button', { name: 'Fill 2 selected' }));
    expect(await screen.findByText('Not linked to Rippling')).toBeInTheDocument();
    expect(screen.getByText('Bruno Diaz')).toBeInTheDocument();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  test('a failed apply shows the default error', async () => {
    renderModal({ onApply: vi.fn().mockRejectedValue(new Error('x')) });
    await userEvent.click(await screen.findByRole('button', { name: 'Fill 2 selected' }));
    expect(await screen.findByText('Could not fill')).toBeInTheDocument();
  });

  test('the unread and cut-off notes show, and an empty preview says nothing is missing', async () => {
    renderModal({ loadPreview: vi.fn().mockResolvedValue({ rows: [], failed: 3, total: 40, truncated: 10 }) });
    expect(await screen.findByText('3 could not be read')).toBeInTheDocument();
    expect(screen.getByText('Showing 10 of 40')).toBeInTheDocument();
    expect(screen.getByText('Nothing to fill')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Fill/ })).not.toBeInTheDocument();
  });

  test('a failed load offers a retry', async () => {
    const loadPreview = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce(PREVIEW);
    renderModal({ loadPreview });
    expect(await screen.findByText('Could not load')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Ana Ruiz')).toBeInTheDocument();
  });
});
