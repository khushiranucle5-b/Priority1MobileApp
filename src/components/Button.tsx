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

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'emergency';
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
      case 'emergency': return colors.emergency;
      case 'outline':
      case 'ghost': return colors.transparent;
    }
  };

  const getTextColor = () => {
    if (isDisabled) return colors.disabledText;
    switch (variant) {
      case 'primary': return colors.textInverse;
      case 'secondary': return colors.text;
      case 'danger':
      case 'emergency': return colors.textInverse;
      case 'outline': return colors.primary[600];
      case 'ghost': return colors.primary[600];
    }
  };

  const getBorder = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 2,
        borderColor: isDisabled ? colors.disabledBorder : colors.primary[600],
      };
    }
    return { borderWidth: 0, borderColor: colors.transparent };
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return { paddingVertical: 12, paddingHorizontal: 20 };
      case 'large': return { paddingVertical: 16, paddingHorizontal: 28 };
      default: return { paddingVertical: 14, paddingHorizontal: 24 };
    }
  };

  const getMinHeight = () => {
    switch (size) {
      case 'small': return 52;
      case 'large': return 64;
      default: return 56;
    }
  };

  const getHitSlop = () => {
    return { top: 12, bottom: 12, left: 12, right: 12 };
  };

  const getFontSize = () => {
    return typography.fontSize.base; // 18px bold/semibold button text for gloves
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
          {leftIcon && <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>}
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
          {rightIcon && <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View>}
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
