import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { colors, spacing } from '@/theme';
import type { DraftSummary } from '@/types/payment';
import { formatINR } from '@/utils/money';

interface PaymentSummaryProps {
  summary: DraftSummary;
  amountPaise: number;
}

/** The "who, how much, what" card shared by every confirmation screen. */
export function PaymentSummary({ summary, amountPaise }: PaymentSummaryProps) {
  return (
    <Card padded={false}>
      <View style={styles.head}>
        <Avatar name={summary.avatarName} color={summary.avatarColor} size={56} />
        <View style={styles.headTexts}>
          <AppText variant="title3" numberOfLines={2}>{summary.headline}</AppText>
          {summary.subline ? <AppText variant="caption" color="textTertiary" numberOfLines={1}>{summary.subline}</AppText> : null}
        </View>
      </View>
      <View style={styles.amountBox}>
        <AppText variant="caption" color="textTertiary">Amount</AppText>
        <AppText variant="display" style={{ fontVariant: ['tabular-nums'] }} accessibilityLabel={`Amount ${formatINR(amountPaise)}`}>
          {formatINR(amountPaise)}
        </AppText>
      </View>
      <Divider />
      <View style={styles.rows}>
        {summary.rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <AppText variant="caption" color="textTertiary">{row.label}</AppText>
            <AppText variant="bodyStrong" align="right" style={styles.value}>{row.value}</AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  headTexts: { flex: 1, gap: 2 },
  amountBox: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: 2 },
  rows: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.surface },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg },
  value: { flexShrink: 1 },
});
