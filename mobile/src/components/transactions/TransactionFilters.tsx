import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip } from '@/components/ui/Chip';
import { spacing } from '@/theme';
import type { TransactionFilters as Filters } from '@/types/api';
import { STATUS_FILTERS, TYPE_FILTERS } from '@/utils/transaction';

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
}

/** Two rows of chips: what kind of transaction, and what state it is in. */
export function TransactionFilters({ filters, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TYPE_FILTERS.map((f) => (
          <Chip key={f.label} label={f.label} selected={filters.type === f.value} onPress={() => onChange({ ...filters, type: f.value })} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {STATUS_FILTERS.map((f) => (
          <Chip key={f.label} label={f.label} selected={filters.status === f.value} onPress={() => onChange({ ...filters, status: f.value })} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { gap: spacing.sm, paddingHorizontal: spacing.lg },
});
