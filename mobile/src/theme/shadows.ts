import type { ViewStyle } from 'react-native';

/** Used sparingly: only for the hero balance card and floating elements. Everything else is flat with a hairline border. */
export const shadows: Record<'none' | 'card' | 'float', ViewStyle> = {
  none: {},
  card: {
    shadowColor: '#062826',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  float: {
    shadowColor: '#062826',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};
