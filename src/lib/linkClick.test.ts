import { describe, expect, test } from 'vitest';
import type { MouseEvent } from 'react';
import { isPlainLeftClick } from './linkClick';

const click = (over: Partial<MouseEvent> = {}) =>
  ({ button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, ...over }) as MouseEvent;

describe('isPlainLeftClick', () => {
  test('a plain primary click is taken over', () => {
    expect(isPlainLeftClick(click())).toBe(true);
  });

  test('any modifier or another button is left to the browser', () => {
    expect(isPlainLeftClick(click({ ctrlKey: true }))).toBe(false);
    expect(isPlainLeftClick(click({ metaKey: true }))).toBe(false);
    expect(isPlainLeftClick(click({ shiftKey: true }))).toBe(false);
    expect(isPlainLeftClick(click({ altKey: true }))).toBe(false);
    expect(isPlainLeftClick(click({ button: 1 }))).toBe(false);
  });
});
