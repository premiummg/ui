import { describe, expect, test } from 'vitest';
import { initials } from './initials';

describe('initials', () => {
  test('first and last initials for a full name', () => {
    expect(initials('Ada Lovelace')).toBe('AL');
  });

  test('uses the first and LAST word for a 3+ word name, not the first two', () => {
    expect(initials('John Robert Smith')).toBe('JS');
  });

  test('first two characters for a single-word name', () => {
    expect(initials('Madonna')).toBe('MA');
  });

  test('question mark for an empty or whitespace-only name', () => {
    expect(initials('')).toBe('?');
    expect(initials('   ')).toBe('?');
  });

  test('question mark for null/undefined', () => {
    expect(initials(null)).toBe('?');
    expect(initials(undefined)).toBe('?');
  });

  test('collapses repeated whitespace between names', () => {
    expect(initials('Ada   Lovelace')).toBe('AL');
  });
});
