import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface ListRowProps {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  accessibilityLabel?: string;
  destructive?: boolean;
}

/** Standard tappable row used for contacts, settings, billers, funding sources... */
export function ListRow({ leading, title, subtitle, trailing, onPress, chevron, accessibilityLabel, destructive }: ListRowProps) {
  const content = (
    <>
      {leading}
      <View style={styles.texts}>
        <AppText variant="bodyStrong" color={destructive ? 'danger' : 'textPrimary'} numberOfLines={1}>{title}</AppText>
        {subtitle ? <AppText variant="caption" color="textTertiary" numberOfLines={2}>{subtitle}</AppText> : null}
      </View>
      {trailing}
      {chevron ? <Icon name="chevron-forward" size={18} color={colors.textTertiary} /> : null}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (subtitle ? `${title}, ${subtitle}` : title)}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.primaryTint }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 64 },
  texts: { flex: 1, gap: 2 },
});
