import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/theme';
import { Icon, type IconName } from './Icon';

export type IconTone = 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const TONES: Record<IconTone, { bg: string; fg: string }> = {
  brand: { bg: colors.primarySoft, fg: colors.primary },
  accent: { bg: colors.accentSoft, fg: colors.palette.gold800 },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  neutral: { bg: colors.surfaceMuted, fg: colors.textSecondary },
  info: { bg: colors.infoSoft, fg: colors.info },
};

interface IconCircleProps {
  icon: IconName;
  tone?: IconTone;
  size?: number;
  /** squircle for service tiles, circle for statuses */
  shape?: 'circle' | 'squircle';
}

export function IconCircle({ icon, tone = 'brand', size = 44, shape = 'squircle' }: IconCircleProps) {
  const t = TONES[tone];
  return (
    <View
      style={[styles.base, { width: size, height: size, backgroundColor: t.bg, borderRadius: shape === 'circle' ? radius.pill : radius.md }]}
    >
      <Icon name={icon} size={Math.round(size * 0.5)} color={t.fg} />
    </View>
  );
}

const styles = StyleSheet.create({ base: { alignItems: 'center', justifyContent: 'center' } });
