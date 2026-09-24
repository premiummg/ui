// Free OpenStreetMap address search, no API key or billing needed (unlike
// Google Places). Ported from otoshi-landingpage's own nominatim.ts (itself
// ported from Reel-FishR-React-Native), generalized here: country
// restriction and the app-identifying User-Agent are both caller-supplied
// instead of hardcoded to one club/app.
//
// Usage policy: https://operations.osmfoundation.org/policies/nominatim/
// asks for a way to identify the app - a custom User-Agent is the documented
// way, but browsers block a fetch call from actually setting that header and
// send the page's own Referer instead, which the policy also accepts. The
// header stays in the request below anyway (harmless, dropped silently).
export interface AddressSuggestion {
  placeId: string;
  displayName: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  lat: number;
  lng: number;
  // ISO 3166-1 alpha-2, uppercased, undefined if Nominatim didn't resolve one.
  countryCode?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

// Some municipalities carry their legal designation right in Nominatim's
// `address.city` ("City of Moncton", "Town of Riverview") - correct, but not
// how anyone actually fills in a "City" field on a form.
const MUNICIPAL_PREFIX = /^(city|town|village|municipality) of /i;
function cleanLocality(name: string): string {
  return name.replace(MUNICIPAL_PREFIX, '');
}

// Nominatim's own display_name concatenates every administrative tier it
// has, county included (e.g. "City of Moncton, Westmorland County, New
// Brunswick, Canada") - a tier nobody actually uses to describe where they
// are. Rebuilding a label from the structured address fields instead, and
// deliberately skipping county/state_district, gives the plain "Moncton,
// New Brunswick, Canada" a person would actually expect.
function formatDisplayName(address: NominatimResult['address'], fallback: string): string {
  if (!address) return fallback;
  const street = [address.house_number, address.road].filter(Boolean).join(' ');
  const rawLocality = address.city ?? address.town ?? address.village ?? address.suburb ?? address.municipality;
  const locality = rawLocality ? cleanLocality(rawLocality) : rawLocality;
  const parts = [street, locality, address.state, address.country].filter(
    (part): part is string => !!part && part.length > 0,
  );
  return parts.length > 0 ? parts.join(', ') : fallback;
}

// The usage policy caps this shared public server at 1 request/second per
// app. Going over that gets requests silently rate-limited (empty/429
// response), which is intermittent by nature - some searches work, some
// don't, depending on how close together they land. Tracking the last
// request's timestamp and waiting out the remainder of that 1 second window
// keeps every call compliant instead of hoping the caller's own debounce is
// wide enough on its own. Module-level (not per-component-instance) since
// the 1 req/s cap is per app, not per input on screen.
let lastRequestAt = 0;
const MIN_INTERVAL_MS = 1100;

// Two calls landing close together (a slow keystroke right after the
// debounce fires) could otherwise both read the same lastRequestAt before
// either had a chance to update it - chaining onto this promise instead of a
// plain check serializes every call through the same gate, one at a time.
let rateLimitGate: Promise<void> = Promise.resolve();

function waitForRateLimit(): Promise<void> {
  const turn = rateLimitGate.then(async () => {
    const waitFor = lastRequestAt + MIN_INTERVAL_MS - Date.now();
    if (waitFor > 0) {
      await new Promise(resolve => setTimeout(resolve, waitFor));
    }
    lastRequestAt = Date.now();
  });
  rateLimitGate = turn;
  return turn;
}

export interface SearchAddressOptions {
  // Comma-separated ISO 3166-1 alpha-2 codes (e.g. "ca" or "ca,us") to
  // restrict results to. Omit for worldwide search.
  countryCodes?: string;
  // Sent as the request's User-Agent (see the policy note above) and, more
  // reliably, is what a consumer should set to identify itself regardless -
  // defaults to naming this package so a search never goes out anonymous.
  userAgent?: string;
  limit?: number;
}

export async function searchAddress(query: string, options: SearchAddressOptions = {}): Promise<AddressSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  await waitForRateLimit();

  const { countryCodes, userAgent = '@premiummg/ui AddressAutocomplete', limit = 5 } = options;
  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    limit: String(limit),
    q: trimmed,
  });
  if (countryCodes) params.set('countrycodes', countryCodes);

  let response: Response;
  try {
    response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'User-Agent': userAgent, 'Accept-Language': 'en' },
    });
  } catch (error) {
    console.warn('Nominatim address search failed (network error):', error);
    return [];
  }

  if (!response.ok) {
    console.warn(`Nominatim address search failed: HTTP ${response.status}`);
    return [];
  }

  const results = (await response.json()) as NominatimResult[];
  return results.map(result => {
    const a = result.address;
    return {
      placeId: String(result.place_id),
      displayName: formatDisplayName(a, result.display_name),
      street: [a?.house_number, a?.road].filter(Boolean).join(' '),
      city: cleanLocality(a?.city ?? a?.town ?? a?.village ?? a?.suburb ?? a?.municipality ?? ''),
      province: a?.state ?? '',
      postalCode: a?.postcode ?? '',
      lat: Number(result.lat),
      lng: Number(result.lon),
      countryCode: a?.country_code?.toUpperCase(),
    };
  });
}
