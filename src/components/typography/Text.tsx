import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

type TextSize = 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'disabled' | 'link' | 'error' | 'success' | 'warning';

interface AppTextProps extends TextProps {
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor | string;
}

export const AppText: React.FC<AppTextProps> = ({
  size = 'base',
  weight = 'regular',
  color = 'primary',
  style,
  children,
  ...props
}) => {
  const { colors, typography } = useTheme();

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

  return (
    <RNText
      style={[
        styles.base,
        {
          fontSize: typography.fontSize[size],
          fontWeight: typography.fontWeight[weight],
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
