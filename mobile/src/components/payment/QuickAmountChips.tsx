import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from '@/components/ui/Chip';
import { QUICK_AMOUNTS_RUPEES } from '@/config/constants';
import { spacing } from '@/theme';
import { RUPEE, formatNumberIN, parseAmountToPaise, rupeesToPaise } from '@/utils/money';

interface Props {
  value: string;
  onPick: (text: string) => void;
}

export function QuickAmountChips({ value, onPick }: Props) {
  const current = parseAmountToPaise(value);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} keyboardShouldPersistTaps="handled">
      {QUICK_AMOUNTS_RUPEES.map((r) => (
        <Chip key={r} label={`${RUPEE}${formatNumberIN(rupeesToPaise(r), false)}`} selected={current === rupeesToPaise(r)} onPress={() => onPick(String(r))} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ row: { gap: spacing.sm, justifyContent: 'center', flexGrow: 1 } });
