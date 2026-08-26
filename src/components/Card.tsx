import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

export type CardVariant = 'elevated' | 'outlined' | 'flat';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding,
  style,
  ...props
}) => {
  const { theme, colors, shadows, spacing, borderRadius } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: theme === 'dark' ? colors.black : '#e2e8f0',
          ...shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'flat':
        return {
          backgroundColor: colors.surfaceSecondary,
          borderWidth: 1,
          borderColor: colors.border, // Add subtle border even to flat cards in dark mode for better visibility
        };
    }
  };

  return (
    <View
      style={[
        styles.base,
        {
          borderRadius: borderRadius.lg,
          padding: padding ?? spacing.base,
        },
        getVariantStyle(),
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    marginVertical: 4,
  },
});
