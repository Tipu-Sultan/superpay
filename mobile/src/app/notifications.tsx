import { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useMarkAllNotificationsRead, useMarkNotificationRead } from '@/hooks/useApiMutations';
import { useNotifications } from '@/hooks/useApiQueries';
import { errorMessage } from '@/services/api/errors';
import { colors, radius, spacing } from '@/theme';
import { formatDate, formatTime } from '@/utils/date';

export default function NotificationsScreen() {
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  useEffect(() => {
    if (notifications.data?.some((item) => !item.readAt)) {
      markAll.mutate();
    }
  }, [notifications.data]);

  const refresh = useCallback(() => {
    void notifications.refetch();
  }, [notifications]);

  return (
    <Screen
      noHeader
      contentStyle={styles.content}
      refreshing={notifications.isRefetching}
      onRefresh={refresh}
    >
      <ScreenHeader
        title="Notifications"
        right={
          notifications.data?.some((item) => !item.readAt) ? (
            <Pressable onPress={() => markAll.mutate()} hitSlop={8}>
              <AppText variant="label" color="link">Mark all read</AppText>
            </Pressable>
          ) : null
        }
      />

      {notifications.isLoading ? (
        <Card><AppText color="textTertiary">Loading notifications…</AppText></Card>
      ) : notifications.isError ? (
        <ErrorState message={errorMessage(notifications.error)} onRetry={() => void notifications.refetch()} />
      ) : notifications.data?.length ? (
        <View style={styles.list}>
          {notifications.data.map((item) => (
            <Pressable key={item.id} onPress={() => { if (!item.readAt) markRead.mutate(item.id); if (item.data?.transactionId) router.push(`/transaction/${String(item.data.transactionId)}`); }}>
              <Card style={[styles.card, !item.readAt && styles.unread]}>
              <View style={styles.row}>
                <View style={styles.icon}>
                  <Icon
                    name={item.type === 'transaction' ? 'swap-horizontal-outline' : item.type === 'security' ? 'shield-checkmark-outline' : 'information-circle-outline'}
                    size={21}
                    color={item.type === 'transaction' ? colors.primary : colors.info}
                  />
                </View>
                <View style={styles.body}>
                  <View style={styles.titleRow}>
                    <AppText variant="label" style={styles.title}>{item.title}</AppText>
                    {!item.readAt ? <View style={styles.dot} /> : null}
                  </View>
                  <AppText color="textSecondary">{item.body}</AppText>
                  <AppText variant="caption" color="textTertiary">{formatDate(item.createdAt)} · {formatTime(item.createdAt)}</AppText>
                </View>
              </View>
              </Card>
            </Pressable>
          ))}
        </View>
      ) : (
        <EmptyState icon="notifications-off-outline" title="You're all caught up" message="New payment and account updates will appear here." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingTop: spacing.md },
  list: { gap: spacing.md },
  card: { borderWidth: 1, borderColor: colors.border },
  unread: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  row: { flexDirection: 'row', gap: spacing.md },
  icon: { width: 42, height: 42, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1 },
  dot: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors.accent },
});
