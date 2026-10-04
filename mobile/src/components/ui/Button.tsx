import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { haptics } from '@/utils/haptics';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'md' | 'lg';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const PALETTE: Record<Variant, { bg: string; pressed: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, pressed: colors.primaryPressed, fg: colors.onPrimary },
  accent: { bg: colors.accent, pressed: colors.accentPressed, fg: colors.onAccent },
  secondary: { bg: colors.surface, pressed: colors.primaryTint, fg: colors.primary, border: colors.borderStrong },
  ghost: { bg: 'transparent', pressed: colors.primaryTint, fg: colors.link },
  danger: { bg: colors.dangerSoft, pressed: '#F9D2CD', fg: colors.danger },
};

export function Button({
  label, onPress, variant = 'primary', size = 'lg', icon, loading = false, disabled = false, style, accessibilityLabel,
}: ButtonProps) {
  const palette = PALETTE[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={() => {
        haptics.light();
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        { backgroundColor: pressed ? palette.pressed : palette.bg },
        palette.border ? { borderWidth: 1, borderColor: palette.border } : null,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={20} color={palette.fg} /> : null}
          <AppText style={[typography.button, { color: palette.fg }]}>{label}</AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  lg: { minHeight: 54, paddingHorizontal: spacing.xl },
  md: { minHeight: 44, paddingHorizontal: spacing.lg, borderRadius: radius.sm },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  disabled: { opacity: 0.45 },
});
