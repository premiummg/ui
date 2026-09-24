import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { searchAddress } from './nominatim';

const rawResult = {
  place_id: 42,
  display_name: 'City of Moncton, Westmorland County, New Brunswick, Canada',
  lat: '46.0878',
  lon: '-64.7782',
  address: {
    house_number: '123',
    road: 'Main St',
    city: 'City of Moncton',
    state: 'New Brunswick',
    postcode: 'E1C 1A1',
    country: 'Canada',
    country_code: 'ca',
  },
};

describe('searchAddress', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('returns nothing for a too-short query, without calling fetch', async () => {
    const result = await searchAddress('12');
    expect(result).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  test('rebuilds a clean display name and strips the municipal prefix', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => [rawResult] } as Response);
    const [result] = await searchAddress('123 main st moncton');
    expect(result.displayName).toBe('123 Main St, Moncton, New Brunswick, Canada');
    expect(result.city).toBe('Moncton');
    expect(result.countryCode).toBe('CA');
    expect(result.lat).toBeCloseTo(46.0878);
  });

  test('restricts to the given country codes', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => [] } as Response);
    await searchAddress('123 main st', { countryCodes: 'ca' });
    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(calledUrl).toContain('countrycodes=ca');
  });

  test('fails open (empty array) on a network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));
    await expect(searchAddress('123 main st')).resolves.toEqual([]);
  });

  test('fails open (empty array) on a non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 429 } as Response);
    await expect(searchAddress('123 main st')).resolves.toEqual([]);
  });
});
