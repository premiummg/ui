import { describe, expect, test, vi, afterEach } from 'vitest';
import { copyToClipboard } from './clipboard';

describe('copyToClipboard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('uses the modern Clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    await copyToClipboard('hello');
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  test('falls back to the legacy textarea/execCommand method when the modern API throws', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.assign(navigator, { clipboard: { writeText } });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.assign(document, { execCommand });

    await copyToClipboard('fallback text');

    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  test('falls back to the legacy method when no Clipboard API exists at all', async () => {
    Object.assign(navigator, { clipboard: undefined });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.assign(document, { execCommand });

    await copyToClipboard('no api here');

    expect(execCommand).toHaveBeenCalledWith('copy');
  });
});
