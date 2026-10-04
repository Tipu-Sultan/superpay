import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidMobile, isValidUpiId, normalizeMobile, upiIdForMobile } from './validation';

test('mobile validation', () => {
  assert.equal(isValidMobile('9876543210'), true);
  assert.equal(isValidMobile('5876543210'), false);
  assert.equal(isValidMobile('98765'), false);
});

test('mobile normalisation strips +91 and 0 prefixes', () => {
  assert.equal(normalizeMobile('+91 98765 43210'), '9876543210');
  assert.equal(normalizeMobile('09876543210'), '9876543210');
  assert.equal(normalizeMobile('98765-43210'), '9876543210');
});

test('upi validation', () => {
  assert.equal(isValidUpiId('rahul.sharma@okbank'), true);
  assert.equal(isValidUpiId('9876543210@superpay'), true);
  assert.equal(isValidUpiId('no-at-sign'), false);
  assert.equal(isValidUpiId('a@b'), false);
  assert.equal(upiIdForMobile('9876543210'), '9876543210@superpay');
});
