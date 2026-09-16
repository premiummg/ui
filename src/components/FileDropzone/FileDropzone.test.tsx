import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileDropzone } from './FileDropzone';

describe('FileDropzone', () => {
  test('shows the default label and hint', () => {
    render(<FileDropzone onFiles={() => {}} />);
    expect(screen.getByText('Drag a file here, or click to browse')).toBeInTheDocument();
    expect(screen.getByText('PDF, Word, Excel, PowerPoint, images…')).toBeInTheDocument();
  });

  test('a custom label/hint replaces the defaults', () => {
    render(<FileDropzone onFiles={() => {}} label="Drop a receipt" hint="JPG or PNG only" />);
    expect(screen.getByText('Drop a receipt')).toBeInTheDocument();
    expect(screen.getByText('JPG or PNG only')).toBeInTheDocument();
  });

  test('picking a file via the hidden input calls onFiles', async () => {
    const onFiles = vi.fn();
    const { container } = render(<FileDropzone onFiles={onFiles} />);
    const file = new File(['hello'], 'receipt.pdf', { type: 'application/pdf' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);
    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(onFiles.mock.calls[0][0]).toHaveLength(1);
    expect(onFiles.mock.calls[0][0][0].name).toBe('receipt.pdf');
  });

  test('dropping files calls onFiles with them', () => {
    const onFiles = vi.fn();
    const { container } = render(<FileDropzone onFiles={onFiles} />);
    const zone = container.firstElementChild as HTMLElement;
    const file = new File(['hello'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.dragOver(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  function fileOfSize(name: string, bytes: number) {
    return new File([new Uint8Array(bytes)], name);
  }

  test('a file over maxSizeMB is rejected and shows an inline error', async () => {
    const onFiles = vi.fn();
    const { container } = render(<FileDropzone onFiles={onFiles} maxSizeMB={1} />);
    const big = fileOfSize('huge.pdf', 2 * 1024 * 1024);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, big);
    expect(onFiles).not.toHaveBeenCalled();
    expect(screen.getByText(/huge\.pdf exceeds the 1MB limit/)).toBeInTheDocument();
  });

  test('files within maxSizeMB are accepted normally', async () => {
    const onFiles = vi.fn();
    const { container } = render(<FileDropzone onFiles={onFiles} maxSizeMB={1} />);
    const small = fileOfSize('receipt.pdf', 1024);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, small);
    expect(onFiles).toHaveBeenCalledWith([small]);
    expect(screen.queryByText(/exceeds the 1MB limit/)).not.toBeInTheDocument();
  });

  test('a mixed batch keeps the files under the limit and reports the rest', async () => {
    const onFiles = vi.fn();
    const { container } = render(<FileDropzone onFiles={onFiles} maxSizeMB={1} />);
    const small = fileOfSize('ok.pdf', 1024);
    const big = fileOfSize('huge.pdf', 2 * 1024 * 1024);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, [small, big]);
    expect(onFiles).toHaveBeenCalledWith([small]);
    expect(screen.getByText(/huge\.pdf exceeds the 1MB limit/)).toBeInTheDocument();
  });

  test('multiple={false} keeps only the first file when several are dropped at once', () => {
    const onFiles = vi.fn();
    const { container } = render(<FileDropzone onFiles={onFiles} multiple={false} />);
    const zone = container.firstElementChild as HTMLElement;
    const a = new File(['a'], 'a.jpg', { type: 'image/jpeg' });
    const b = new File(['b'], 'b.jpg', { type: 'image/jpeg' });
    fireEvent.dragOver(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [a, b] } });
    expect(onFiles).toHaveBeenCalledWith([a]);
  });

  test('accept is enforced on drop, not just hinted to the native picker', () => {
    const onFiles = vi.fn();
    const { container } = render(<FileDropzone onFiles={onFiles} accept="image/*" />);
    const zone = container.firstElementChild as HTMLElement;
    const script = new File(['<html></html>'], 'evil.html', { type: 'text/html' });
    fireEvent.dragOver(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [script] } });
    expect(onFiles).not.toHaveBeenCalled();
    expect(screen.getByText(/evil\.html isn't an accepted file type/)).toBeInTheDocument();
  });

  test('accept matches by extension too, and lets matching files through', () => {
    const onFiles = vi.fn();
    const { container } = render(<FileDropzone onFiles={onFiles} accept=".pdf,image/*" />);
    const zone = container.firstElementChild as HTMLElement;
    const pdf = new File(['x'], 'contract.pdf', { type: 'application/pdf' });
    fireEvent.dragOver(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [pdf] } });
    expect(onFiles).toHaveBeenCalledWith([pdf]);
    expect(screen.queryByText(/accepted file type/)).not.toBeInTheDocument();
  });

  test('a mixed batch reports both wrong-type and over-size files, keeping only the valid ones', () => {
    const onFiles = vi.fn();
    const { container } = render(<FileDropzone onFiles={onFiles} accept="image/*" maxSizeMB={1} />);
    const zone = container.firstElementChild as HTMLElement;
    const ok = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    const wrongType = new File(['x'], 'evil.exe', { type: 'application/x-msdownload' });
    const tooBig = fileOfSize('huge.png', 2 * 1024 * 1024);
    Object.defineProperty(tooBig, 'type', { value: 'image/png' });
    fireEvent.dragOver(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [ok, wrongType, tooBig] } });
    expect(onFiles).toHaveBeenCalledWith([ok]);
    expect(screen.getByText(/evil\.exe isn't an accepted file type/)).toBeInTheDocument();
    expect(screen.getByText(/huge\.png exceeds the 1MB limit/)).toBeInTheDocument();
  });
});
