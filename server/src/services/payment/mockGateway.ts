import { generateReferenceNo } from '../../utils/ids';
import type {
  GatewayRequest,
  GatewayResult,
  GatewaySettleRequest,
  PaymentGateway,
} from './gateway';

/** A pending payment becomes final once it is at least this old (so "Refresh status" is demonstrable). */
export const MOCK_PENDING_SETTLE_AFTER_MS = 10_000;

/**
 * Simulated gateway. NO real money moves and no external system is contacted.
 *
 * Deterministic rules so every state can be tested:
 *  - UPI id contains "fail"       -> failed
 *  - UPI id contains "pending"    -> pending (settles successfully after ~10s)
 *  - mobile number ends in 0000   -> failed
 *  - mobile number ends in 1111   -> pending
 *  - everything else              -> success
 */
export class MockPaymentGateway implements PaymentGateway {
  readonly name = 'mock';

  async authorize(request: GatewayRequest): Promise<GatewayResult> {
    await delay(350); // feels like a network call, keeps loading states visible
    const referenceNo = generateReferenceNo();
    const { upiId, mobile } = request.counterparty;
    const upi = upiId?.toLowerCase() ?? '';

    if (upi.includes('fail') || mobile?.endsWith('0000')) {
      return { outcome: 'failed', referenceNo, reason: 'Declined by the simulated bank. No money was moved.' };
    }
    if (upi.includes('pending') || mobile?.endsWith('1111')) {
      return { outcome: 'pending', referenceNo, reason: 'Waiting for the simulated bank to confirm.' };
    }
    return { outcome: 'success', referenceNo };
  }

  async checkPending(request: GatewaySettleRequest): Promise<GatewayResult> {
    await delay(200);
    const age = Date.now() - request.createdAt.getTime();
    if (age < MOCK_PENDING_SETTLE_AFTER_MS) {
      return {
        outcome: 'pending',
        referenceNo: request.referenceNo,
        reason: 'Still processing. Check again in a few seconds.',
      };
    }
    return { outcome: 'success', referenceNo: request.referenceNo };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
