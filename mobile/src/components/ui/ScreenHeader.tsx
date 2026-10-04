import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { colors, radius, screenPadding, spacing } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  /** Hide the back arrow for root screens. */
  hideBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  tone?: 'default' | 'brand';
}

export function ScreenHeader({ title, subtitle, hideBack, onBack, right, tone = 'default' }: ScreenHeaderProps) {
  const fg = tone === 'brand' ? colors.textOnBrand : colors.textPrimary;
  return (
    <View style={styles.row}>
      {hideBack ? null : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
          style={({ pressed }) => [styles.back, pressed && { backgroundColor: colors.surfaceMuted }]}
        >
          <Icon name="chevron-back" size={24} color={fg} />
        </Pressable>
      )}
      <View style={styles.titles}>
        {title ? (
          <AppText variant="title2" numberOfLines={1} style={{ color: fg }} accessibilityRole="header">
            {title}
          </AppText>
        ) : null}
        {subtitle ? (
          <AppText variant="caption" color={tone === 'brand' ? 'textOnBrandMuted' : 'textTertiary'} numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: screenPadding, minHeight: 56 },
  back: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginLeft: -spacing.sm },
  titles: { flex: 1 },
});
