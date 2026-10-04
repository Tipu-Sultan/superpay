import { Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, spacing } from '@/theme';
import type { Announcement } from '@/types/api';

const TONES = {
  brand: { bg: colors.primarySoft, fg: colors.primary, accent: colors.primary },
  accent: { bg: colors.accentSoft, fg: colors.palette.gold900, accent: colors.palette.gold800 },
  info: { bg: colors.infoSoft, fg: colors.palette.ink, accent: colors.info },
} as const;

export function PromoCard({ announcement }: { announcement: Announcement }) {
  const tone = TONES[announcement.tone];
  const actionable = Boolean(announcement.ctaRoute);
  return (
    <Pressable
      accessibilityRole={actionable ? 'button' : 'text'}
      disabled={!actionable}
      onPress={() => announcement.ctaRoute && router.push(announcement.ctaRoute as Href)}
      style={[styles.card, { backgroundColor: tone.bg }]}
    >
      <View style={styles.body}>
        <AppText variant="title3" style={{ color: tone.fg }}>{announcement.title}</AppText>
        <AppText variant="caption" style={{ color: tone.fg }}>{announcement.body}</AppText>
        {announcement.ctaLabel ? (
          <View style={styles.cta}>
            <AppText variant="label" style={{ color: tone.accent }}>{announcement.ctaLabel}</AppText>
            <Icon name="chevron-forward" size={16} color={tone.accent} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.lg },
  body: { gap: spacing.xs },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: spacing.xs },
});
