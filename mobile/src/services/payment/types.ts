export type { PaymentConfig, PaymentResponse } from '@/types/api';

export type RecipientSelectionPayload =
  | { kind: 'contact'; contactId: string }
  | { kind: 'mobile'; mobile: string; name?: string }
  | { kind: 'upi'; upiId: string; name?: string };
