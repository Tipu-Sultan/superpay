import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyRecipientQuery, normalizeMobile, isValidUpiId } from './validation';

test('classifyRecipientQuery', () => {
  assert.equal(classifyRecipientQuery('9876543210'), 'mobile');
  assert.equal(classifyRecipientQuery('+91 98765 43210'), 'mobile');
  assert.equal(classifyRecipientQuery('rahul@okbank'), 'upi');
  assert.equal(classifyRecipientQuery('Rahul'), 'text');
  assert.equal(classifyRecipientQuery('12345'), 'text');
});

test('normalizeMobile and upi', () => {
  assert.equal(normalizeMobile('098765-43210'), '9876543210');
  assert.equal(isValidUpiId('a@b'), false);
});
