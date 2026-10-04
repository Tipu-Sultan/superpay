import { useMemo, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { AppText } from '@/components/ui/AppText';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { RowSkeletonList } from '@/components/ui/Skeleton';
import { TextField } from '@/components/ui/TextField';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTransactionsInfinite } from '@/hooks/useApiQueries';
import { openTransaction } from '@/lib/navigation';
import { errorMessage } from '@/services/api/errors';
import { colors, screenPadding, spacing } from '@/theme';
import type { Transaction, TransactionFilters as Filters } from '@/types/api';
import { dayKey, dayLabel } from '@/utils/date';

interface Section {
  key: string;
  title: string;
  data: Transaction[];
}

/** Groups newest-first transactions by calendar day. */
function groupByDay(items: Transaction[]): Section[] {
  const sections: Section[] = [];
  for (const txn of items) {
    const key = dayKey(txn.createdAt);
    const last = sections[sections.length - 1];
    if (last && last.key === key) last.data.push(txn);
    else sections.push({ key, title: dayLabel(txn.createdAt), data: [txn] });
  }
  return sections;
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const q = useDebouncedValue(search.trim(), 300);
  const activeFilters = useMemo<Filters>(() => ({ ...filters, q: q || undefined }), [filters, q]);

  const query = useTransactionsInfinite(activeFilters);
  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const sections = useMemo(() => groupByDay(items), [items]);
  const hasFilters = Boolean(filters.type || filters.status || q);

  const header = (
    <View style={styles.header}>
      <AppText variant="title1" style={styles.title} accessibilityRole="header">Transactions</AppText>
      <View style={styles.search}>
        <TextField
          placeholder="Search name, ID or note"
          icon="search-outline"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          right={search ? <AppText variant="label" color="link" onPress={() => setSearch('')} accessibilityRole="button">Clear</AppText> : undefined}
        />
      </View>
      <TransactionFilters filters={filters} onChange={setFilters} />
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {header}
      {query.isLoading ? (
        <RowSkeletonList count={7} />
      ) : query.isError && items.length === 0 ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : (
        <SectionList<Transaction, Section>
          sections={sections}
          keyExtractor={(t) => t.id}
          stickySectionHeadersEnabled
          contentContainerStyle={{ paddingBottom: spacing.xxxl }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => void query.refetch()} tintColor={colors.primary} colors={[colors.primary]} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
          }}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <AppText variant="captionStrong" color="textSecondary">{section.title}</AppText>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.rowWrap}>
              <TransactionRow transaction={item} onPress={(t) => openTransaction(t.id)} />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.rowWrap}><Divider inset={72} /></View>}
          ListEmptyComponent={
            hasFilters ? (
              <EmptyState icon="search-outline" title="No matching transactions" message="Try a different search or clear the filters." actionLabel="Clear filters" onAction={() => { setSearch(''); setFilters({}); }} />
            ) : (
              <EmptyState icon="receipt-outline" title="No transactions yet" message="Your payments, recharges and top-ups will be listed here." actionLabel="Send money" onAction={() => router.push('/send/recipient')} />
            )
          }
          ListFooterComponent={query.isFetchingNextPage ? <RowSkeletonList count={2} /> : query.isError && items.length > 0 ? (
            <ErrorState title="Couldn't load more" message={errorMessage(query.error)} onRetry={() => void query.fetchNextPage()} />
          ) : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { gap: spacing.md, paddingBottom: spacing.md },
  title: { paddingHorizontal: screenPadding, paddingTop: spacing.md },
  search: { paddingHorizontal: screenPadding },
  sectionHeader: { backgroundColor: colors.background, paddingHorizontal: screenPadding, paddingVertical: spacing.sm },
  rowWrap: { marginHorizontal: screenPadding, backgroundColor: colors.surface },
});
