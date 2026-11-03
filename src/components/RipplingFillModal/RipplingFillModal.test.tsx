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
  photo: 'Photo',
  photoDifferentHint: 'The photo in Rippling is not the one this person has.',
  photoCurrent: 'Current',
  photoFromRippling: 'In Rippling',
  photoKeepCurrent: 'Keep current',
  photoUseRippling: 'Use the one from Rippling',
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

describe('RipplingFillModal photo', () => {
  const preview = (photo: any, fields: Record<string, string> = {}) => vi.fn().mockResolvedValue({ fields, photo });
  const newPhoto = { status: 'new', ripplingPreview: 'data:image/webp;base64,AAAA' } as const;
  const differentPhoto = { status: 'different', currentUrl: '/api/photos/mine?size=thumb', ripplingPreview: 'data:image/webp;base64,BBBB' } as const;

  test('a photo for somebody with none is filled in with the rest of the fields', async () => {
    const onUsePhoto = vi.fn().mockResolvedValue(undefined);
    const props = renderModal({ loadFields: undefined, loadPreview: preview(newPhoto, { phone: '506-555-0100' }), onUsePhoto });
    expect(await screen.findByText('Photo')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Fill' }));
    await waitFor(() => expect(props.onFill).toHaveBeenCalledWith({ phone: '506-555-0100' }));
    expect(onUsePhoto).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Filled 2')).toBeInTheDocument();
  });

  test('a photo alone is enough to fill, without calling the save of the fields', async () => {
    const onUsePhoto = vi.fn().mockResolvedValue(undefined);
    const props = renderModal({ loadFields: undefined, loadPreview: preview(newPhoto), onUsePhoto });
    await userEvent.click(await screen.findByRole('button', { name: 'Fill' }));
    await waitFor(() => expect(onUsePhoto).toHaveBeenCalledTimes(1));
    expect(props.onFill).not.toHaveBeenCalled();
  });

  test('a different photo shows both and starts on keeping the current one: nothing to fill', async () => {
    const onUsePhoto = vi.fn();
    renderModal({ loadFields: undefined, loadPreview: preview(differentPhoto), onUsePhoto });
    expect(await screen.findByText('The photo in Rippling is not the one this person has.')).toBeInTheDocument();
    expect(screen.getByLabelText('Keep current')).toBeChecked();
    expect(screen.getByLabelText('Use the one from Rippling')).not.toBeChecked();
    expect(screen.queryByRole('button', { name: 'Fill' })).not.toBeInTheDocument();
    expect(onUsePhoto).not.toHaveBeenCalled();
  });

  test('choosing the one from Rippling brings it', async () => {
    const onUsePhoto = vi.fn().mockResolvedValue(undefined);
    renderModal({ loadFields: undefined, loadPreview: preview(differentPhoto), onUsePhoto });
    await userEvent.click(await screen.findByLabelText('Use the one from Rippling'));
    await userEvent.click(screen.getByRole('button', { name: 'Fill' }));
    await waitFor(() => expect(onUsePhoto).toHaveBeenCalledTimes(1));
  });

  test('keeping the current one still fills the other fields, and leaves the photo alone', async () => {
    const onUsePhoto = vi.fn();
    const props = renderModal({ loadFields: undefined, loadPreview: preview(differentPhoto, { phone: '506-555-0100' }), onUsePhoto });
    await userEvent.click(await screen.findByRole('button', { name: 'Fill' }));
    await waitFor(() => expect(props.onFill).toHaveBeenCalledWith({ phone: '506-555-0100' }));
    expect(onUsePhoto).not.toHaveBeenCalled();
  });

  test('when the photo fails after the fields were saved, the page is told and only the photo is left to try again', async () => {
    const onUsePhoto = vi.fn().mockRejectedValueOnce(new Error('cdn down')).mockResolvedValue(undefined);
    const onFilled = vi.fn();
    const props = renderModal({ loadFields: undefined, loadPreview: preview(newPhoto, { phone: '506-555-0100' }), onUsePhoto, onFilled });
    await userEvent.click(await screen.findByRole('button', { name: 'Fill' }));
    expect(await screen.findByText('Could not fill')).toBeInTheDocument();
    expect(onFilled).toHaveBeenCalledWith({ phone: '506-555-0100' });
    expect(screen.queryByText('506-555-0100')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Fill' }));
    await waitFor(() => expect(onUsePhoto).toHaveBeenCalledTimes(2));
    expect(props.onFill).toHaveBeenCalledTimes(1);
  });

  test('a picture address that is not a path, an https address or an embedded image is never put in an image', async () => {
    const bad = { status: 'new', ripplingPreview: 'javascript:alert(1)' } as const;
    renderModal({ loadFields: undefined, loadPreview: preview(bad), onUsePhoto: vi.fn() });
    await screen.findByRole('button', { name: 'Fill' });
    expect(document.querySelector('img')).toBeNull();
  });

  test('a photo that cannot be brought reports the failure and keeps the dialog open', async () => {
    const onUsePhoto = vi.fn().mockRejectedValue(new Error('cdn down'));
    const props = renderModal({ loadFields: undefined, loadPreview: preview(newPhoto), onUsePhoto });
    await userEvent.click(await screen.findByRole('button', { name: 'Fill' }));
    expect(await screen.findByText('Could not fill')).toBeInTheDocument();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  test('with no photo to offer it reads as before', async () => {
    renderModal({ loadFields: undefined, loadPreview: preview(null, {}) });
    expect(await screen.findByText('Nothing to fill')).toBeInTheDocument();
  });
});
