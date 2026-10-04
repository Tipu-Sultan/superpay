/** All money in the app is an integer number of paise. Rupees only exist at the text-input boundary. */

export const RUPEE = '\u20B9';

/** 1234567.5 rupees -> "12,34,567.50" using Indian digit grouping (no Intl dependency). */
export function formatNumberIN(paise: number, withFraction = true): string {
  const abs = Math.abs(Math.round(paise));
  const rupees = Math.floor(abs / 100).toString();
  const fraction = (abs % 100).toString().padStart(2, '0');
  const last3 = rupees.slice(-3);
  const rest = rupees.slice(0, -3);
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3;
  return withFraction ? `${grouped}.${fraction}` : grouped;
}

/** Formats paise as "₹12,540.00". Whole-rupee amounts can drop the fraction with `compact`. */
export function formatINR(paise: number, options: { compact?: boolean; signed?: boolean } = {}): string {
  const { compact = false, signed = false } = options;
  const isWhole = paise % 100 === 0;
  const body = formatNumberIN(paise, !(compact && isWhole));
  const sign = paise < 0 ? '-' : signed && paise > 0 ? '+' : '';
  return `${sign}${RUPEE}${body}`;
}

/** Text typed by the user -> paise. Returns null for empty / invalid input. */
export function parseAmountToPaise(text: string): number | null {
  const cleaned = text.replace(/,/g, '').trim();
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const [whole = '0', frac = ''] = cleaned.split('.');
  const paise = Number(whole) * 100 + Number(frac.padEnd(2, '0'));
  return Number.isFinite(paise) && paise > 0 ? paise : null;
}

/** Keeps only digits and one decimal point, max 2 decimals, max 7 integer digits. */
export function sanitizeAmountInput(text: string): string {
  let out = text.replace(/[^\d.]/g, '');
  const firstDot = out.indexOf('.');
  if (firstDot !== -1) {
    out = out.slice(0, firstDot + 1) + out.slice(firstDot + 1).replace(/\./g, '');
    const [whole = '', frac = ''] = out.split('.');
    out = `${whole.slice(0, 7)}.${frac.slice(0, 2)}`;
  } else {
    out = out.slice(0, 7);
  }
  // No leading zeros like "007" (but keep "0" and "0.5").
  out = out.replace(/^0+(?=\d)/, '');
  return out;
}

export function paiseToInputString(paise: number): string {
  const whole = Math.floor(paise / 100);
  const frac = paise % 100;
  return frac === 0 ? String(whole) : `${whole}.${String(frac).padStart(2, '0')}`;
}

export const rupeesToPaise = (rupees: number): number => Math.round(rupees * 100);
