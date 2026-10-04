import { Share, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SimulatedNotice } from '@/components/brand/SimulatedNotice';
import { DetailRow } from '@/components/transactions/DetailRow';
import { AppText } from '@/components/ui/AppText';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { ErrorState } from '@/components/ui/ErrorState';
import { IconCircle, type IconTone } from '@/components/ui/IconCircle';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useRefreshTransaction } from '@/hooks/useApiMutations';
import { useTransaction } from '@/hooks/useApiQueries';
import { errorMessage } from '@/services/api/errors';
import { useToast } from '@/store/ToastContext';
import { spacing } from '@/theme';
import type { Transaction } from '@/types/api';
import { formatDate, formatTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { TYPE_ICON, TYPE_LABEL, counterpartyLabel, isCredit, metaRows, paymentMethodLabel } from '@/utils/transaction';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useTransaction(String(id ?? ''));
  const refresh = useRefreshTransaction();
  const toast = useToast();

  const checkStatus = async (txn: Transaction) => {
    try {
      const res = await refresh.mutateAsync(txn.id);
      toast.show(res.transaction.status === 'pending' ? 'Still pending. Try again in a few seconds.' : res.transaction.status === 'success' ? 'Payment confirmed' : 'Payment failed', res.transaction.status === 'success' ? 'success' : 'neutral');
    } catch (error) {
      toast.show(errorMessage(error), 'error');
    }
  };

  const share = (t: Transaction) =>
    void Share.share({
      message: `SuperPay (simulated) receipt\n${TYPE_LABEL[t.type]}: ${formatINR(t.amountPaise)}\n${counterpartyLabel(t)}: ${t.counterparty.name}\nStatus: ${t.status}\nTransaction ID: ${t.txnId}\nReference: ${t.referenceNo}\n${formatDate(t.createdAt)}, ${formatTime(t.createdAt)}`,
    });

  if (query.isLoading) {
    return (
      <Screen title="Transaction">
        <View style={styles.skeleton}><Skeleton width={64} height={64} rounded={32} /><Skeleton width={160} height={36} /><Skeleton height={220} rounded={20} /></View>
      </Screen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Screen title="Transaction">
        <ErrorState title="Transaction not found" message={errorMessage(query.error, 'We could not load this transaction.')} onRetry={() => void query.refetch()} />
      </Screen>
    );
  }

  const txn = query.data;
  const tone: IconTone = txn.status === 'failed' ? 'danger' : txn.status === 'pending' ? 'warning' : isCredit(txn) ? 'success' : 'brand';
  const extra = metaRows(txn);

  return (
    <Screen
      title="Transaction"
      contentStyle={styles.content}
      refreshing={query.isRefetching}
      onRefresh={() => void query.refetch()}
      footer={
        txn.status === 'pending' ? (
          <Button label="Check status" variant="accent" onPress={() => checkStatus(txn)} loading={refresh.isPending} />
        ) : (
          <Button label="Share receipt" icon="share-social-outline" variant="secondary" onPress={() => share(txn)} />
        )
      }
    >
      <View style={styles.hero}>
        <IconCircle icon={TYPE_ICON[txn.type]} tone={tone} size={64} shape="circle" />
        <AppText variant="display" style={{ fontVariant: ['tabular-nums'] }}>{`${isCredit(txn) ? '+' : '-'}${formatINR(txn.amountPaise).replace('-', '')}`}</AppText>
        <AppText color="textSecondary">{TYPE_LABEL[txn.type]}</AppText>
        <StatusBadge status={txn.status} />
      </View>

      {txn.status === 'failed' ? <Banner tone="error" title="Why it failed" message={txn.failureReason ?? 'The payment was declined. No money was moved.'} /> : null}
      {txn.status === 'pending' ? <Banner tone="warning" title="Waiting for confirmation" message={txn.failureReason ?? 'Your balance will update once this payment is confirmed.'} /> : null}

      <Card>
        <DetailRow label="Transaction ID" value={txn.txnId} copyable />
        <Divider />
        <DetailRow label="Date" value={formatDate(txn.createdAt)} />
        <Divider />
        <DetailRow label="Time" value={formatTime(txn.createdAt)} />
        <Divider />
        <DetailRow label="Amount" value={formatINR(txn.amountPaise)} />
        <Divider />
        <DetailRow label="Status" value={txn.status === 'success' ? 'Success' : txn.status === 'pending' ? 'Pending' : 'Failed'} />
        <Divider />
        <DetailRow label={counterpartyLabel(txn)} value={txn.counterparty.name} />
        {extra.map((r) => (
          <View key={r.label}><Divider /><DetailRow label={r.label} value={r.value} /></View>
        ))}
        <Divider />
        <DetailRow label="Payment method" value={paymentMethodLabel(txn)} />
        <Divider />
        <DetailRow label="Reference no." value={txn.referenceNo} copyable />
        {txn.note ? <View><Divider /><DetailRow label="Note" value={txn.note} /></View> : null}
      </Card>

      <SimulatedNotice />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingTop: spacing.md },
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  skeleton: { alignItems: 'center', gap: spacing.lg, paddingTop: spacing.xl },
});
