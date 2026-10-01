import { describe, expect, test } from 'vitest';
import { formatPhone, toE164 } from './phone';

describe('toE164', () => {
  test('passes an already-E.164 value through unchanged', () => {
    expect(toE164('+15068984607')).toBe('+15068984607');
  });

  test('normalizes a national-format Canadian number to E.164', () => {
    expect(toE164('506-898-4607')).toBe('+15068984607');
  });

  test('empty/null/undefined all return an empty string', () => {
    expect(toE164('')).toBe('');
    expect(toE164(null)).toBe('');
    expect(toE164(undefined)).toBe('');
  });

  test('falls back to the raw value when it cannot be parsed', () => {
    expect(toE164('not a phone number')).toBe('not a phone number');
  });
});

describe('formatPhone', () => {
  test('formats an E.164 value into national display format', () => {
    expect(formatPhone('+15068984607')).toBe('(506) 898-4607');
  });

  test('formats a national-format value the same way', () => {
    expect(formatPhone('5068984607')).toBe('(506) 898-4607');
  });

  test('empty/null/undefined all return an empty string', () => {
    expect(formatPhone('')).toBe('');
    expect(formatPhone(null)).toBe('');
    expect(formatPhone(undefined)).toBe('');
  });

  test('falls back to the raw value when it cannot be parsed', () => {
    expect(formatPhone('not a phone number')).toBe('not a phone number');
  });
});
