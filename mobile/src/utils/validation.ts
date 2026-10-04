export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,32}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidMobile = (value: string) => MOBILE_REGEX.test(value);
export const isValidUpiId = (value: string) => UPI_ID_REGEX.test(value.trim());
export const isValidEmail = (value: string) => EMAIL_REGEX.test(value.trim());

/** "+91 98765 43210" / "098765-43210" -> "9876543210" */
export function normalizeMobile(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

/** Input mask while typing: digits only, max 10. */
export const sanitizeMobileInput = (text: string) => text.replace(/\D/g, '').slice(0, 10);

/** 98765 43210 */
export function formatMobile(mobile: string): string {
  return mobile.length === 10 ? `${mobile.slice(0, 5)} ${mobile.slice(5)}` : mobile;
}

export function maskMobile(mobile: string): string {
  return mobile.length === 10 ? `${mobile.slice(0, 2)}XXXXXX${mobile.slice(-2)}` : mobile;
}

/** What kind of recipient is this free-text search? Used by the recipient picker. */
export function classifyRecipientQuery(query: string): 'mobile' | 'upi' | 'text' {
  const trimmed = query.trim();
  if (isValidMobile(normalizeMobile(trimmed))) return 'mobile';
  if (isValidUpiId(trimmed)) return 'upi';
  return 'text';
}
