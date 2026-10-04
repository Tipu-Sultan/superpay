import { forwardRef, useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fontFamily, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | null;
  helper?: string;
  prefix?: string;
  icon?: IconName;
  right?: ReactNode;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, helper, prefix, icon, right, onFocus, onBlur, editable = true, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={styles.wrap}>
      {label ? <AppText variant="label" color="textSecondary">{label}</AppText> : null}
      <View style={[styles.field, { borderColor, borderWidth: focused || error ? 1.5 : 1 }, !editable && styles.disabled]}>
        {icon ? <Icon name={icon} size={20} color={colors.textTertiary} /> : null}
        {prefix ? <AppText variant="bodyStrong" color="textSecondary">{prefix}</AppText> : null}
        <TextInput
          ref={ref}
          editable={editable}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.primary}
          accessibilityLabel={label}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={styles.input}
          {...rest}
        />
        {right}
      </View>
      {error ? (
        <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">{error}</AppText>
      ) : helper ? (
        <AppText variant="caption" color="textTertiary">{helper}</AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 54,
  },
  disabled: { backgroundColor: colors.surfaceMuted },
  input: { flex: 1, fontFamily: fontFamily.body, fontSize: 16, color: colors.textPrimary, paddingVertical: spacing.md },
});
