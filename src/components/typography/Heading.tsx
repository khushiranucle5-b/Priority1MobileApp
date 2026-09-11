import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

interface HeadingProps extends TextProps {
  level?: HeadingLevel;
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'success' | 'warning' | string;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 'h2',
  color,
  style,
  children,
  ...props
}) => {
  const { colors, typography } = useTheme();

  const levelMap: Record<HeadingLevel, { fontSize: number; fontWeight: '700' | '600' }> = {
    h1: { fontSize: typography.fontSize['3xl'], fontWeight: '700' }, // 30px Hero
    h2: { fontSize: typography.fontSize.xl,     fontWeight: '700' }, // 26px Screen Title
    h3: { fontSize: typography.fontSize.lg,     fontWeight: '600' }, // 22px Section Heading
    h4: { fontSize: typography.fontSize.md,     fontWeight: '600' }, // 20px Card Title
  };

  const { fontSize, fontWeight } = levelMap[level];

  const resolveColor = (): string => {
    if (!color) return colors.text;
    switch (color) {
      case 'primary':   return colors.text;
      case 'secondary': return colors.textSecondary;
      case 'tertiary':  return colors.textTertiary;
      case 'inverse':   return colors.textInverse;
      case 'error':     return colors.error;
      case 'success':   return colors.success;
      case 'warning':   return colors.warning;
      default:          return color;
    }
  };

  return (
    <Text
      style={[
        styles.base,
        { fontSize, fontWeight, color: resolveColor() },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
