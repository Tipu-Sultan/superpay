import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { PaymentResponse } from '@/types/api';
import type { PaymentDraft, PendingTransfer } from '@/types/payment';
import { newIdempotencyKey } from '@/utils/id';

/**
 * Holds the in-progress payment across screens:
 *   pendingTransfer -> (amount screen) -> draft -> (confirm screen) -> result
 * Screens never mutate balances; they only describe intent here and call services.
 */
interface PaymentFlowValue {
  pendingTransfer: PendingTransfer | null;
  draft: PaymentDraft | null;
  result: PaymentResponse | null;
  startTransfer: (transfer: PendingTransfer) => void;
  setDraft: (draft: PaymentDraft) => void;
  setResult: (result: PaymentResponse) => void;
  /** After a failed attempt, a retry must not reuse the old idempotency key. */
  renewIdempotencyKey: () => void;
  reset: () => void;
}

const PaymentFlowContext = createContext<PaymentFlowValue | null>(null);

export function PaymentFlowProvider({ children }: { children: ReactNode }) {
  const [pendingTransfer, setPendingTransfer] = useState<PendingTransfer | null>(null);
  const [draft, setDraftState] = useState<PaymentDraft | null>(null);
  const [result, setResultState] = useState<PaymentResponse | null>(null);

  const startTransfer = useCallback((transfer: PendingTransfer) => {
    setPendingTransfer(transfer);
    setDraftState(null);
    setResultState(null);
  }, []);

  const setDraft = useCallback((next: PaymentDraft) => {
    setDraftState(next);
    setResultState(null);
  }, []);

  const renewIdempotencyKey = useCallback(() => {
    setDraftState((current) => (current ? { ...current, idempotencyKey: newIdempotencyKey() } : current));
    setResultState(null);
  }, []);

  const reset = useCallback(() => {
    setPendingTransfer(null);
    setDraftState(null);
    setResultState(null);
  }, []);

  const value = useMemo<PaymentFlowValue>(
    () => ({ pendingTransfer, draft, result, startTransfer, setDraft, setResult: setResultState, renewIdempotencyKey, reset }),
    [pendingTransfer, draft, result, startTransfer, setDraft, renewIdempotencyKey, reset],
  );

  return <PaymentFlowContext.Provider value={value}>{children}</PaymentFlowContext.Provider>;
}

export function usePaymentFlow(): PaymentFlowValue {
  const ctx = useContext(PaymentFlowContext);
  if (!ctx) throw new Error('usePaymentFlow must be used inside <PaymentFlowProvider>');
  return ctx;
}
