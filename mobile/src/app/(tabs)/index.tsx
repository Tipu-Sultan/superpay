import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Logo } from '@/components/brand/Logo';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { BalanceCard } from '@/components/home/BalanceCard';
import { PromoCard } from '@/components/home/PromoCard';
import { QuickActions } from '@/components/home/QuickActions';
import { QuickContacts } from '@/components/home/QuickContacts';
import { ServiceGrid } from '@/components/home/ServiceGrid';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { RowSkeletonList } from '@/components/ui/Skeleton';
import { useAnnouncements, useContacts, useRecentTransactions, useWallet } from '@/hooks/useApiQueries';
import { openTransaction } from '@/lib/navigation';
import { errorMessage } from '@/services/api/errors';
import { useCurrentUser } from '@/store/AuthContext';
import { spacing } from '@/theme';
import { greetingFor } from '@/utils/date';
import { firstName } from '@/utils/format';

export default function HomeScreen() {
  const user = useCurrentUser();
  const wallet = useWallet();
  const recent = useRecentTransactions(5);
  const contacts = useContacts('');
  const announcements = useAnnouncements();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([wallet.refetch(), recent.refetch(), contacts.refetch(), announcements.refetch()]);
    setRefreshing(false);
  }, [wallet, recent, contacts, announcements]);

  const favourites = (contacts.data ?? []).filter((c) => c.isFavorite);
  const promo = announcements.data?.[0];

  return (
    <Screen noHeader refreshing={refreshing} onRefresh={refresh} contentStyle={styles.content}>
      <View style={styles.topBar}>
        <Logo />
        <View style={styles.actions}>
          <NotificationBell />
          <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => router.navigate('/profile')}>
            <Avatar name={user.name} color={user.avatarColor} size={42} />
          </Pressable>
        </View>
      </View>

      <View>
        <AppText color="textTertiary">{greetingFor()},</AppText>
        <AppText variant="title1" numberOfLines={1}>{firstName(user.name)}</AppText>
      </View>

      <BalanceCard
        balancePaise={wallet.data?.balancePaise}
        loading={wallet.isLoading}
        failed={wallet.isError}
        onRetry={() => void wallet.refetch()}
        onAddMoney={() => router.push('/add-money')}
      />

      <QuickActions />

      <View style={styles.section}>
        <SectionHeader title="Quick services" actionLabel="All bills" onAction={() => router.push('/bills')} />
        <ServiceGrid />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Recent transactions" actionLabel="See all" onAction={() => router.navigate('/transactions')} />
        <Card padded={false}>
          {recent.isLoading ? (
            <RowSkeletonList count={3} />
          ) : recent.isError ? (
            <ErrorState message={errorMessage(recent.error)} onRetry={() => void recent.refetch()} />
          ) : recent.data && recent.data.items.length > 0 ? (
            recent.data.items.map((txn, i) => (
              <View key={txn.id}>
                {i > 0 ? <Divider inset={72} /> : null}
                <TransactionRow transaction={txn} onPress={(t) => openTransaction(t.id)} />
              </View>
            ))
          ) : (
            <EmptyState icon="receipt-outline" title="No transactions yet" message="Send money or recharge a number and it will show up here." actionLabel="Send money" onAction={() => router.push('/send/recipient')} />
          )}
        </Card>
      </View>

      {favourites.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Quick contacts" actionLabel="Everyone" onAction={() => router.push('/send/recipient')} />
          <QuickContacts contacts={favourites} />
        </View>
      ) : null}

      {promo ? <PromoCard announcement={promo} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingTop: spacing.md },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  section: { gap: spacing.md },
});
