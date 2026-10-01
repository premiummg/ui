import { formatPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';

// Displays a stored phone number in the same national format PhoneInput
// shows while typing ("(506) 898-4607"). Falls back to the raw stored value
// for anything that doesn't parse - legacy records saved before a consumer
// switched to storing phone numbers in E.164.
export function formatPhone(raw?: string | null, defaultCountry: Parameters<typeof parsePhoneNumber>[1] = 'CA'): string {
  if (!raw) return '';
  if (raw.startsWith('+')) return formatPhoneNumber(raw) || raw;
  const parsed = parsePhoneNumber(raw, defaultCountry);
  return parsed ? formatPhoneNumber(parsed.number) : raw;
}

// Normalizes a stored phone number to E.164 ("+15068984607") for PhoneInput's
// `value` prop - a non-E.164 legacy value (e.g. "506-898-4607") makes the
// library unable to detect the number's country from the value alone, which
// is what defeats `defaultCountry` and leaves the country picker showing no
// flag at all until the user picks one manually.
export function toE164(raw?: string | null, defaultCountry: Parameters<typeof parsePhoneNumber>[1] = 'CA'): string {
  if (!raw) return '';
  if (raw.startsWith('+')) return raw;
  const parsed = parsePhoneNumber(raw, defaultCountry);
  return parsed ? parsed.number : raw;
}
