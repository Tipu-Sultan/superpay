import { api } from '@/services/api/client';
import { billService } from '@/services/bills/billService';
import { rechargeService } from '@/services/recharge/rechargeService';
import { walletService } from '@/services/wallet/walletService';
import type { PaymentConfig, PaymentResponse, RecipientSelectionPayload } from './types';
import type { PaymentDraft, RecipientSelection } from '@/types/payment';

/** Converts what the UI picked into the API's recipient shape. */
export function toRecipientPayload(recipient: RecipientSelection): RecipientSelectionPayload {
  switch (recipient.kind) {
    case 'contact':
      return { kind: 'contact', contactId: recipient.contact.id };
    case 'mobile':
      return { kind: 'mobile', mobile: recipient.mobile, name: recipient.name };
    case 'upi':
      return { kind: 'upi', upiId: recipient.upiId, name: recipient.name };
  }
}

export const paymentService = {
  getConfig: () => api.get<PaymentConfig>('/payments/config'),

  send: (input: { recipient: RecipientSelection; amountPaise: number; note?: string; idempotencyKey: string }) =>
    api.post<PaymentResponse>('/payments/send', {
      recipient: toRecipientPayload(input.recipient),
      amountPaise: input.amountPaise,
      note: input.note?.trim() || undefined,
      idempotencyKey: input.idempotencyKey,
    }),

  /**
   * One entry point for every kind of payment. The UI hands over a draft and
   * gets a result, so swapping the backend/gateway never touches a screen.
   */
  execute(draft: PaymentDraft): Promise<PaymentResponse> {
    switch (draft.kind) {
      case 'send':
        return paymentService.send({
          recipient: draft.recipient,
          amountPaise: draft.amountPaise,
          note: draft.note,
          idempotencyKey: draft.idempotencyKey,
        });
      case 'recharge':
        return rechargeService.pay({
          mobile: draft.mobile,
          operatorId: draft.operatorId,
          circleId: draft.circleId,
          planId: draft.planId,
          idempotencyKey: draft.idempotencyKey,
        });
      case 'bill':
        return billService.pay({
          billerId: draft.billerId,
          accountNumber: draft.accountNumber,
          idempotencyKey: draft.idempotencyKey,
        });
      case 'add_money':
        return walletService.addMoney({
          sourceId: draft.sourceId,
          amountPaise: draft.amountPaise,
          idempotencyKey: draft.idempotencyKey,
        });
    }
  },
};
