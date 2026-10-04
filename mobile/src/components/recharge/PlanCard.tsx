import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, spacing } from '@/theme';
import type { RechargePlan } from '@/types/api';
import { formatINR } from '@/utils/money';

interface Props {
  plan: RechargePlan;
  selected: boolean;
  onPress: (plan: RechargePlan) => void;
}

export function PlanCard({ plan, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${formatINR(plan.pricePaise, { compact: true })}, ${plan.data}, ${plan.validityDays} days`}
      onPress={() => onPress(plan)}
      style={[styles.card, selected && styles.selected]}
    >
      <View style={styles.price}>
        <AppText variant="title2">{formatINR(plan.pricePaise, { compact: true })}</AppText>
        {plan.tag ? (
          <View style={styles.tag}><AppText variant="captionStrong" color="onAccent" style={{ fontSize: 11 }}>{plan.tag}</AppText></View>
        ) : null}
      </View>
      <View style={styles.facts}>
        <Fact label="Data" value={plan.data} />
        <Fact label="Validity" value={`${plan.validityDays} ${plan.validityDays === 1 ? 'day' : 'days'}`} />
        <Fact label="Calls" value={plan.calls} />
      </View>
      {plan.description ? <AppText variant="caption" color="textTertiary">{plan.description}</AppText> : null}
      {selected ? <View style={styles.check}><Icon name="checkmark-circle" size={22} color={colors.primary} /></View> : null}
    </Pressable>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <AppText variant="bodyStrong" numberOfLines={1}>{value}</AppText>
      <AppText variant="caption" color="textTertiary">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  selected: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primaryTint },
  price: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tag: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  facts: { flexDirection: 'row', gap: spacing.xl },
  fact: { gap: 2, flexShrink: 1 },
  check: { position: 'absolute', top: spacing.md, right: spacing.md },
});
