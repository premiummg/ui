import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useScrollToErrors } from './useScrollToErrors';

const offscreen = { top: 2000, bottom: 2040, left: 0, right: 200, width: 200, height: 40 } as DOMRect;

describe('useScrollToErrors', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    scrollIntoView.mockClear();
    Element.prototype.scrollIntoView = scrollIntoView;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(offscreen);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  function addFieldError() {
    const wrap = document.createElement('div');
    wrap.innerHTML = '<input id="f" /><p data-form-error data-field-error>Required</p>';
    document.body.appendChild(wrap);
    return wrap.querySelector('input') as HTMLInputElement;
  }

  test('scrolls to and focuses the field when its error appears', async () => {
    renderHook(() => useScrollToErrors());
    const input = addFieldError();
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1));
    expect(scrollIntoView.mock.instances[0]).toBe(input);
    expect(document.activeElement).toBe(input);
  });

  test('only scrolls the error alert, without focusing anything', async () => {
    renderHook(() => useScrollToErrors());
    const alert = document.createElement('div');
    alert.setAttribute('data-form-error', '');
    document.body.appendChild(alert);
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1));
    expect(scrollIntoView.mock.instances[0]).toBe(alert);
  });

  test('ignores an error that was already on the page', async () => {
    addFieldError();
    renderHook(() => useScrollToErrors());
    document.body.appendChild(document.createElement('span'));
    await new Promise((r) => setTimeout(r, 120));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  test('does not scroll when the error is already in view', async () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ ...offscreen, top: 300, bottom: 340 });
    renderHook(() => useScrollToErrors());
    addFieldError();
    await new Promise((r) => setTimeout(r, 120));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
