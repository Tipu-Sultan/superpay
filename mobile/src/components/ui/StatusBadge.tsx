import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import type { TransactionStatus } from '@/types/api';
import { STATUS_LABEL } from '@/utils/transaction';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

const STYLE: Record<TransactionStatus, { bg: string; fg: string; icon: IconName }> = {
  success: { bg: colors.successSoft, fg: colors.success, icon: 'checkmark-circle' },
  pending: { bg: colors.warningSoft, fg: colors.warning, icon: 'time-outline' },
  failed: { bg: colors.dangerSoft, fg: colors.danger, icon: 'close-circle' },
};

/** Status is always conveyed by icon + text, never colour alone. */
export function StatusBadge({ status, compact }: { status: TransactionStatus; compact?: boolean }) {
  const s = STYLE[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }, compact && styles.compact]} accessible accessibilityLabel={`Status: ${STATUS_LABEL[status]}`}>
      <Icon name={s.icon} size={compact ? 12 : 14} color={s.fg} />
      <AppText variant="captionStrong" style={{ color: s.fg, fontSize: compact ? 11 : 13 }}>{STATUS_LABEL[status]}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm + 2, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  compact: { paddingHorizontal: spacing.sm, paddingVertical: 2 },
});
