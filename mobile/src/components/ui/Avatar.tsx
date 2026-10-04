import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';
import { initials } from '@/utils/format';
import { AppText } from './AppText';

interface AvatarProps {
  name: string;
  color?: string;
  size?: number;
}

export function Avatar({ name, color = colors.primary, size = 44 }: AvatarProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}
    >
      <AppText variant={size >= 56 ? 'title2' : 'captionStrong'} color="textOnBrand" style={size < 56 ? { fontSize: Math.round(size * 0.34) } : undefined}>
        {initials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({ base: { alignItems: 'center', justifyContent: 'center' } });
