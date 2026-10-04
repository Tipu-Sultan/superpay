import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

type Tone = 'info' | 'success' | 'warning' | 'error';

const TONES: Record<Tone, { bg: string; fg: string; icon: IconName }> = {
  info: { bg: colors.infoSoft, fg: colors.info, icon: 'information-circle-outline' },
  success: { bg: colors.successSoft, fg: colors.success, icon: 'checkmark-circle' },
  warning: { bg: colors.warningSoft, fg: colors.warning, icon: 'alert-circle-outline' },
  error: { bg: colors.dangerSoft, fg: colors.danger, icon: 'alert-circle-outline' },
};

interface BannerProps {
  tone?: Tone;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function Banner({ tone = 'info', title, message, actionLabel, onAction }: BannerProps) {
  const t = TONES[tone];
  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }]} accessibilityRole={tone === 'error' ? 'alert' : undefined}>
      <Icon name={t.icon} size={20} color={t.fg} />
      <View style={styles.body}>
        {title ? <AppText variant="bodyStrong" style={{ color: t.fg }}>{title}</AppText> : null}
        <AppText variant="caption" style={{ color: colors.textPrimary }}>{message}</AppText>
        {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="secondary" size="md" style={styles.action} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: radius.md, alignItems: 'flex-start' },
  body: { flex: 1, gap: 2 },
  action: { alignSelf: 'flex-start', marginTop: spacing.sm },
});
