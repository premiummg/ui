import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from './useDarkMode';

describe('useDarkMode', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  test('reads the initial state off the existing html.dark class', () => {
    document.documentElement.classList.add('dark');
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(true);
  });

  test('toggle flips isDark, the html class, and localStorage', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    act(() => result.current.toggle());
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
