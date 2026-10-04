import type { TextStyle } from 'react-native';

/**
 * Sora carries the personality (headings, money); DM Sans keeps body copy calm and legible.
 * Font names are the exact keys registered in `useAppFonts`.
 */
export const fontFamily = {
  display: 'Sora_600SemiBold',
  displayBold: 'Sora_700Bold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
} as const;

export type TextVariant =
  | 'display'
  | 'amountLarge'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'captionStrong'
  | 'label'
  | 'button';

export const typography: Record<TextVariant, TextStyle> = {
  display: { fontFamily: fontFamily.displayBold, fontSize: 36, lineHeight: 44, letterSpacing: -0.8 },
  amountLarge: { fontFamily: fontFamily.displayBold, fontSize: 44, lineHeight: 52, letterSpacing: -1, fontVariant: ['tabular-nums'] },
  title1: { fontFamily: fontFamily.display, fontSize: 26, lineHeight: 34, letterSpacing: -0.4 },
  title2: { fontFamily: fontFamily.display, fontSize: 20, lineHeight: 28, letterSpacing: -0.2 },
  title3: { fontFamily: fontFamily.bodyBold, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamily.bodyBold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fontFamily.body, fontSize: 13, lineHeight: 18 },
  captionStrong: { fontFamily: fontFamily.bodyBold, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fontFamily.bodyMedium, fontSize: 14, lineHeight: 20 },
  button: { fontFamily: fontFamily.bodyBold, fontSize: 16, lineHeight: 22 },
};
