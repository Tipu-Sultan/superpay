import type { PaymentGateway } from './gateway';
import { MockPaymentGateway } from './mockGateway';

let gateway: PaymentGateway | undefined;

/** Single place that decides which gateway implementation is active. */
export function getPaymentGateway(): PaymentGateway {
  if (!gateway) gateway = new MockPaymentGateway();
  return gateway;
}

export * from './gateway';
