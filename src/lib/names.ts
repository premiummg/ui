// Employees created before identity-service kept first/last name as separate fields
// only have a full name. This gives the three parts for display and export: the
// stored ones when there are any, otherwise the full name split on spaces (first
// word is the first name, last word the last name, anything between is the middle
// name). A single word is a first name. The full name is `name` (timesheet) or
// `full_name` (intranet).
export interface NamedPerson {
  name?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
}

export function nameParts(person: NamedPerson): { first: string; middle: string; last: string } {
  const stored = {
    first: (person.first_name ?? '').trim(),
    middle: (person.middle_name ?? '').trim(),
    last: (person.last_name ?? '').trim(),
  };
  if (stored.first || stored.last) return stored;
  const fullName = (person.name ?? person.full_name ?? '').trim();
  // Legacy rows kept the whole name in middle_name; that is not a real middle name.
  if (stored.middle.toLowerCase() === fullName.toLowerCase()) stored.middle = '';
  const words = fullName.split(/\s+/).filter(Boolean);
  if (words.length === 0) return stored;
  if (words.length === 1) return { first: words[0], middle: stored.middle, last: '' };
  return {
    first: words[0],
    middle: stored.middle || words.slice(1, -1).join(' '),
    last: words[words.length - 1],
  };
}
