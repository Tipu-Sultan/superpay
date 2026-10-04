import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SimulatedNotice } from '@/components/brand/SimulatedNotice';
import { QuickAmountChips } from '@/components/payment/QuickAmountChips';
import { AmountInput } from '@/components/ui/AmountInput';
import { AppText } from '@/components/ui/AppText';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { IconCircle } from '@/components/ui/IconCircle';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAmountLimits, usePaymentConfig, useWallet } from '@/hooks/useApiQueries';
import { errorMessage } from '@/services/api/errors';
import { usePaymentFlow } from '@/store/PaymentFlowContext';
import { colors, spacing } from '@/theme';
import type { FundingSource } from '@/types/api';
import type { AddMoneyDraft } from '@/types/payment';
import { haptics } from '@/utils/haptics';
import { newIdempotencyKey } from '@/utils/id';
import { formatINR, parseAmountToPaise } from '@/utils/money';

export default function AddMoneyScreen() {
  const flow = usePaymentFlow();
  const config = usePaymentConfig();
  const wallet = useWallet();
  const { minPaise, maxPaise } = useAmountLimits();
  const [amountText, setAmountText] = useState('');
  const [sourceId, setSourceId] = useState<string | undefined>();

  const sources = config.data?.fundingSources ?? [];
  const selected: FundingSource | undefined = sources.find((s) => s.id === sourceId) ?? sources[0];
  const amountPaise = parseAmountToPaise(amountText);

  let error: string | null = null;
  if (amountText && amountPaise === null) error = 'Enter a valid amount';
  else if (amountPaise !== null && amountPaise < minPaise) error = `Minimum is ${formatINR(minPaise, { compact: true })}`;
  else if (amountPaise !== null && amountPaise > maxPaise) error = `You can add up to ${formatINR(maxPaise, { compact: true })} at a time`;

  const canContinue = amountPaise !== null && !error && Boolean(selected);

  const next = () => {
    if (!canContinue || amountPaise === null || !selected) return;
    const draft: AddMoneyDraft = {
      kind: 'add_money',
      amountPaise,
      sourceId: selected.id,
      idempotencyKey: newIdempotencyKey(),
      summary: {
        headline: 'Add money to SuperPay',
        subline: `${selected.name} ${selected.masked}`,
        avatarName: 'SuperPay',
        avatarColor: colors.primary,
        rows: [
          { label: 'From', value: `${selected.name} ${selected.masked}` },
          { label: 'To', value: 'SuperPay balance' },
          { label: 'Balance after', value: formatINR((wallet.data?.balancePaise ?? 0) + amountPaise) },
        ],
      },
    };
    flow.setDraft(draft);
    router.push('/pay/confirm');
  };

  return (
    <Screen title="Add money" contentStyle={styles.content} footer={<Button label="Continue" onPress={next} disabled={!canContinue} />}>
      <View style={styles.amount}>
        <AppText variant="caption" color="textTertiary">Current balance {wallet.data ? formatINR(wallet.data.balancePaise) : '...'}</AppText>
        <AmountInput value={amountText} onChangeText={setAmountText} autoFocus error={error} />
        <QuickAmountChips value={amountText} onPick={setAmountText} />
      </View>

      <View style={styles.sources}>
        <AppText variant="title3">Add from</AppText>
        {config.isLoading ? (
          <Skeleton height={64} rounded={16} />
        ) : config.isError ? (
          <ErrorState message={errorMessage(config.error)} onRetry={() => void config.refetch()} />
        ) : (
          <Card padded={false}>
            {sources.map((s, i) => {
              const isSelected = s.id === selected?.id;
              return (
                <View key={s.id}>
                  {i > 0 ? <Divider inset={72} /> : null}
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      haptics.tap();
                      setSourceId(s.id);
                    }}
                    style={styles.source}
                  >
                    <IconCircle icon="business-outline" tone="brand" />
                    <View style={styles.sourceText}>
                      <AppText variant="bodyStrong">{s.name}</AppText>
                      <AppText variant="caption" color="textTertiary">{s.masked} · Simulated</AppText>
                    </View>
                    <Icon name={isSelected ? 'radio-button-on' : 'radio-button-off'} size={22} color={isSelected ? colors.primary : colors.borderStrong} />
                  </Pressable>
                </View>
              );
            })}
          </Card>
        )}
      </View>

      <Banner tone="info" message="No card number, UPI PIN, CVV or OTP is needed. This top-up is simulated and no bank is contacted." />
      <SimulatedNotice compact />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingTop: spacing.lg },
  amount: { alignItems: 'center', gap: spacing.lg },
  sources: { gap: spacing.md },
  source: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, minHeight: 72 },
  sourceText: { flex: 1, gap: 2 },
});
