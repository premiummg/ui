import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RichTextToolbar, normalizeLinkUrl } from './RichTextToolbar';

describe('normalizeLinkUrl', () => {
  test('keeps http(s), mailto and tel as typed', () => {
    expect(normalizeLinkUrl('https://premiummg.ca/a?b=1')).toBe('https://premiummg.ca/a?b=1');
    expect(normalizeLinkUrl('mailto:hr@premiummg.ca')).toBe('mailto:hr@premiummg.ca');
    expect(normalizeLinkUrl('tel:+15065551234')).toBe('tel:+15065551234');
  });

  test('adds https to an address typed without a scheme', () => {
    expect(normalizeLinkUrl('  premiummg-ui.vercel.app ')).toBe('https://premiummg-ui.vercel.app');
  });

  test('refuses other schemes, spaces and empty input', () => {
    expect(normalizeLinkUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeLinkUrl('data:text/html,hi')).toBeNull();
    expect(normalizeLinkUrl('not a link')).toBeNull();
    expect(normalizeLinkUrl('   ')).toBeNull();
  });
});

describe('RichTextToolbar link button', () => {
  test('inserts an anchor that opens in a new tab, using the text to show', async () => {
    const exec = vi.fn();
    render(<RichTextToolbar exec={exec} execHighlight={() => {}} />);
    await userEvent.click(screen.getByTitle('Insert a link'));
    await userEvent.type(screen.getByPlaceholderText('https://premiummg.ca'), 'premiummg.ca');
    await userEvent.type(screen.getByPlaceholderText('Brand Guideline'), 'Our site');
    await userEvent.click(screen.getByRole('button', { name: 'Insert' }));
    expect(exec).toHaveBeenCalledWith(
      'insertHTML',
      '<a href="https://premiummg.ca" target="_blank" rel="noopener noreferrer">Our site</a>',
    );
  });

  test('a bad address shows an error and inserts nothing', async () => {
    const exec = vi.fn();
    render(<RichTextToolbar exec={exec} execHighlight={() => {}} />);
    await userEvent.click(screen.getByTitle('Insert a link'));
    await userEvent.type(screen.getByPlaceholderText('https://premiummg.ca'), 'javascript:alert(1)');
    await userEvent.click(screen.getByRole('button', { name: 'Insert' }));
    expect(screen.getByText("That doesn't look like a web address.")).toBeInTheDocument();
    expect(exec).not.toHaveBeenCalled();
  });
});
