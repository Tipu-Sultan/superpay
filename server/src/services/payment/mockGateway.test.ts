import test from 'node:test';
import assert from 'node:assert/strict';
import { MOCK_PENDING_SETTLE_AFTER_MS, MockPaymentGateway } from './mockGateway';

const gateway = new MockPaymentGateway();
const base = { type: 'sent' as const, amountPaise: 10000 };

test('succeeds for ordinary recipients', async () => {
  const r = await gateway.authorize({ ...base, counterparty: { name: 'A', upiId: 'rahul@superpay' } });
  assert.equal(r.outcome, 'success');
  assert.match(r.referenceNo, /^\d{12}$/);
});

test('fails for upi ids containing "fail" and mobiles ending 0000', async () => {
  assert.equal((await gateway.authorize({ ...base, counterparty: { name: 'A', upiId: 'fail@superpay' } })).outcome, 'failed');
  assert.equal((await gateway.authorize({ ...base, counterparty: { name: 'A', mobile: '9000000000' } })).outcome, 'failed');
});

test('is pending for upi ids containing "pending" and mobiles ending 1111', async () => {
  assert.equal((await gateway.authorize({ ...base, counterparty: { name: 'A', upiId: 'pending@superpay' } })).outcome, 'pending');
  assert.equal((await gateway.authorize({ ...base, counterparty: { name: 'A', mobile: '9000001111' } })).outcome, 'pending');
});

test('pending payments settle only after the delay', async () => {
  const fresh = await gateway.checkPending({ txnId: 'x', createdAt: new Date(), referenceNo: '1', counterparty: { name: 'A' } });
  assert.equal(fresh.outcome, 'pending');
  const old = await gateway.checkPending({
    txnId: 'x', createdAt: new Date(Date.now() - MOCK_PENDING_SETTLE_AFTER_MS - 1000), referenceNo: '1', counterparty: { name: 'A' },
  });
  assert.equal(old.outcome, 'success');
});
