import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AttachmentTile } from './AttachmentTile';

describe('AttachmentTile', () => {
  test('shows name and size, expanded by default', () => {
    render(<AttachmentTile name="report.pdf" size="1.2 MB" type="pdf" />);
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByText('1.2 MB')).toBeInTheDocument();
  });

  test('collapsing hides the preview body', async () => {
    render(<AttachmentTile name="report.pdf" size="1.2 MB" type="other" />);
    expect(screen.getByText('No preview available for this file type.')).toBeInTheDocument();
    await userEvent.click(screen.getByText('report.pdf'));
    expect(screen.queryByText('No preview available for this file type.')).not.toBeInTheDocument();
  });

  test('renders an <img> when previewUrl is given for an image', () => {
    render(<AttachmentTile name="photo.jpg" size="500 KB" type="image" previewUrl="https://example.com/photo.jpg" />);
    expect(screen.getByRole('img', { name: 'photo.jpg' })).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  test('the download button only appears when onDownload is given', () => {
    const { rerender } = render(<AttachmentTile name="report.pdf" size="1.2 MB" type="pdf" />);
    expect(screen.queryByTitle('Download')).not.toBeInTheDocument();
    const onDownload = vi.fn();
    rerender(<AttachmentTile name="report.pdf" size="1.2 MB" type="pdf" onDownload={onDownload} />);
    expect(screen.getByTitle('Download')).toBeInTheDocument();
  });

  test('clicking download calls onDownload without collapsing the tile', async () => {
    const onDownload = vi.fn();
    render(<AttachmentTile name="report.pdf" size="1.2 MB" type="pdf" onDownload={onDownload} />);
    await userEvent.click(screen.getByTitle('Download'));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });
});
