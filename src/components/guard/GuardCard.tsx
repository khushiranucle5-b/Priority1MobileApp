import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

export type GuardCardVariant = 'elevated' | 'outlined' | 'flat';

interface GuardCardProps extends ViewProps {
  variant?: GuardCardVariant;
  padding?: number;
}

export const GuardCard: React.FC<GuardCardProps> = ({
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
          borderWidth: 1.5,
          borderColor: colors.border,
          shadowColor: theme === 'dark' ? colors.black : '#94a3b8',
          ...shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 2,
          borderColor: colors.borderStrong,
        };
      case 'flat':
        return {
          backgroundColor: colors.surfaceSecondary,
          borderWidth: 1.5,
          borderColor: colors.border,
        };
    }
  };

  return (
    <View
      style={[
        styles.base,
        {
          borderRadius: borderRadius.lg,
          padding: padding ?? spacing.lg,
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
    marginVertical: 6,
  },
});
