import { useCallback, useEffect, useState } from 'react';
import { Animated, BackHandler, Share, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SimulatedNotice } from '@/components/brand/SimulatedNotice';
import { DetailRow } from '@/components/transactions/DetailRow';
import { AppText } from '@/components/ui/AppText';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { useRefreshTransaction } from '@/hooks/useApiMutations';
import { goHome, openTransaction } from '@/lib/navigation';
import { errorMessage } from '@/services/api/errors';
import { usePaymentFlow } from '@/store/PaymentFlowContext';
import { useToast } from '@/store/ToastContext';
import { colors, radius, spacing } from '@/theme';
import type { TransactionStatus } from '@/types/api';
import { formatDate, formatTime } from '@/utils/date';
import { haptics } from '@/utils/haptics';
import { formatINR } from '@/utils/money';
import { counterpartyLabel } from '@/utils/transaction';

const HERO: Record<TransactionStatus, { icon: IconName; bg: string; fg: string; title: string }> = {
  success: { icon: 'checkmark', bg: colors.success, fg: colors.textOnBrand, title: 'Payment successful' },
  pending: { icon: 'time-outline', bg: colors.warning, fg: colors.textOnBrand, title: 'Payment pending' },
  failed: { icon: 'close', bg: colors.danger, fg: colors.textOnBrand, title: 'Payment failed' },
};

export default function PaymentResultScreen() {
  const flow = usePaymentFlow();
  const refresh = useRefreshTransaction();
  const toast = useToast();
  const result = flow.result;
  const [scale] = useState(() => new Animated.Value(0.6));

  const done = useCallback(() => {
    flow.reset();
    goHome();
  }, [flow]);

  // Android back on the result screen goes Home instead of back into the confirmation.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        done();
        return true;
      });
      return () => sub.remove();
    }, [done]),
  );

  const status = result?.transaction.status;
  useEffect(() => {
    if (!status) return;
    if (status === 'success') haptics.success();
    else if (status === 'failed') haptics.error();
    scale.setValue(0.6);
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
  }, [status, scale]);

  useEffect(() => {
    if (!result) goHome();
  }, [result]);
  if (!result) return null;

  const txn = result.transaction;
  const hero = HERO[txn.status];

  const checkAgain = async () => {
    try {
      const response = await refresh.mutateAsync(txn.id);
      flow.setResult(response);
      if (response.transaction.status === 'pending') toast.show('Still pending. Try again in a few seconds.');
    } catch (error) {
      toast.show(errorMessage(error), 'error');
    }
  };

  const retry = () => {
    flow.renewIdempotencyKey();
    router.replace('/pay/confirm');
  };

  const share = () =>
    void Share.share({
      message: `SuperPay (simulated) receipt\n${formatINR(txn.amountPaise)} to ${txn.counterparty.name}\nTransaction ID: ${txn.txnId}\n${formatDate(txn.createdAt)}, ${formatTime(txn.createdAt)}`,
    });

  return (
    <Screen
      noHeader
      contentStyle={styles.content}
      footer={
        <>
          {txn.status === 'failed' ? <Button label="Try again" onPress={retry} variant="accent" /> : null}
          {txn.status === 'pending' ? <Button label="Check status" onPress={checkAgain} loading={refresh.isPending} variant="accent" /> : null}
          <View style={styles.footerRow}>
            <Button label="View transaction" onPress={() => openTransaction(txn.id)} variant="secondary" style={styles.flex} />
            <Button label="Done" onPress={done} style={styles.flex} />
          </View>
        </>
      }
    >
      <View style={styles.hero}>
        <Animated.View style={[styles.badge, { backgroundColor: hero.bg, transform: [{ scale }] }]}>
          <Icon name={hero.icon} size={44} color={hero.fg} />
        </Animated.View>
        <AppText variant="title1" align="center" accessibilityRole="header" accessibilityLiveRegion="polite">{hero.title}</AppText>
        <AppText variant="display" style={{ fontVariant: ['tabular-nums'] }}>{formatINR(txn.amountPaise)}</AppText>
        <AppText color="textSecondary" align="center">
          {txn.status === 'success'
            ? `${txn.type === 'add_money' ? 'Added from' : 'Sent to'} ${txn.counterparty.name}`
            : txn.status === 'pending'
              ? `Waiting for confirmation from ${txn.counterparty.name}`
              : `Could not pay ${txn.counterparty.name}`}
        </AppText>
      </View>

      {txn.status === 'failed' ? <Banner tone="error" title="Why it failed" message={txn.failureReason ?? 'The payment was declined. No money was moved.'} /> : null}
      {txn.status === 'pending' ? <Banner tone="warning" title="Your balance hasn't changed yet" message={txn.failureReason ?? 'We will update this payment as soon as it is confirmed.'} /> : null}

      <Card>
        <DetailRow label="Transaction ID" value={txn.txnId} copyable />
        <Divider />
        <DetailRow label={counterpartyLabel(txn)} value={txn.counterparty.name} />
        <Divider />
        <DetailRow label="Date" value={formatDate(txn.createdAt)} />
        <Divider />
        <DetailRow label="Time" value={formatTime(txn.createdAt)} />
        <Divider />
        <DetailRow label="New balance" value={formatINR(result.wallet.balancePaise)} />
      </Card>

      <View style={styles.links}>
        <Button label="Share receipt" icon="share-social-outline" variant="ghost" size="md" onPress={share} />
      </View>
      <SimulatedNotice />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingTop: spacing.xxxl },
  hero: { alignItems: 'center', gap: spacing.sm },
  badge: { width: 88, height: 88, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  footerRow: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  links: { alignItems: 'center' },
});
