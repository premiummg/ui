import { describe, expect, test } from 'vitest';
import { uniqueValues, uniqueEntities } from './filters';

describe('uniqueValues', () => {
  test('dedupes and sorts a single value per item', () => {
    const items = [{ role: 'worker' }, { role: 'admin' }, { role: 'worker' }];
    expect(uniqueValues(items, i => i.role)).toEqual(['admin', 'worker']);
  });

  test('accepts an array of values per item too', () => {
    const items = [{ tags: ['a', 'b'] }, { tags: ['b', 'c'] }];
    expect(uniqueValues(items, i => i.tags)).toEqual(['a', 'b', 'c']);
  });

  test('skips null/undefined/empty values', () => {
    const items = [{ v: 'x' }, { v: null }, { v: undefined }, { v: '' }];
    expect(uniqueValues(items, i => i.v)).toEqual(['x']);
  });

  test('handles a null/undefined item list', () => {
    expect(uniqueValues(null, (i: unknown) => i as string)).toEqual([]);
    expect(uniqueValues(undefined, (i: unknown) => i as string)).toEqual([]);
  });
});

describe('uniqueEntities', () => {
  test('dedupes by id and sorts by label', () => {
    const items = [
      { division_id: '1', division: 'Zephyr' },
      { division_id: '2', division: 'Acme' },
      { division_id: '1', division: 'Zephyr' },
    ];
    expect(uniqueEntities(items, i => ({ id: i.division_id, name: i.division }))).toEqual([
      { value: '2', label: 'Acme' },
      { value: '1', label: 'Zephyr' },
    ]);
  });

  test('skips an entity missing a name, even if it has an id', () => {
    const items = [{ id: '1', name: 'Acme' }, { id: '2', name: null }];
    expect(uniqueEntities(items, i => i)).toEqual([{ value: '1', label: 'Acme' }]);
  });

  test('skips an entity missing an id, even if it has a name', () => {
    const items = [{ id: '1', name: 'Acme' }, { id: null, name: 'No Id Co' }];
    expect(uniqueEntities(items, i => i)).toEqual([{ value: '1', label: 'Acme' }]);
  });

  test('accepts an array of entities per item too', () => {
    const items = [{ apps: [{ id: '1', name: 'A' }, { id: '2', name: 'B' }] }];
    expect(uniqueEntities(items, i => i.apps)).toEqual([
      { value: '1', label: 'A' },
      { value: '2', label: 'B' },
    ]);
  });
});
