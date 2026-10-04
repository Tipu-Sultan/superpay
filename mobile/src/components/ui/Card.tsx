import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';

interface CardProps extends ViewProps {
  padded?: boolean;
  tone?: 'surface' | 'tint';
  style?: StyleProp<ViewStyle>;
}

/** Flat surface with a hairline border. Shadows are reserved for the hero balance card. */
export function Card({ padded = true, tone = 'surface', style, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[styles.card, tone === 'tint' && styles.tint, padded && styles.padded, style]}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  tint: { backgroundColor: colors.surfaceTint, borderColor: colors.primarySoft },
  padded: { padding: spacing.lg },
});
