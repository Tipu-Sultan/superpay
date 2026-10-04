import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { colors, spacing } from '@/theme';
import type { FetchedBill } from '@/types/api';
import { dueLabel, formatDate } from '@/utils/date';
import { formatINR } from '@/utils/money';

export function BillCard({ bill }: { bill: FetchedBill }) {
  return (
    <Card padded={false} tone="tint">
      <View style={styles.top}>
        <AppText variant="caption" color="textTertiary">Amount due</AppText>
        <AppText variant="display" style={{ fontVariant: ['tabular-nums'] }}>{formatINR(bill.amountPaise)}</AppText>
        <AppText variant="captionStrong" color="warning">{dueLabel(bill.dueDate)} · {formatDate(bill.dueDate)}</AppText>
      </View>
      <Divider />
      <View style={styles.rows}>
        <Row label="Customer" value={bill.customerName} />
        <Row label="Account" value={bill.accountNumber} />
        <Row label="Bill number" value={bill.billNumber} />
        <Row label="Bill date" value={formatDate(bill.billDate)} />
      </View>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" color="textTertiary">{label}</AppText>
      <AppText variant="bodyStrong" style={styles.value} align="right">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { padding: spacing.lg, gap: 2 },
  rows: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.surface },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg },
  value: { flexShrink: 1 },
});
