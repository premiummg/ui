import { describe, expect, test } from 'vitest';
import { normalizeAutoInkColors, renderRichTextHtml } from './richTextSanitize';

describe('normalizeAutoInkColors', () => {
  test('rewrites a <font color> black into the theme-adaptive class', () => {
    const el = document.createElement('div');
    el.innerHTML = '<font color="#000000">hello</font>';
    normalizeAutoInkColors(el);
    const font = el.querySelector('font')!;
    expect(font.getAttribute('color')).toBeNull();
    expect(font.classList.contains('rte-auto-ink')).toBe(true);
  });

  test('rewrites an inline style white into the same class', () => {
    const el = document.createElement('div');
    el.innerHTML = '<span style="color: rgb(255, 255, 255);">hello</span>';
    normalizeAutoInkColors(el);
    const span = el.querySelector('span')!;
    expect(span.style.color).toBe('');
    expect(span.classList.contains('rte-auto-ink')).toBe(true);
  });

  test('leaves a non-extreme color untouched', () => {
    const el = document.createElement('div');
    el.innerHTML = '<font color="#e62027">hello</font>';
    normalizeAutoInkColors(el);
    const font = el.querySelector('font')!;
    expect(font.getAttribute('color')).toBe('#e62027');
    expect(font.classList.contains('rte-auto-ink')).toBe(false);
  });

  test('preserves other inline style declarations alongside the color', () => {
    const el = document.createElement('div');
    el.innerHTML = '<span style="font-weight: bold; color: #000000;">hello</span>';
    normalizeAutoInkColors(el);
    const span = el.querySelector('span')!;
    expect(span.style.color).toBe('');
    expect(span.style.fontWeight).toBe('bold');
    expect(span.classList.contains('rte-auto-ink')).toBe(true);
  });
});

describe('renderRichTextHtml', () => {
  test('normalizes ink colors as part of the render pipeline', () => {
    const rendered = renderRichTextHtml('<font color="#ffffff">hi</font>');
    expect(rendered).not.toContain('color="#ffffff"');
    expect(rendered).toContain('rte-auto-ink');
  });
});
