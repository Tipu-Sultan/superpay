import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import { formatINR } from '@/utils/money';

interface BalanceCardProps {
  balancePaise: number | undefined;
  loading: boolean;
  failed?: boolean;
  onAddMoney: () => void;
  onRetry?: () => void;
}

/**
 * The one hero element of the app: deep teal "pass" with marigold ripples.
 * Balance can be hidden for privacy on a crowded bus.
 */
export function BalanceCard({ balancePaise, loading, failed, onAddMoney, onRetry }: BalanceCardProps) {
  const [hidden, setHidden] = useState(false);

  return (
    <View style={styles.card}>
      <Svg style={styles.ripples} width={190} height={190} viewBox="0 0 190 190" pointerEvents="none">
        <Circle cx={190} cy={0} r={60} stroke={colors.accent} strokeOpacity={0.9} strokeWidth={2} fill="none" />
        <Circle cx={190} cy={0} r={100} stroke={colors.accent} strokeOpacity={0.55} strokeWidth={2} fill="none" />
        <Circle cx={190} cy={0} r={140} stroke={colors.accent} strokeOpacity={0.28} strokeWidth={2} fill="none" />
        <Circle cx={190} cy={0} r={180} stroke={colors.accent} strokeOpacity={0.14} strokeWidth={2} fill="none" />
      </Svg>

      <View style={styles.topRow}>
        <AppText variant="label" color="textOnBrandMuted">SuperPay balance</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'}
          hitSlop={12}
          onPress={() => setHidden((h) => !h)}
        >
          <Icon name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textOnBrandMuted} />
        </Pressable>
      </View>

      <View style={styles.amountRow}>
        {loading && balancePaise === undefined ? (
          <Skeleton width={180} height={40} rounded={radius.sm} />
        ) : failed && balancePaise === undefined ? (
          <Pressable accessibilityRole="button" onPress={onRetry}>
            <AppText variant="bodyStrong" color="textOnBrand">{"Couldn't load balance. Tap to retry"}</AppText>
          </Pressable>
        ) : (
          <AppText
            style={[typography.amountLarge, { color: colors.textOnBrand }]}
            accessibilityLabel={hidden ? 'Balance hidden' : `Balance ${formatINR(balancePaise ?? 0)}`}
          >
            {hidden ? '\u20B9 \u2022\u2022\u2022\u2022\u2022' : formatINR(balancePaise ?? 0)}
          </AppText>
        )}
      </View>

      <Button label="Add money" icon="add-circle-outline" variant="accent" size="md" onPress={onAddMoney} style={styles.add} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    overflow: 'hidden',
    ...shadows.float,
  },
  ripples: { position: 'absolute', top: 0, right: 0 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amountRow: { minHeight: 52, justifyContent: 'center' },
  add: { alignSelf: 'flex-start', marginTop: spacing.xs },
});
