/**
 * WhatsApp Click-to-Chat link utilities.
 *
 * iOS/Safari does NOT auto-normalize local-format phone numbers (e.g.
 * "0811..."). The number MUST be in international format without the
 * leading zero: "62811...". This module centralises that logic so every
 * WA link in the codebase goes through the same normaliser.
 */

/** Strip non-digits, convert local ID format → international. */
export function normalizeWhatsAppNumber(raw: string): string {
  // 1. Strip everything that isn't a digit
  let digits = raw.replace(/\D/g, "");

  // 2. Already international with country code
  if (digits.startsWith("62")) return digits;

  // 3. Local format starting with 0 → replace 0 with 62
  if (digits.startsWith("0")) return "62" + digits.slice(1);

  // 4. Bare number starting with 8 (missing leading 0 or 62)
  if (digits.startsWith("8")) return "62" + digits;

  // 5. Fallback — return cleaned digits as-is (best effort)
  return digits;
}

/** Build a WhatsApp Click-to-Chat URL that works on both Android & iOS. */
export function buildWhatsAppLink(phone: string, text: string): string {
  const normalized = normalizeWhatsAppNumber(phone);
  return `https://api.whatsapp.com/send?phone=${normalized}&text=${encodeURIComponent(text)}`;
}
