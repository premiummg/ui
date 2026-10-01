// First and last initials - a single letter collides constantly on a real
// roster (three Anas and two Luises all render as one glyph), and two
// letters is the cheapest thing that usually tells them apart. Falls back to
// the first two characters for a mononym, and to a question mark for an
// empty name, so a tile built from this is never blank.
export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
