import test from 'node:test';
import assert from 'node:assert/strict';
import { formatINR, rupeesToPaise } from './money';

test('formatINR uses Indian digit grouping', () => {
  assert.equal(formatINR(0), '\u20B90.00');
  assert.equal(formatINR(99), '\u20B90.99');
  assert.equal(formatINR(50000), '\u20B9500.00');
  assert.equal(formatINR(123456), '\u20B91,234.56');
  assert.equal(formatINR(1254000), '\u20B912,540.00');
  assert.equal(formatINR(123456789), '\u20B912,34,567.89');
  assert.equal(formatINR(1000000000), '\u20B91,00,00,000.00'); // 1 crore
  assert.equal(formatINR(-50000), '-\u20B9500.00');
});

test('rupeesToPaise avoids floating point drift', () => {
  assert.equal(rupeesToPaise(0.1 + 0.2), 30);
  assert.equal(rupeesToPaise(199), 19900);
  assert.equal(rupeesToPaise(1234.56), 123456);
});
