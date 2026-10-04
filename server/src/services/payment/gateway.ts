import type { TransactionType } from '../../models/constants';

export type GatewayOutcome = 'success' | 'pending' | 'failed';

export interface GatewayRequest {
  type: TransactionType;
  amountPaise: number;
  counterparty: { name: string; mobile?: string; upiId?: string };
  idempotencyKey?: string;
}

export interface GatewayResult {
  outcome: GatewayOutcome;
  /** Bank / gateway reference number. */
  referenceNo: string;
  /** Human readable reason, set for failed (and sometimes pending) outcomes. */
  reason?: string;
}

export interface GatewaySettleRequest {
  txnId: string;
  createdAt: Date;
  referenceNo: string;
  counterparty: { name: string; mobile?: string; upiId?: string };
}

/**
 * The seam where a real PSP / UPI / BBPS integration plugs in.
 *
 * To go live: implement this interface (e.g. `RazorpayGateway`,
 * `CashfreeGateway`, a bank's UPI switch) and return it from
 * `getPaymentGateway()`. Nothing else in the codebase needs to change: the
 * payment service, controllers and the mobile app only know about this contract.
 */
export interface PaymentGateway {
  readonly name: string;
  /** Ask the gateway to execute a payment. */
  authorize(request: GatewayRequest): Promise<GatewayResult>;
  /** Re-check a payment that was previously reported as pending. */
  checkPending(request: GatewaySettleRequest): Promise<GatewayResult>;
}
