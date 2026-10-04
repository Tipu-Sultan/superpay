import { paiseToInputString, parseAmountToPaise } from './money';
import { isValidUpiId } from './validation';

/**
 * SuperPay's own QR payload (a prototype format):
 *   superpay://pay?pa=<upi id>&pn=<name>&am=<amount in rupees>&tn=<note>&cu=INR
 *
 * The parser also understands the common `upi://pay?...` layout so ordinary
 * UPI QR codes can be used to test the scanner. Scanning only pre-fills the
 * mock payment flow: nothing is ever sent to a real bank.
 */
export const QR_SCHEME = 'superpay://pay';

export interface QrPayload {
  upiId: string;
  name?: string;
  amountPaise?: number;
  note?: string;
}

export function buildPaymentQr(payload: QrPayload): string {
  const params: string[] = [`pa=${encodeURIComponent(payload.upiId)}`];
  if (payload.name) params.push(`pn=${encodeURIComponent(payload.name)}`);
  if (payload.amountPaise && payload.amountPaise > 0) params.push(`am=${paiseToInputString(payload.amountPaise)}`);
  if (payload.note) params.push(`tn=${encodeURIComponent(payload.note)}`);
  params.push('cu=INR');
  return `${QR_SCHEME}?${params.join('&')}`;
}

export type QrParseResult = { ok: true; payload: QrPayload } | { ok: false; reason: string };

function decode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

export function parsePaymentQr(raw: string): QrParseResult {
  const text = raw.trim();
  const lower = text.toLowerCase();
  if (!(lower.startsWith('superpay://pay') || lower.startsWith('upi://pay'))) {
    return { ok: false, reason: 'This QR code is not a SuperPay or UPI payment code.' };
  }

  const queryStart = text.indexOf('?');
  if (queryStart === -1) return { ok: false, reason: 'This payment code has no payee details.' };

  const params: Record<string, string> = {};
  for (const pair of text.slice(queryStart + 1).split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const key = decode(eq === -1 ? pair : pair.slice(0, eq)).toLowerCase();
    const value = eq === -1 ? '' : decode(pair.slice(eq + 1));
    params[key] = value;
  }

  const upiId = (params.pa ?? '').trim().toLowerCase();
  if (!isValidUpiId(upiId)) return { ok: false, reason: 'The payee in this QR code is not a valid UPI ID.' };
  if (params.cu && params.cu.toUpperCase() !== 'INR') return { ok: false, reason: 'Only INR payments are supported.' };

  const amountPaise = params.am ? parseAmountToPaise(params.am) ?? undefined : undefined;
  return {
    ok: true,
    payload: {
      upiId,
      name: params.pn?.trim() || undefined,
      amountPaise,
      note: params.tn?.trim() || undefined,
    },
  };
}
