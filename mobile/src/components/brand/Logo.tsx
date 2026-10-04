import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';
import { AppText } from '@/components/ui/AppText';

interface LogoMarkProps {
  size?: number;
  /** Colour of the lower arc; the upper arc is always marigold. */
  lowerColor?: string;
}

/** The SuperPay "S": two stacked arcs, one marigold and one light. Drawn in code so it stays crisp at any size. */
export function LogoMark({ size = 32, lowerColor = colors.palette.white }: LogoMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="SuperPay logo">
      <Path d="M50 50 A20 20 0 1 1 65.32 17.14" stroke={colors.accent} strokeWidth={6} strokeLinecap="round" fill="none" />
      <Path d="M50 50 A20 20 0 1 1 34.68 82.86" stroke={lowerColor} strokeWidth={6} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

interface LogoProps {
  tone?: 'light' | 'dark';
  size?: number;
}

/** Mark + wordmark lockup. `light` is for dark backgrounds. */
export function Logo({ tone = 'dark', size = 28 }: LogoProps) {
  const dark = tone === 'dark';
  return (
    <View style={styles.row} accessibilityRole="image" accessibilityLabel="SuperPay">
      <View style={[styles.tile, { width: size + 12, height: size + 12, borderRadius: (size + 12) * 0.3, backgroundColor: dark ? colors.primary : 'rgba(255,255,255,0.12)' }]}>
        <LogoMark size={size} />
      </View>
      <AppText variant="title2" style={{ color: dark ? colors.primary : colors.textOnBrand }}>SuperPay</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tile: { alignItems: 'center', justifyContent: 'center' },
});
