import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { a11yButton } from '../utils/accessibility';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  disabled,
  ...props
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const isDisabled = disabled || isLoading;

  const getBg = () => {
    if (isDisabled) return colors.disabledBackground;
    switch (variant) {
      case 'primary': return colors.primary[600];
      case 'secondary': return colors.surfaceSecondary;
      case 'danger': return colors.error;
      case 'outline':
      case 'ghost': return colors.transparent;
    }
  };

  const getTextColor = () => {
    if (isDisabled) return colors.disabledText;
    switch (variant) {
      case 'primary': return colors.textInverse;
      case 'secondary': return colors.text;
      case 'danger': return colors.textInverse;
      case 'outline': return colors.primary[600];
      case 'ghost': return colors.primary[600];
    }
  };

  const getBorder = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1.5,
        borderColor: isDisabled ? colors.disabledBorder : colors.primary[600],
      };
    }
    return { borderWidth: 0, borderColor: colors.transparent };
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return { paddingVertical: spacing.xs, paddingHorizontal: spacing.md };
      case 'large': return { paddingVertical: spacing.md, paddingHorizontal: spacing['2xl'] };
      default: return { paddingVertical: spacing.sm, paddingHorizontal: spacing.xl };
    }
  };

  const getMinHeight = () => {
    switch (size) {
      case 'small': return 36;
      case 'large': return 56;
      default: return 48; // standard 48 dp minimum touch target
    }
  };

  const getHitSlop = () => {
    if (size === 'small') {
      // 36 dp visible height + 6 dp slop on top & bottom = 48 dp total touch target
      return { top: 6, bottom: 6, left: 6, right: 6 };
    }
    return undefined;
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return typography.fontSize.sm;
      case 'large': return typography.fontSize.lg;
      default: return typography.fontSize.md;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: getBg(),
          borderRadius: borderRadius.md,
          minHeight: getMinHeight(),
          ...getBorder(),
          ...getPadding(),
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.75}
      hitSlop={getHitSlop()}
      {...a11yButton(title, undefined, isDisabled)}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {leftIcon && <View style={{ marginRight: spacing.xs }}>{leftIcon}</View>}
          <Text
            style={[
              styles.label,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                fontWeight: typography.fontWeight.semibold,
              },
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={{ marginLeft: spacing.xs }}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  label: {
    fontWeight: '600',
    includeFontPadding: false,
  },
});
