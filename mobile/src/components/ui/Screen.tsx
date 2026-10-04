import type { ReactNode } from 'react';
import { KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, screenPadding, spacing } from '@/theme';
import { ScreenHeader } from './ScreenHeader';

interface ScreenProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideBack?: boolean;
  onBack?: () => void;
  headerRight?: ReactNode;
  /** Scrollable body (default). Set false for screens that manage their own list. */
  scroll?: boolean;
  /** Sticky area pinned under the content (primary action, totals...). */
  footer?: ReactNode;
  /** Skip the standard header, e.g. for Home which draws its own. */
  noHeader?: boolean;
  /** Remove the default horizontal padding (lists that run edge to edge). */
  flush?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  keyboardAvoiding?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  background?: string;
  statusBar?: 'dark' | 'light';
}

/**
 * Standard screen scaffold: safe areas, optional header, scroll body, sticky
 * footer and keyboard handling, so every screen lines up the same way.
 */
export function Screen({
  children, title, subtitle, hideBack, onBack, headerRight, scroll = true, footer, noHeader, flush,
  refreshing, onRefresh, keyboardAvoiding = true, contentStyle, background = colors.background, statusBar = 'dark',
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, flush ? null : styles.padded, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} /> : undefined}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, flush ? null : styles.padded, contentStyle]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: background, paddingTop: insets.top }]}
      behavior={keyboardAvoiding ? 'padding' : undefined}
    >
      <StatusBar style={statusBar} />
      {noHeader ? null : <ScreenHeader title={title} subtitle={subtitle} hideBack={hideBack} onBack={onBack} right={headerRight} tone={statusBar === 'light' ? 'brand' : 'default'} />}
      {body}
      {footer ? <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>{footer}</View> : <View style={{ height: scroll ? 0 : insets.bottom }} />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: screenPadding },
  scrollContent: { paddingTop: spacing.sm, paddingBottom: spacing.xxxl, gap: spacing.lg },
  footer: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
});
