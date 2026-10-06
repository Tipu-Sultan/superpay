import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useUnreadNotifications } from '@/hooks/useApiQueries';
import { colors, radius } from '@/theme';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';

export function NotificationBell() {
  const unread = useUnreadNotifications();
  const count = unread.data?.count ?? 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={count > 0 ? `${count} unread notifications` : 'Notifications'}
      onPress={() => router.push('/notifications')}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Icon name="notifications-outline" size={23} color={colors.textPrimary} />
      {count > 0 ? (
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>{count > 9 ? '9+' : count}</AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 42, height: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  pressed: { backgroundColor: colors.surfaceMuted },
  badge: {
    position: 'absolute',
    top: 1,
    right: 0,
    minWidth: 17,
    height: 17,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: { color: colors.textOnBrand, fontSize: 9, fontWeight: '700' },
});
