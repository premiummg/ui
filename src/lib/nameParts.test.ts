import { describe, expect, test } from 'vitest';
import { nameParts } from './names';

// Timesheet employees carry the full name in name.

describe("nameParts with name", () => {
  test('keeps the stored first, middle and last name', () => {
    expect(nameParts({ first_name: 'Ana', middle_name: 'Maria', last_name: 'Lopez', name: 'Ana Maria Lopez' }))
      .toEqual({ first: 'Ana', middle: 'Maria', last: 'Lopez' });
  });

  test('splits a full name when no parts are stored', () => {
    expect(nameParts({ name: 'Remi Leger' })).toEqual({ first: 'Remi', middle: '', last: 'Leger' });
    expect(nameParts({ name: 'Jean Luc  Picard' })).toEqual({ first: 'Jean', middle: 'Luc', last: 'Picard' });
  });

  test('a single word is a first name, and nothing at all gives empty parts', () => {
    expect(nameParts({ name: 'Madonna' })).toEqual({ first: 'Madonna', middle: '', last: '' });
    expect(nameParts({})).toEqual({ first: '', middle: '', last: '' });
  });
});

// Intranet users carry it in full_name.
describe('nameParts with full_name', () => {
  test('keeps the stored first, middle and last name', () => {
    expect(nameParts({ first_name: 'Ana', middle_name: 'Maria', last_name: 'Lopez', full_name: 'Ana Maria Lopez' }))
      .toEqual({ first: 'Ana', middle: 'Maria', last: 'Lopez' });
  });

  test('splits a full name when no parts are stored', () => {
    expect(nameParts({ full_name: 'Remi Leger' })).toEqual({ first: 'Remi', middle: '', last: 'Leger' });
    expect(nameParts({ full_name: 'Jean Luc  Picard' })).toEqual({ first: 'Jean', middle: 'Luc', last: 'Picard' });
  });

  test('ignores a middle name that is just the whole full name', () => {
    expect(nameParts({ full_name: 'Aelius', middle_name: 'Aelius' })).toEqual({ first: 'Aelius', middle: '', last: '' });
    expect(nameParts({ full_name: 'William Frances', middle_name: 'William Frances' }))
      .toEqual({ first: 'William', middle: '', last: 'Frances' });
  });

  test('a single word is a first name, and nothing at all gives empty parts', () => {
    expect(nameParts({ full_name: 'Madonna' })).toEqual({ first: 'Madonna', middle: '', last: '' });
    expect(nameParts({})).toEqual({ first: '', middle: '', last: '' });
  });
});
