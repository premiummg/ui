import { describe, it, expect } from 'vitest';
import { nameParts } from './names';
import { photoSrc } from './photo';

describe('nameParts', () => {
  it('keeps stored parts', () => {
    expect(nameParts({ first_name: 'Ana', last_name: 'Ruiz', name: 'x y' })).toEqual({ first: 'Ana', middle: '', last: 'Ruiz' });
  });
  it('splits name or full_name', () => {
    expect(nameParts({ name: 'Ana Maria Ruiz' })).toEqual({ first: 'Ana', middle: 'Maria', last: 'Ruiz' });
    expect(nameParts({ full_name: 'Ana Ruiz' })).toEqual({ first: 'Ana', middle: '', last: 'Ruiz' });
    expect(nameParts({ full_name: 'Ana', middle_name: 'Ana' })).toEqual({ first: 'Ana', middle: '', last: '' });
  });
});

describe('photoSrc', () => {
  it('adds the size to an address with or without a query', () => {
    expect(photoSrc('/api/photos/1')).toBe('/api/photos/1?size=thumb');
    expect(photoSrc('/api/photos/1?v=2')).toBe('/api/photos/1?v=2&size=thumb');
    expect(photoSrc('/api/photos/1', 'full')).toBe('/api/photos/1');
    expect(photoSrc(null)).toBeUndefined();
  });
});
