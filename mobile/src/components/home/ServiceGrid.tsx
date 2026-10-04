import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { IconCircle } from '@/components/ui/IconCircle';
import type { IconName } from '@/components/ui/Icon';
import { openBillCategory } from '@/lib/navigation';
import { spacing } from '@/theme';
import { haptics } from '@/utils/haptics';

interface Service {
  key: string;
  label: string;
  icon: IconName;
  onPress: () => void;
}

export const SERVICES: Service[] = [
  { key: 'recharge', label: 'Mobile recharge', icon: 'phone-portrait-outline', onPress: () => router.push('/recharge') },
  { key: 'electricity', label: 'Electricity', icon: 'flash-outline', onPress: () => openBillCategory('electricity') },
  { key: 'dth', label: 'DTH', icon: 'tv-outline', onPress: () => openBillCategory('dth') },
  { key: 'water', label: 'Water', icon: 'water-outline', onPress: () => openBillCategory('water') },
  { key: 'gas', label: 'Gas', icon: 'flame-outline', onPress: () => openBillCategory('gas') },
  { key: 'insurance', label: 'Insurance', icon: 'shield-checkmark-outline', onPress: () => openBillCategory('insurance') },
];

/** 3 x 2 grid of the most used services. */
export function ServiceGrid({ services = SERVICES }: { services?: Service[] }) {
  return (
    <View style={styles.grid}>
      {services.map((s) => (
        <Pressable
          key={s.key}
          accessibilityRole="button"
          accessibilityLabel={s.label}
          onPress={() => {
            haptics.tap();
            s.onPress();
          }}
          style={styles.cell}
        >
          <IconCircle icon={s.icon} tone="brand" size={52} />
          <AppText variant="caption" align="center" numberOfLines={2} style={styles.label}>{s.label}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg },
  cell: { width: '33.333%', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xs },
  label: { minHeight: 36 },
});
