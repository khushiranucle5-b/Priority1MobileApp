// ─── Raw Palette ────────────────────────────────────────────────────────────

const palette = {
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
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
  overlay: 'rgba(0, 0, 0, 0.5)' as string,

  // Text hierarchy
  text: palette.slate[900] as string,
  textSecondary: palette.slate[600] as string,
  textTertiary: palette.slate[400] as string,
  textInverse: palette.white as string,
  textDisabled: palette.slate[300] as string,
  textLink: palette.blue[600] as string,

  // Borders
  border: palette.slate[200] as string,
  borderStrong: palette.slate[300] as string,
  borderFocus: palette.blue[500] as string,

  // Semantic — secondary
  secondary: palette.slate[600] as string,

  // Status — info
  info: palette.blue[500] as string,
  infoLight: palette.blue[50] as string,
  infoBorder: palette.blue[100] as string,

  // Status — purple
  purple: '#9b59b6' as string,
  purpleLight: '#f5eef8' as string,

  // Status — error
  error: palette.red[500] as string,
  errorLight: palette.red[50] as string,
  errorBorder: palette.red[100] as string,
  errorDark: palette.red[600] as string,

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
  disabledBackground: palette.slate[100] as string,
  disabledText: palette.slate[300] as string,
  disabledBorder: palette.slate[200] as string,

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
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Text hierarchy
  text: palette.slate[50],
  textSecondary: palette.slate[400],
  textTertiary: palette.slate[500],
  textInverse: palette.slate[900],
  textDisabled: palette.slate[600],
  textLink: palette.blue[400],

  // Borders
  border: palette.slate[700],
  borderStrong: palette.slate[600],
  borderFocus: palette.blue[400],

  // Semantic — secondary
  secondary: palette.slate[400],

  // Status — info
  info: palette.blue[400],
  infoLight: 'rgba(96, 165, 250, 0.15)',
  infoBorder: 'rgba(96, 165, 250, 0.3)',

  // Status — purple
  purple: '#a569bd',
  purpleLight: 'rgba(165, 105, 189, 0.15)',

  // Status — error
  error: palette.red[500],
  errorLight: 'rgba(239, 68, 68, 0.15)',
  errorBorder: 'rgba(239, 68, 68, 0.3)',
  errorDark: palette.red[600],

  // Status — success
  success: palette.green[500],
  successLight: 'rgba(34, 197, 94, 0.15)',
  successBorder: 'rgba(34, 197, 94, 0.3)',
  successDark: palette.green[600],

  // Status — warning
  warning: palette.amber[500],
  warningLight: 'rgba(245, 158, 11, 0.15)',
  warningBorder: 'rgba(245, 158, 11, 0.3)',
  warningDark: palette.amber[600],

  // Disabled states
  disabledBackground: palette.slate[800],
  disabledText: palette.slate[600],
  disabledBorder: palette.slate[700],

  // Skeleton
  skeletonBase: palette.slate[700],
  skeletonHighlight: palette.slate[600],

  // Absolute
  white: palette.white,
  black: palette.black,
  transparent: palette.transparent,
};
