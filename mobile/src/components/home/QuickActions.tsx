import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { IconCircle } from '@/components/ui/IconCircle';
import type { IconName } from '@/components/ui/Icon';
import { colors, radius, spacing } from '@/theme';
import { haptics } from '@/utils/haptics';

interface Action {
  key: string;
  label: string;
  icon: IconName;
  onPress: () => void;
}

const ACTIONS: Action[] = [
  { key: 'send', label: 'Send', icon: 'send-outline', onPress: () => router.push('/send/recipient') },
  { key: 'receive', label: 'Receive', icon: 'arrow-down-circle-outline', onPress: () => router.push('/receive') },
  { key: 'scan', label: 'Scan & Pay', icon: 'qr-code-outline', onPress: () => router.push('/scan') },
  { key: 'request', label: 'Request', icon: 'hand-left-outline', onPress: () => router.push({ pathname: '/receive', params: { mode: 'request' } }) },
];

export function QuickActions() {
  return (
    <View style={styles.row}>
      {ACTIONS.map((a) => (
        <Pressable
          key={a.key}
          accessibilityRole="button"
          accessibilityLabel={a.label}
          onPress={() => {
            haptics.tap();
            a.onPress();
          }}
          style={({ pressed }) => [styles.tile, pressed && { backgroundColor: colors.primaryTint }]}
        >
          <IconCircle icon={a.icon} tone={a.key === 'scan' ? 'accent' : 'brand'} size={48} />
          <AppText variant="captionStrong" align="center" numberOfLines={1}>{a.label}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
