import { forwardRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors, fontFamily, spacing } from '@/theme';
import { RUPEE, sanitizeAmountInput } from '@/utils/money';
import { AppText } from './AppText';

interface AmountInputProps {
  value: string;
  onChangeText: (value: string) => void;
  autoFocus?: boolean;
  error?: string | null;
  tone?: 'default' | 'brand';
}

/** Large, centred rupee input. Text is sanitised as the user types (digits, one dot, 2 decimals). */
export const AmountInput = forwardRef<TextInput, AmountInputProps>(function AmountInput(
  { value, onChangeText, autoFocus, error, tone = 'default' },
  ref,
) {
  const fg = tone === 'brand' ? colors.textOnBrand : colors.textPrimary;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <AppText variant="display" style={{ color: fg, opacity: value ? 1 : 0.4 }}>{RUPEE}</AppText>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={(t) => onChangeText(sanitizeAmountInput(t))}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={tone === 'brand' ? colors.textOnBrandMuted : colors.borderStrong}
          selectionColor={colors.accent}
          autoFocus={autoFocus}
          maxLength={10}
          accessibilityLabel="Amount in rupees"
          style={[styles.input, { color: fg }]}
        />
      </View>
      {error ? <AppText variant="caption" color="danger" align="center" accessibilityLiveRegion="polite">{error}</AppText> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  input: {
    fontFamily: fontFamily.displayBold,
    fontSize: 48,
    minWidth: 60,
    paddingVertical: 0,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
});
