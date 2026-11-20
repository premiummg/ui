// A profile photo comes with the employee as an address without a size (/api/photos/<id>). The small one is for lists and
// the top bar, the full one for the header of a profile. An address that already has a query string keeps it.
export function photoSrc(url: string | null | undefined, size: 'thumb' | 'full' = 'thumb'): string | undefined {
  if (!url) return undefined;
  if (size !== 'thumb') return url;
  return `${url}${url.includes('?') ? '&' : '?'}size=thumb`;
}
