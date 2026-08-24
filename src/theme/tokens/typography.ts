export const typography = {
  fontSize: {
    xs: 15,
    sm: 16,
    base: 18,
    md: 20,
    lg: 22,
    xl: 26,
    '2xl': 28,
    '3xl': 30,
    '4xl': 34,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  presets: {
    screenTitle: {
      fontSize: 26,
      fontWeight: '700' as const,
    },
    sectionHeading: {
      fontSize: 22,
      fontWeight: '600' as const,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 18,
      fontWeight: '400' as const,
    },
    label: {
      fontSize: 16,
      fontWeight: '500' as const,
    },
    helper: {
      fontSize: 15,
      fontWeight: '400' as const,
    },
    button: {
      fontSize: 18,
      fontWeight: '600' as const,
    },
    navLabel: {
      fontSize: 14,
      fontWeight: '600' as const,
    },
  },
} as const;

export type TypographyPreset = keyof typeof typography.presets;

