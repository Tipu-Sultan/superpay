/** Indian mobile numbers: 10 digits starting with 6-9. */
export const MOBILE_REGEX = /^[6-9]\d{9}$/;
/** Simplified UPI virtual payment address: handle@provider. */
export const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,32}$/;

export const isValidMobile = (v: string) => MOBILE_REGEX.test(v);
export const isValidUpiId = (v: string) => UPI_ID_REGEX.test(v);

/** Normalises "+91 98765 43210" / "098765-43210" to 9876543210. */
export function normalizeMobile(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

/** Each user gets a UPI-style id derived from their mobile. It is NOT a real, registered UPI handle. */
export const SUPERPAY_HANDLE = 'superpay';
export const upiIdForMobile = (mobile: string) => `${mobile}@${SUPERPAY_HANDLE}`;
