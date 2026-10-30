import { describe, expect, test } from 'vitest';
import DOMPurify from 'dompurify';
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

describe('sanitizeRichText style attribute', () => {
  test('keeps formatting properties and drops the rest', () => {
    const out = renderRichTextHtml('<span style="font-weight: bold; filter: blur(9px); z-index: 99; content: x">hi</span>');
    expect(out).toContain('font-weight');
    expect(out).not.toContain('filter');
    expect(out).not.toContain('z-index');
    expect(out).not.toContain('content');
  });

  test('still drops url(), and fixed positioning', () => {
    const out = renderRichTextHtml('<div style="background: url(https://x.test/a.png); position: fixed; color: red">hi</div>');
    expect(out).not.toContain('url(');
    expect(out).not.toContain('fixed');
    expect(out).toContain('color');
  });

  test('drops a url() written with a CSS escape, and comments that hide one', () => {
    expect(renderRichTextHtml('<div style="background: u\\72l(https://x.test/a.png); color: red">hi</div>')).not.toContain('x.test');
    expect(renderRichTextHtml('<div style="background: ur/**/l(https://x.test/a.png); color: red">hi</div>')).not.toContain('x.test');
    expect(renderRichTextHtml('<div style="background: image-set(\'https://x.test/a.png\' 1x); color: red">hi</div>')).not.toContain('x.test');
    expect(renderRichTextHtml('<div style="background: u\\72l(https://x.test/a.png); color: red">hi</div>')).toContain('color');
  });

  test('does not install hooks on the shared DOMPurify', () => {
    renderRichTextHtml('<p>x</p>');
    const out = DOMPurify.sanitize('<span style="filter: blur(9px)" data-youtube="nope">x</span>', { ALLOWED_ATTR: ['style', 'data-youtube'] });
    expect(out).toContain('filter');
    expect(out).toContain('data-youtube');
  });
});

describe('sanitizeRichText images', () => {
  test('keeps embedded and same-site images, drops remote ones', () => {
    const data = 'data:image/png;base64,iVBORw0KGgo=';
    expect(renderRichTextHtml(`<img src="${data}">`)).toContain(data);
    expect(renderRichTextHtml('<img src="/uploads/a.png">')).toContain('/uploads/a.png');
    expect(renderRichTextHtml(`<img src="${window.location.origin}/a.png">`)).toContain('/a.png');
    expect(renderRichTextHtml('<img src="https://tracker.test/p.gif">')).not.toContain('img');
    expect(renderRichTextHtml('<img src="//tracker.test/p.gif">')).not.toContain('img');
    expect(renderRichTextHtml('<img src="data:image/svg+xml;base64,PHN2Zz4=">')).not.toContain('img');
    // A browser reads a backslash as a slash: these point at another site.
    expect(renderRichTextHtml('<img src="/\\tracker.test/p.gif">')).not.toContain('img');
    expect(renderRichTextHtml('<img src="\\\\tracker.test/p.gif">')).not.toContain('img');
  });
});
