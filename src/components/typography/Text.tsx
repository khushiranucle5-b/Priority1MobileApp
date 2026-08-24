import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

import { typography, TypographyPreset } from '../../theme/tokens/typography';

type TextSize = 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'disabled' | 'link' | 'error' | 'success' | 'warning';

interface AppTextProps extends TextProps {
  preset?: TypographyPreset;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor | string;
}

export const AppText: React.FC<AppTextProps> = ({
  preset,
  size,
  weight,
  color = 'primary',
  style,
  children,
  ...props
}) => {
  const { colors, typography: themeTypography } = useTheme();

  const resolveColor = (): string => {
    switch (color) {
      case 'primary':   return colors.text;
      case 'secondary': return colors.textSecondary;
      case 'tertiary':  return colors.textTertiary;
      case 'inverse':   return colors.textInverse;
      case 'disabled':  return colors.textDisabled;
      case 'link':      return colors.textLink;
      case 'error':     return colors.error;
      case 'success':   return colors.success;
      case 'warning':   return colors.warning;
      default:          return color;
    }
  };

  const presetStyle = preset ? themeTypography.presets[preset] : undefined;
  const computedSize = size ? themeTypography.fontSize[size] : (presetStyle?.fontSize ?? themeTypography.fontSize.base);
  const computedWeight = weight ? themeTypography.fontWeight[weight] : (presetStyle?.fontWeight ?? themeTypography.fontWeight.regular);

  return (
    <RNText
      style={[
        styles.base,
        {
          fontSize: computedSize,
          fontWeight: computedWeight,
          color: resolveColor(),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
