import { Text, type TextProps } from 'react-native';
import { colors, typography, type ColorToken, type TextVariant } from '@/theme';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
}

/** All copy goes through this so fonts, sizes and colours come from the design system. */
export function AppText({ variant = 'body', color = 'textPrimary', align, style, ...rest }: AppTextProps) {
  return <Text {...rest} style={[typography[variant], { color: colors[color] }, align ? { textAlign: align } : null, style]} />;
}
