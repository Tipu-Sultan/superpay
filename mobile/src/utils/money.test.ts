import test from 'node:test';
import assert from 'node:assert/strict';
import { formatINR, paiseToInputString, parseAmountToPaise, sanitizeAmountInput } from './money';

test('formatINR groups digits the Indian way', () => {
  assert.equal(formatINR(0), '\u20B90.00');
  assert.equal(formatINR(1254000), '\u20B912,540.00');
  assert.equal(formatINR(123456789), '\u20B912,34,567.89');
  assert.equal(formatINR(50000, { compact: true }), '\u20B9500');
  assert.equal(formatINR(50050, { compact: true }), '\u20B9500.50');
  assert.equal(formatINR(-50000), '-\u20B9500.00');
});

test('parseAmountToPaise handles valid and invalid text', () => {
  assert.equal(parseAmountToPaise('500'), 50000);
  assert.equal(parseAmountToPaise('1,234.5'), 123450);
  assert.equal(parseAmountToPaise('0.99'), 99);
  assert.equal(parseAmountToPaise('0'), null);
  assert.equal(parseAmountToPaise(''), null);
  assert.equal(parseAmountToPaise('12.345'), null);
  assert.equal(parseAmountToPaise('abc'), null);
});

test('sanitizeAmountInput keeps only a clean decimal', () => {
  assert.equal(sanitizeAmountInput('12a3'), '123');
  assert.equal(sanitizeAmountInput('1.2.3'), '1.23');
  assert.equal(sanitizeAmountInput('10.999'), '10.99');
  assert.equal(sanitizeAmountInput('007'), '7');
  assert.equal(sanitizeAmountInput('0.5'), '0.5');
  assert.equal(sanitizeAmountInput('123456789'), '1234567');
});

test('paiseToInputString round trips', () => {
  assert.equal(paiseToInputString(50000), '500');
  assert.equal(paiseToInputString(50050), '500.50');
  assert.equal(parseAmountToPaise(paiseToInputString(123405)), 123405);
});
