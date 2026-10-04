import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { QuickAmountChips } from '@/components/payment/QuickAmountChips';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { AmountInput } from '@/components/ui/AmountInput';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { NOTE_MAX_LENGTH } from '@/config/constants';
import { useAmountLimits, useWallet } from '@/hooks/useApiQueries';
import { usePaymentFlow } from '@/store/PaymentFlowContext';
import { spacing } from '@/theme';
import type { SendDraft } from '@/types/payment';
import { newIdempotencyKey } from '@/utils/id';
import { formatINR, paiseToInputString, parseAmountToPaise } from '@/utils/money';
import { describeRecipient } from '@/utils/recipient';

export default function SendAmountScreen() {
  const flow = usePaymentFlow();
  const wallet = useWallet();
  const { minPaise, maxPaise } = useAmountLimits();
  const pending = flow.pendingTransfer;

  const [amountText, setAmountText] = useState(pending?.prefillAmountPaise ? paiseToInputString(pending.prefillAmountPaise) : '');
  const [note, setNote] = useState(pending?.prefillNote ?? '');

  if (!pending) return <Redirect href="/send/recipient" />;

  const display = describeRecipient(pending.recipient);
  const amountPaise = parseAmountToPaise(amountText);
  const balance = wallet.data?.balancePaise;

  let error: string | null = null;
  if (amountText && amountPaise === null) error = 'Enter a valid amount';
  else if (amountPaise !== null && amountPaise < minPaise) error = `Minimum amount is ${formatINR(minPaise, { compact: true })}`;
  else if (amountPaise !== null && amountPaise > maxPaise) error = `You can send up to ${formatINR(maxPaise, { compact: true })} at a time`;

  const insufficient = amountPaise !== null && balance !== undefined && amountPaise > balance;
  const canContinue = amountPaise !== null && !error && !insufficient;

  const next = () => {
    if (!canContinue || amountPaise === null) return;
    const rows = [
      { label: pending.recipient.kind === 'upi' ? 'UPI ID' : 'Mobile number', value: display.detail },
      { label: 'Payment method', value: 'SuperPay balance' },
    ];
    if (note.trim()) rows.push({ label: 'Note', value: note.trim() });
    const draft: SendDraft = {
      kind: 'send',
      recipient: pending.recipient,
      amountPaise,
      note: note.trim(),
      idempotencyKey: newIdempotencyKey(),
      summary: { headline: `Paying ${display.name}`, subline: display.detail, avatarName: display.name, avatarColor: display.color, rows },
    };
    flow.setDraft(draft);
    router.push('/pay/confirm');
  };

  return (
    <Screen
      title="Enter amount"
      contentStyle={styles.content}
      footer={<Button label="Continue" onPress={next} disabled={!canContinue} />}
    >
      <View style={styles.payee}>
        <Avatar name={display.name} color={display.color} size={56} />
        <AppText variant="title3" align="center">{display.name}</AppText>
        <AppText variant="caption" color="textTertiary">{display.detail}</AppText>
      </View>

      <AmountInput value={amountText} onChangeText={setAmountText} autoFocus error={error} />
      <QuickAmountChips value={amountText} onPick={setAmountText} />

      <AppText variant="caption" color="textTertiary" align="center">
        Balance {balance === undefined ? '...' : formatINR(balance)}
      </AppText>

      {insufficient ? (
        <Banner tone="warning" title="Not enough balance" message={`You need ${formatINR((amountPaise ?? 0) - (balance ?? 0))} more to send this.`} actionLabel="Add money" onAction={() => router.push('/add-money')} />
      ) : null}

      <TextField placeholder="Add a note (optional)" icon="create-outline" value={note} onChangeText={setNote} maxLength={NOTE_MAX_LENGTH} returnKeyType="done" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingTop: spacing.lg },
  payee: { alignItems: 'center', gap: spacing.xs },
});
