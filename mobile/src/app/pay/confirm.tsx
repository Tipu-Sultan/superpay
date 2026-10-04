import { Redirect, router } from 'expo-router';
import { SimulatedNotice } from '@/components/brand/SimulatedNotice';
import { PaymentSummary } from '@/components/payment/PaymentSummary';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useExecutePayment } from '@/hooks/useApiMutations';
import { isApiError } from '@/services/api/errors';
import { usePaymentFlow } from '@/store/PaymentFlowContext';
import { formatINR } from '@/utils/money';
import { haptics } from '@/utils/haptics';
import type { PaymentKind } from '@/types/payment';

const TITLE: Record<PaymentKind, string> = {
  send: 'Confirm payment',
  recharge: 'Confirm recharge',
  bill: 'Confirm bill payment',
  add_money: 'Confirm top-up',
};

const CTA: Record<PaymentKind, string> = { send: 'Pay', recharge: 'Pay', bill: 'Pay', add_money: 'Add' };

/**
 * One confirmation screen for every payment kind. It only describes the draft
 * and hands it to the payment service; it never touches balances itself.
 */
export default function ConfirmScreen() {
  const flow = usePaymentFlow();
  const pay = useExecutePayment();
  const draft = flow.draft;

  if (!draft) return <Redirect href="/" />;

  const submit = async () => {
    try {
      await pay.mutateAsync(draft);
      router.replace('/pay/result');
    } catch (error) {
      if (isApiError(error) && error.code === 'INSUFFICIENT_BALANCE') haptics.warning();
      else haptics.error();
      // The error is rendered below from `pay.error`.
    }
  };

  const error = pay.error;
  const insufficient = isApiError(error) && error.code === 'INSUFFICIENT_BALANCE';

  return (
    <Screen
      title={TITLE[draft.kind]}
      footer={
        <>
          <Button label={`${CTA[draft.kind]} ${formatINR(draft.amountPaise, { compact: true })}`} onPress={submit} loading={pay.isPending} />
          <SimulatedNotice compact />
        </>
      }
    >
      <PaymentSummary summary={draft.summary} amountPaise={draft.amountPaise} />
      {error ? (
        <Banner
          tone={insufficient ? 'warning' : 'error'}
          title={insufficient ? 'Not enough balance' : "Payment didn't go through"}
          message={error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
          actionLabel={insufficient ? 'Add money' : undefined}
          onAction={insufficient ? () => router.push('/add-money') : undefined}
        />
      ) : null}
    </Screen>
  );
}
