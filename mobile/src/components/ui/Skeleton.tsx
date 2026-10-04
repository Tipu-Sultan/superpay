import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type DimensionValue } from 'react-native';
import { colors, radius, spacing } from '@/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  rounded?: number;
}

/** Pulsing placeholder shown while data loads. */
export function Skeleton({ width = '100%', height = 16, rounded = radius.xs }: SkeletonProps) {
  const [opacity] = useState(() => new Animated.Value(0.55));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View accessibilityElementsHidden style={{ width, height, borderRadius: rounded, backgroundColor: colors.skeleton, opacity }} />;
}

/** Placeholder for a transaction / list row. */
export function RowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton width={44} height={44} rounded={radius.pill} />
      <View style={styles.texts}>
        <Skeleton width="55%" height={14} />
        <Skeleton width="35%" height={12} />
      </View>
      <Skeleton width={56} height={14} />
    </View>
  );
}

export function RowSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View accessibilityLabel="Loading" accessibilityLiveRegion="polite">
      {Array.from({ length: count }, (_, i) => <RowSkeleton key={i} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  texts: { flex: 1, gap: spacing.sm },
});
