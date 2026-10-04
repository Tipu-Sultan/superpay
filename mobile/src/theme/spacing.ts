/** 4pt spacing scale. Use these instead of raw numbers. */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 56,
} as const;

/** Horizontal padding every screen uses so edges line up app-wide. */
export const screenPadding = spacing.lg;
