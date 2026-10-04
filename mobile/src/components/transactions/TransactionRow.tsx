import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { IconCircle, type IconTone } from '@/components/ui/IconCircle';
import { colors, spacing } from '@/theme';
import type { Transaction } from '@/types/api';
import { formatTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { TYPE_ICON, isCredit, transactionSubtitle, transactionTitle } from '@/utils/transaction';

function toneFor(txn: Transaction): IconTone {
  if (txn.status === 'failed') return 'danger';
  if (txn.status === 'pending') return 'warning';
  return isCredit(txn) ? 'success' : 'brand';
}

interface TransactionRowProps {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
  /** Show "Today"/date next to the time (used in short lists without date headers). */
  showDate?: string;
}

export function TransactionRow({ transaction: txn, onPress, showDate }: TransactionRowProps) {
  const credit = isCredit(txn);
  const failed = txn.status === 'failed';
  const amount = `${credit ? '+' : '-'}${formatINR(txn.amountPaise, { compact: true }).replace('-', '')}`;
  const title = transactionTitle(txn);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${amount}, ${txn.status}`}
      onPress={() => onPress(txn)}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.primaryTint }]}
    >
      <IconCircle icon={TYPE_ICON[txn.type]} tone={toneFor(txn)} shape="circle" />
      <View style={styles.texts}>
        <AppText variant="bodyStrong" numberOfLines={1}>{title}</AppText>
        <AppText variant="caption" color="textTertiary" numberOfLines={1}>{transactionSubtitle(txn)}</AppText>
      </View>
      <View style={styles.right}>
        <AppText
          variant="bodyStrong"
          style={[
            { fontVariant: ['tabular-nums'] },
            credit && !failed && { color: colors.success },
            failed && { color: colors.textTertiary, textDecorationLine: 'line-through' },
          ]}
        >
          {amount}
        </AppText>
        <AppText variant="caption" color="textTertiary">{showDate ? `${showDate}, ` : ''}{formatTime(txn.createdAt)}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 68 },
  texts: { flex: 1, gap: 2 },
  right: { alignItems: 'flex-end', gap: 2 },
});
