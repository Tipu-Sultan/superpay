import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorValue;
}

/** Single icon entry point so the icon set can be swapped in one place. */
export function Icon({ name, size = 22, color = colors.textPrimary }: IconProps) {
  return <Ionicons name={name} size={size} color={color} accessible={false} />;
}
