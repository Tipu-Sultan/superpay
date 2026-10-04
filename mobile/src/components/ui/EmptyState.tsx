import { StyleSheet, View } from 'react-native';
import { spacing } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { IconCircle } from './IconCircle';
import type { IconName } from './Icon';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** An empty screen is an invitation to act, so say what to do next. */
export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <IconCircle icon={icon} tone="brand" size={64} shape="circle" />
      <AppText variant="title2" align="center">{title}</AppText>
      {message ? <AppText color="textSecondary" align="center">{message}</AppText> : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="secondary" size="md" style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.huge, paddingHorizontal: spacing.xxl },
  action: { marginTop: spacing.sm },
});
