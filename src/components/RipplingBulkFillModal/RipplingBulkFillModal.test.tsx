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
  photosPending: (n) => `${n} photos left for later`,
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

  test('photos left for later are said, and the dialog stays open even if nobody was skipped', async () => {
    const props = renderModal({ onApply: vi.fn().mockResolvedValue({ filled: [{ employee_id: 'e1', employee_name: 'Ana Ruiz', fields: ['phone'] }], skipped: [], photos_pending: ['e1', 'e2'] }) });
    await userEvent.click(await screen.findByRole('button', { name: 'Fill 2 selected' }));
    expect(await screen.findByText('2 photos left for later')).toBeInTheDocument();
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

  describe('the photo of a person', () => {
    const withPhoto = (photo: string): RipplingBulkFillPreview => ({
      rows: [{ employee_id: 'e1', employee_name: 'Ana Ruiz', fields: { phone: '506-555-0100', photo } }],
      failed: 0, total: 1, truncated: 0,
    });

    test('is shown small, as an image, instead of its address', async () => {
      const { container } = (renderModal({ loadPreview: vi.fn().mockResolvedValue(withPhoto('https://x.ripplingcdn.com/ana.jpg')), fieldLabel: (f: string) => ({ phone: 'Phone', photo: 'Photo' }[f] ?? f) }), { container: document.body });
      expect(await screen.findByText('Photo')).toBeInTheDocument();
      const image = container.querySelector('img');
      expect(image).toHaveAttribute('src', 'https://x.ripplingcdn.com/ana.jpg');
      expect(screen.queryByText('https://x.ripplingcdn.com/ana.jpg')).not.toBeInTheDocument();
    });

    test('a value that is not an image address stays as text, so nothing else is ever loaded', async () => {
      const { container } = (renderModal({ loadPreview: vi.fn().mockResolvedValue(withPhoto('✓')), fieldLabel: (f: string) => ({ phone: 'Phone', photo: 'Photo' }[f] ?? f) }), { container: document.body });
      expect(await screen.findByText('Photo')).toBeInTheDocument();
      expect(screen.getByText('✓')).toBeInTheDocument();
      expect(container.querySelector('img')).toBeNull();
    });

    test('an address on another field is text, not an image', async () => {
      const preview: RipplingBulkFillPreview = { rows: [{ employee_id: 'e1', employee_name: 'Ana Ruiz', fields: { city: 'https://evil.example/x.gif' } }], failed: 0, total: 1, truncated: 0 };
      const { container } = (renderModal({ loadPreview: vi.fn().mockResolvedValue(preview) }), { container: document.body });
      expect(await screen.findByText('https://evil.example/x.gif')).toBeInTheDocument();
      expect(container.querySelector('img')).toBeNull();
    });
  });
  describe('a person Rippling has terminated', () => {
    const WITH_TERMINATED: RipplingBulkFillPreview = {
      rows: [
        { employee_id: 'e1', employee_name: 'Ana Ruiz', fields: { phone: '506-555-0100' } },
        { employee_id: 'e3', employee_name: 'Carla Gomez', fields: {}, terminated: true },
      ],
      failed: 0, total: 2, truncated: 0,
    };
    const deactivationLabels: RipplingBulkFillModalLabels = {
      ...labels,
      terminatedNote: 'Terminated in Rippling. Will be deactivated',
      applyWithDeactivations: (filled, deactivated) => `Fill ${filled} and deactivate ${deactivated}`,
      resultDeactivated: (n) => `${n} deactivated`,
    };

    test('is listed with its own notice, and is NOT selected until the admin ticks it', async () => {
      renderModal({ loadPreview: vi.fn().mockResolvedValue(WITH_TERMINATED), labels: deactivationLabels });
      expect(await screen.findByText('Carla Gomez')).toBeInTheDocument();
      expect(screen.getByText('Terminated in Rippling. Will be deactivated')).toBeInTheDocument();
      const boxes = screen.getAllByRole('checkbox');
      // [select all, Ana, Carla]: Ana (a fill) starts selected, Carla (a deactivation) does not
      expect(boxes[1]).toBeChecked();
      expect(boxes[2]).not.toBeChecked();
      expect(screen.getByRole('button', { name: 'Fill 1 selected' })).toBeInTheDocument();
    });

    test('ticking it changes the button to say what will be deactivated, and only then are they sent', async () => {
      const props = renderModal({
        loadPreview: vi.fn().mockResolvedValue(WITH_TERMINATED),
        onApply: vi.fn().mockResolvedValue({
          filled: [
            { employee_id: 'e1', employee_name: 'Ana Ruiz', fields: ['phone'] },
            { employee_id: 'e3', employee_name: 'Carla Gomez', fields: ['deactivated'] },
          ],
          skipped: [],
        }),
        labels: deactivationLabels,
      });
      await screen.findByText('Carla Gomez');
      await userEvent.click(screen.getAllByRole('checkbox')[2]);
      await userEvent.click(screen.getByRole('button', { name: 'Fill 1 and deactivate 1' }));
      await waitFor(() => expect(props.onApply).toHaveBeenCalledWith(['e1', 'e3']));
    });

    test('without ticking it, a fill never sends them', async () => {
      const props = renderModal({ loadPreview: vi.fn().mockResolvedValue(WITH_TERMINATED), labels: deactivationLabels });
      await screen.findByText('Carla Gomez');
      await userEvent.click(screen.getByRole('button', { name: 'Fill 1 selected' }));
      await waitFor(() => expect(props.onApply).toHaveBeenCalledWith(['e1']));
    });

    test('the result says who was filled and who was deactivated', async () => {
      renderModal({
        loadPreview: vi.fn().mockResolvedValue(WITH_TERMINATED),
        onApply: vi.fn().mockResolvedValue({
          filled: [
            { employee_id: 'e1', employee_name: 'Ana Ruiz', fields: ['phone'] },
            { employee_id: 'e3', employee_name: 'Carla Gomez', fields: ['deactivated'] },
          ],
          skipped: [{ employee_id: 'e9', code: 'not_linked' }],
        }),
        labels: deactivationLabels,
      });
      await screen.findByText('Carla Gomez');
      await userEvent.click(screen.getAllByRole('checkbox')[2]);
      await userEvent.click(screen.getByRole('button', { name: /deactivate/ }));
      expect(await screen.findByText(/1 filled · 1 deactivated/)).toBeInTheDocument();
    });

    test('"Select all" counts and ticks only the fills, never a terminated person', async () => {
      renderModal({ loadPreview: vi.fn().mockResolvedValue(WITH_TERMINATED), labels: deactivationLabels });
      await screen.findByText('Carla Gomez');
      const selectAll = screen.getByRole('checkbox', { name: 'Select all (1)' });
      // Off and on again: Ana comes back, Carla stays unticked.
      await userEvent.click(selectAll);
      expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
      await userEvent.click(selectAll);
      expect(screen.getAllByRole('checkbox')[1]).toBeChecked();
      expect(screen.getAllByRole('checkbox')[2]).not.toBeChecked();
      expect(screen.getByRole('button', { name: 'Fill 1 selected' })).toBeInTheDocument();
    });

    test('unticking all the fills leaves a terminated person ticked by hand as it is', async () => {
      renderModal({ loadPreview: vi.fn().mockResolvedValue(WITH_TERMINATED), labels: deactivationLabels });
      await screen.findByText('Carla Gomez');
      await userEvent.click(screen.getAllByRole('checkbox')[2]);
      await userEvent.click(screen.getByRole('checkbox', { name: 'Select all (1)' }));
      expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
      expect(screen.getAllByRole('checkbox')[2]).toBeChecked();
    });

    test('the message after a fill that closes counts the deactivated apart from the filled', async () => {
      renderModal({
        loadPreview: vi.fn().mockResolvedValue(WITH_TERMINATED),
        onApply: vi.fn().mockResolvedValue({
          filled: [
            { employee_id: 'e1', employee_name: 'Ana Ruiz', fields: ['phone'] },
            { employee_id: 'e3', employee_name: 'Carla Gomez', fields: ['deactivated'] },
          ],
          skipped: [],
        }),
        labels: deactivationLabels,
      });
      await screen.findByText('Carla Gomez');
      await userEvent.click(screen.getAllByRole('checkbox')[2]);
      await userEvent.click(screen.getByRole('button', { name: /deactivate/ }));
      // The toast and the result behind it (onClose is a mock here, so the dialog stays): the toast used to say "2 filled".
      await waitFor(() => expect(screen.getAllByText('1 filled · 1 deactivated')).toHaveLength(2));
      expect(screen.queryByText('2 filled')).not.toBeInTheDocument();
    });

    test('an app that does not give the new words still shows the notice and fills as before', async () => {
      renderModal({ loadPreview: vi.fn().mockResolvedValue(WITH_TERMINATED) });
      await screen.findByText('Carla Gomez');
      expect(screen.getByText(/Terminated in Rippling/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Fill 1 selected' })).toBeInTheDocument();
    });
  });
});
