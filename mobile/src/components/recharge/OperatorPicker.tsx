import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { colors, radius, spacing } from '@/theme';
import type { Operator } from '@/types/api';
import { haptics } from '@/utils/haptics';

interface Props {
  operators: Operator[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

/** Operator choices as selectable tiles with a coloured dot (no third-party logos). */
export function OperatorPicker({ operators, selectedId, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {operators.map((op) => {
        const selected = op.id === selectedId;
        return (
          <Pressable
            key={op.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              haptics.tap();
              onSelect(op.id);
            }}
            style={[styles.tile, selected && styles.selected]}
          >
            <View style={[styles.dot, { backgroundColor: op.color }]} />
            <AppText variant={selected ? 'bodyStrong' : 'body'}>{op.name}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primaryTint },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
