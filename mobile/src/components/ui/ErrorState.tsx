import { StyleSheet, View } from 'react-native';
import { spacing } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { IconCircle } from './IconCircle';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title = "Couldn't load this", message, onRetry, retryLabel = 'Try again' }: ErrorStateProps) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <IconCircle icon="cloud-offline-outline" tone="danger" size={64} shape="circle" />
      <AppText variant="title2" align="center">{title}</AppText>
      <AppText color="textSecondary" align="center">{message}</AppText>
      {onRetry ? <Button label={retryLabel} onPress={onRetry} variant="secondary" size="md" style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.huge, paddingHorizontal: spacing.xxl },
  action: { marginTop: spacing.sm },
});
