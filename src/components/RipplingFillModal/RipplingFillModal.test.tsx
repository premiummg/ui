import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, Toaster } from '../Toaster';
import { RipplingFillModal, RipplingFillModalLabels } from './RipplingFillModal';

const labels: RipplingFillModalLabels = {
  heading: 'Fill from Rippling',
  body: 'Only what is missing.',
  loading: 'Checking',
  loadError: 'Could not load',
  retry: 'Try again',
  nothingMissing: 'Nothing to fill',
  fill: 'Fill',
  filling: 'Filling',
  close: 'Close',
  filledToast: (n) => `Filled ${n}`,
  fillError: 'Could not fill',
};

function renderModal(over: Partial<React.ComponentProps<typeof RipplingFillModal>> = {}) {
  const props = {
    loadFields: vi.fn().mockResolvedValue({ phone: '506-555-0100', birthday: '1990-01-02' }),
    onFill: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
    fieldLabel: (f: string) => ({ phone: 'Phone', birthday: 'Birthday' }[f] ?? f),
    labels,
    ...over,
  };
  render(
    <ToastProvider>
      <RipplingFillModal {...props} />
      <Toaster />
    </ToastProvider>,
  );
  return props;
}

describe('RipplingFillModal', () => {
  test('shows each missing field with its name and value', async () => {
    renderModal();
    expect(await screen.findByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('506-555-0100')).toBeInTheDocument();
    expect(screen.getByText('Birthday')).toBeInTheDocument();
  });

  test('filling sends exactly the shown fields, reports the count and closes', async () => {
    const props = renderModal({ onFilled: vi.fn() });
    await userEvent.click(await screen.findByRole('button', { name: 'Fill' }));
    await waitFor(() => expect(props.onFill).toHaveBeenCalledWith({ phone: '506-555-0100', birthday: '1990-01-02' }));
    expect(await screen.findByText('Filled 2')).toBeInTheDocument();
    expect(props.onFilled).toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });

  test('nothing missing says so and offers no Fill button', async () => {
    renderModal({ loadFields: vi.fn().mockResolvedValue({}) });
    expect(await screen.findByText('Nothing to fill')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fill' })).not.toBeInTheDocument();
  });

  test('a failed fill stays open and shows the error', async () => {
    const props = renderModal({ onFill: vi.fn().mockRejectedValue(new Error('x')), errorMessage: () => 'Server said no' });
    await userEvent.click(await screen.findByRole('button', { name: 'Fill' }));
    expect(await screen.findByText('Server said no')).toBeInTheDocument();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  test('a failed load offers a retry', async () => {
    const loadFields = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce({ phone: '1' });
    renderModal({ loadFields });
    expect(await screen.findByText('Could not load')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Phone')).toBeInTheDocument();
  });
});
