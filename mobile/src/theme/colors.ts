/**
 * SuperPay palette: deep peacock teal (trust, calm) with a marigold accent
 * (festive, distinctly Indian) on a cool paper-grey canvas.
 * All text/background pairs below meet WCAG AA (4.5:1) for body text.
 */
const palette = {
  teal50: '#EEF7F6',
  teal100: '#D8EEEB',
  teal200: '#B2DDD8',
  teal300: '#7CC4BC',
  teal500: '#138A82',
  teal600: '#0F6F69',
  teal700: '#0F5F5A',
  teal800: '#0C4A47',
  teal900: '#0A3D3A',
  teal950: '#062826',

  gold50: '#FFF8EB',
  gold100: '#FFEFCF',
  gold300: '#FFD27A',
  gold500: '#F5A524',
  gold600: '#D98A0B',
  gold800: '#6B4100',
  gold900: '#3D2600',

  white: '#FFFFFF',
  paper: '#F2F5F4',
  paperDeep: '#E8EEED',
  line: '#DCE5E3',
  lineStrong: '#C3D1CE',
  ink: '#0E1F1E',
  inkSoft: '#3F5452',
  inkMuted: '#5B706E',

  green600: '#14804A',
  green100: '#DDF3E6',
  amber700: '#8F5300',
  amber100: '#FFF0D1',
  red600: '#B42318',
  red100: '#FDE7E4',
  blue700: '#1D5FA8',
  blue100: '#E1EEFB',
} as const;

export const colors = {
  palette,

  background: palette.paper,
  surface: palette.white,
  surfaceMuted: palette.paperDeep,
  surfaceTint: palette.teal50,
  border: palette.line,
  borderStrong: palette.lineStrong,

  textPrimary: palette.ink,
  textSecondary: palette.inkSoft,
  textTertiary: palette.inkMuted,
  textOnBrand: palette.white,
  textOnBrandMuted: '#B7D6D2',
  textOnAccent: palette.gold900,

  primary: palette.teal900,
  primaryPressed: palette.teal800,
  primarySoft: palette.teal100,
  primaryTint: palette.teal50,
  onPrimary: palette.white,
  link: palette.teal600,

  accent: palette.gold500,
  accentPressed: palette.gold600,
  accentSoft: palette.gold100,
  accentTint: palette.gold50,
  onAccent: palette.gold900,

  success: palette.green600,
  successSoft: palette.green100,
  warning: palette.amber700,
  warningSoft: palette.amber100,
  danger: palette.red600,
  dangerSoft: palette.red100,
  info: palette.blue700,
  infoSoft: palette.blue100,

  overlay: 'rgba(6, 40, 38, 0.55)',
  skeleton: palette.paperDeep,
} as const;

export type ColorToken = Exclude<keyof typeof colors, 'palette'>;
