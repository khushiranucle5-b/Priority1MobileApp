// ─── Raw Palette ────────────────────────────────────────────────────────────

const palette = {
  blue: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    400: '#818cf8',
    500: '#6366f1',
    600: '#5b46e5',
    700: '#4338ca',
    900: '#312e81',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#334155',
    700: '#1e293b',
    800: '#0f172a',
    900: '#020617',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    500: '#16a34a',
    600: '#15803d',
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    500: '#d97706',
    600: '#b45309',
  },
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// ─── Light Theme ─────────────────────────────────────────────────────────────

export const colors = {
  // Brand
  primary: {
    50: palette.blue[50],
    100: palette.blue[100],
    200: palette.blue[200],
    400: palette.blue[400],
    500: palette.blue[500],
    600: palette.blue[600],
    700: palette.blue[700],
    900: palette.blue[900],
  },

  // Backgrounds
  background: palette.slate[50] as string,
  surface: palette.white as string,
  surfaceSecondary: palette.slate[100] as string,
  surfacePressed: palette.slate[200] as string,
  card: palette.white as string,
  overlay: 'rgba(0, 0, 0, 0.65)' as string,

  // Text hierarchy (Outdoor High Contrast)
  text: '#0f172a' as string,
  textSecondary: '#334155' as string,
  textTertiary: '#64748b' as string,
  textInverse: palette.white as string,
  textDisabled: '#94a3b8' as string,
  textLink: palette.blue[600] as string,

  // Borders
  border: '#cbd5e1' as string,
  borderStrong: '#94a3b8' as string,
  borderFocus: palette.blue[600] as string,

  // Semantic — secondary
  secondary: '#475569' as string,

  // Emergency (Guard Red)
  emergency: palette.red[600] as string,
  emergencyLight: palette.red[50] as string,
  emergencyBorder: palette.red[100] as string,

  // Status — info
  info: palette.blue[600] as string,
  infoLight: palette.blue[50] as string,
  infoBorder: palette.blue[200] as string,

  // Status — purple
  purple: '#8e44ad' as string,
  purpleLight: '#f5eef8' as string,

  // Status — error
  error: palette.red[600] as string,
  errorLight: palette.red[50] as string,
  errorBorder: palette.red[200] as string,
  errorDark: palette.red[700] as string,

  // Status — success
  success: palette.green[500] as string,
  successLight: palette.green[50] as string,
  successBorder: palette.green[100] as string,
  successDark: palette.green[600] as string,

  // Status — warning
  warning: palette.amber[500] as string,
  warningLight: palette.amber[50] as string,
  warningBorder: palette.amber[100] as string,
  warningDark: palette.amber[600] as string,

  // Disabled states
  disabledBackground: palette.slate[200] as string,
  disabledText: palette.slate[400] as string,
  disabledBorder: palette.slate[300] as string,

  // Skeleton
  skeletonBase: palette.slate[200] as string,
  skeletonHighlight: palette.slate[100] as string,

  // Absolute
  white: palette.white as string,
  black: palette.black as string,
  transparent: palette.transparent as string,
};

export type ThemeColors = typeof colors;

// ─── Dark Theme ───────────────────────────────────────────────────────────────

export const darkColors: ThemeColors = {
  // Brand
  primary: {
    50: palette.blue[50],
    100: palette.blue[100],
    200: palette.blue[200],
    400: palette.blue[400],
    500: palette.blue[500],
    600: palette.blue[600],
    700: palette.blue[700],
    900: palette.blue[900],
  },

  // Backgrounds
  background: palette.slate[900],
  surface: palette.slate[800],
  surfaceSecondary: palette.slate[700],
  surfacePressed: palette.slate[600],
  card: palette.slate[800],
  overlay: 'rgba(0, 0, 0, 0.8)',

  // Text hierarchy
  text: '#ffffff',
  textSecondary: palette.slate[300],
  textTertiary: palette.slate[400],
  textInverse: palette.slate[900],
  textDisabled: palette.slate[500],
  textLink: palette.blue[400],

  // Borders
  border: palette.slate[600],
  borderStrong: palette.slate[500],
  borderFocus: palette.blue[400],

  // Semantic — secondary
  secondary: palette.slate[300],

  // Emergency
  emergency: palette.red[500],
  emergencyLight: 'rgba(239, 68, 68, 0.2)',
  emergencyBorder: 'rgba(239, 68, 68, 0.4)',

  // Status — info
  info: palette.blue[400],
  infoLight: 'rgba(59, 130, 246, 0.2)',
  infoBorder: 'rgba(59, 130, 246, 0.4)',

  // Status — purple
  purple: '#a569bd',
  purpleLight: 'rgba(165, 105, 189, 0.2)',

  // Status — error
  error: palette.red[500],
  errorLight: 'rgba(239, 68, 68, 0.2)',
  errorBorder: 'rgba(239, 68, 68, 0.4)',
  errorDark: palette.red[600],

  // Status — success
  success: '#22c55e',
  successLight: 'rgba(34, 197, 94, 0.2)',
  successBorder: 'rgba(34, 197, 94, 0.4)',
  successDark: palette.green[500],

  // Status — warning
  warning: '#f59e0b',
  warningLight: 'rgba(245, 158, 11, 0.2)',
  warningBorder: 'rgba(245, 158, 11, 0.4)',
  warningDark: palette.amber[500],

  // Disabled states
  disabledBackground: palette.slate[800],
  disabledText: palette.slate[500],
  disabledBorder: palette.slate[700],

  // Skeleton
  skeletonBase: palette.slate[700],
  skeletonHighlight: palette.slate[600],

  // Absolute
  white: palette.white,
  black: palette.black,
  transparent: palette.transparent,
};

