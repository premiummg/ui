import type { EntityOption } from '../components/FilterRow';

// Shared helpers for "faceted" filter panels: every filter's own option list
// must reflect only the values actually present in the current, fully
// filtered table data (every other active filter applied, INCLUDING itself)
// - never the full global list of everything that could exist, and never a
// fixed enum of every possible value.

// Plain-string facet (Status, Role when it has no id/scope ambiguity).
// Returns a sorted array of the distinct values pick() finds across items.
// pick() may return a single value or a list per item - either shape works.
export function uniqueValues<T>(
  items: T[] | null | undefined,
  pick: (item: T) => (string | null | undefined)[] | string | null | undefined,
): string[] {
  const set = new Set<string>();
  items?.forEach(item => {
    const picked = pick(item);
    const list = Array.isArray(picked) ? picked : [picked];
    list.forEach(v => v && set.add(v));
  });
  return [...set].sort();
}

// Re-exported for a consumer importing both from here - same shape
// FilterRow's own options already take, not redeclared, so there's exactly
// one EntityOption type, not two structurally-identical ones.
export type { EntityOption };

// Id-keyed facet (Division/Department/Company/Team - names can repeat across
// scopes, so options must be deduped by real id, not display name). pick()
// returns {id, name} (or an array of them, or null/undefined) per item. An
// entity missing either `id` or `name` is skipped entirely, rather than
// appearing as a filter pill with a blank label.
export function uniqueEntities<T>(
  items: T[] | null | undefined,
  pick: (item: T) => { id?: string | null; name?: string | null } | { id?: string | null; name?: string | null }[] | null | undefined,
): EntityOption[] {
  const map = new Map<string, string>();
  items?.forEach(item => {
    const picked = pick(item);
    const list = Array.isArray(picked) ? picked : [picked];
    list.forEach(e => {
      if (e?.id && e?.name) map.set(e.id, e.name);
    });
  });
  return [...map.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
}
