import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPaymentQr, parsePaymentQr } from './qr';

test('build and parse round trip', () => {
  const raw = buildPaymentQr({ upiId: '9000000102@superpay', name: 'Priya Nair', amountPaise: 25050, note: 'Dinner & drinks' });
  const parsed = parsePaymentQr(raw);
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.deepEqual(parsed.payload, { upiId: '9000000102@superpay', name: 'Priya Nair', amountPaise: 25050, note: 'Dinner & drinks' });
  }
});

test('accepts standard upi:// links', () => {
  const parsed = parsePaymentQr('upi://pay?pa=shop@okbank&pn=Corner+Shop&am=120.00&cu=INR');
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.payload.name, 'Corner Shop');
    assert.equal(parsed.payload.amountPaise, 12000);
  }
});

test('rejects non payment, invalid payee and foreign currency codes', () => {
  assert.equal(parsePaymentQr('https://example.com').ok, false);
  assert.equal(parsePaymentQr('superpay://pay?pa=not-a-upi').ok, false);
  assert.equal(parsePaymentQr('upi://pay?pa=a@bank&cu=USD').ok, false);
  assert.equal(parsePaymentQr('upi://pay').ok, false);
});
