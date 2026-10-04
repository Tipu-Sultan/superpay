import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/unused';
process.env.JWT_SECRET = 'test-secret-test-secret-123456';

let server: Server;
let base = '';

before(async () => {
  const { createApp } = await import('./app.js');
  server = createApp().listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
});
after(() => server.close());

const json = async (path: string, init?: RequestInit) => {
  const res = await fetch(base + path, { headers: { 'content-type': 'application/json' }, ...init });
  return { status: res.status, body: (await res.json()) as any };
};

test('health is public and reports db down without a connection', async () => {
  const { status, body } = await json('/health');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.simulated, true);
});

test('protected routes reject missing and invalid tokens', async () => {
  const none = await json('/wallet');
  assert.equal(none.status, 401);
  assert.equal(none.body.error.code, 'UNAUTHORIZED');
  const bad = await json('/wallet', { headers: { authorization: 'Bearer nope' } });
  assert.equal(bad.status, 401);
});

test('session validation errors use the error envelope', async () => {
  const { status, body } = await json('/auth/session', { method: 'POST', body: JSON.stringify({ name: 'A', mobile: '1' }) });
  assert.equal(status, 422);
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('malformed JSON and unknown routes are handled', async () => {
  const bad = await fetch(base + '/auth/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{oops' });
  assert.equal(bad.status, 400);
  const { signToken } = await import('./services/auth.service.js');
  const token = signToken('64b7f0f0f0f0f0f0f0f0f0f0');
  const missing = await json('/nope', { headers: { authorization: `Bearer ${token}` } });
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error.code, 'NOT_FOUND');
  const outside = await fetch(base.replace('/api', '') + '/anything');
  assert.equal(outside.status, 404);
});

test('a valid token passes auth and reaches validation (payments need a body)', async () => {
  const { signToken } = await import('./services/auth.service.js');
  const token = signToken('64b7f0f0f0f0f0f0f0f0f0f0');
  const res = await json('/payments/send', { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ amountPaise: -5 }) });
  assert.equal(res.status, 422);
  const config = await json('/payments/config', { headers: { authorization: `Bearer ${token}` } });
  assert.equal(config.status, 200);
  assert.equal(config.body.data.simulated, true);
  assert.equal(config.body.data.maxAmountPaise, 10000000);
});
