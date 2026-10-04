import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { SIMULATION_NOTICE } from '@/config/constants';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';

/** Always-visible reminder that this build never moves real money. */
export function SimulatedNotice({ compact }: { compact?: boolean }) {
  return (
    <View style={styles.wrap} accessibilityRole="text">
      <Icon name="shield-checkmark-outline" size={16} color={colors.textTertiary} />
      <AppText variant="caption" color="textTertiary" style={styles.text}>
        {compact ? 'Simulated payment. No real money moves.' : SIMULATION_NOTICE}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.sm },
  text: { flex: 1 },
});
