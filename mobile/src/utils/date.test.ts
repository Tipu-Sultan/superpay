import test from 'node:test';
import assert from 'node:assert/strict';
import { dayLabel, dueLabel, formatTime, greetingFor } from './date';

const now = new Date(2026, 9, 4, 15, 30); // 4 Oct 2026, 3:30 PM

test('dayLabel', () => {
  assert.equal(dayLabel(new Date(2026, 9, 4, 1, 0), now), 'Today');
  assert.equal(dayLabel(new Date(2026, 9, 3, 23, 0), now), 'Yesterday');
  assert.equal(dayLabel(new Date(2026, 8, 20), now), 'Sun, 20 Sep');
});

test('formatTime uses a 12 hour clock', () => {
  assert.equal(formatTime(new Date(2026, 0, 1, 0, 5)), '12:05 AM');
  assert.equal(formatTime(new Date(2026, 0, 1, 12, 0)), '12:00 PM');
  assert.equal(formatTime(new Date(2026, 0, 1, 16, 32)), '4:32 PM');
});

test('greetingFor and dueLabel', () => {
  assert.equal(greetingFor(new Date(2026, 0, 1, 9)), 'Good morning');
  assert.equal(greetingFor(new Date(2026, 0, 1, 18)), 'Good evening');
  assert.equal(dueLabel(new Date(2026, 9, 9), now), 'Due in 5 days');
  assert.equal(dueLabel(new Date(2026, 9, 2), now), '2 days overdue');
});
