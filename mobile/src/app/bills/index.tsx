import { Pressable, StyleSheet, View } from 'react-native';
import { SimulatedNotice } from '@/components/brand/SimulatedNotice';
import { AppText } from '@/components/ui/AppText';
import { ErrorState } from '@/components/ui/ErrorState';
import type { IconName } from '@/components/ui/Icon';
import { IconCircle } from '@/components/ui/IconCircle';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { useBillCategories } from '@/hooks/useApiQueries';
import { openBillCategory } from '@/lib/navigation';
import { errorMessage } from '@/services/api/errors';
import { colors, radius, spacing } from '@/theme';

export default function BillsScreen() {
  const categories = useBillCategories();

  return (
    <Screen title="Bill payments" contentStyle={styles.content}>
      <AppText color="textSecondary">Choose what you want to pay. You will pick a provider and enter your account number next.</AppText>

      {categories.isLoading ? (
        <View style={styles.grid}>{Array.from({ length: 6 }, (_, i) => <View key={i} style={styles.cell}><Skeleton height={112} rounded={radius.lg} /></View>)}</View>
      ) : categories.isError ? (
        <ErrorState message={errorMessage(categories.error)} onRetry={() => void categories.refetch()} />
      ) : (
        <View style={styles.grid}>
          {categories.data?.map((c) => (
            <View key={c.id} style={styles.cell}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${c.label}. ${c.description}`}
                onPress={() => openBillCategory(c.id)}
                style={({ pressed }) => [styles.tile, pressed && { backgroundColor: colors.primaryTint }]}
              >
                <IconCircle icon={c.icon as IconName} size={48} />
                <View>
                  <AppText variant="bodyStrong">{c.label}</AppText>
                  <AppText variant="caption" color="textTertiary" numberOfLines={2}>{c.description}</AppText>
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      )}
      <SimulatedNotice />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingTop: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  cell: { width: '50%', padding: spacing.xs },
  tile: { gap: spacing.md, padding: spacing.lg, minHeight: 112, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
});
