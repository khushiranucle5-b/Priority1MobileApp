import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { a11yButton } from '../../utils/accessibility';

export type GuardButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'emergency';
export type GuardButtonSize = 'small' | 'medium' | 'large';

interface GuardButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: GuardButtonVariant;
  size?: GuardButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const GuardButton: React.FC<GuardButtonProps> = ({
  title,
  variant = 'primary',
  size = 'large',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  disabled,
  ...props
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const isDisabled = disabled || isLoading;

  const getBg = () => {
    if (isDisabled) return colors.disabledBackground;
    switch (variant) {
      case 'primary': return colors.primary[600] || '#1d4ed8';
      case 'secondary': return colors.surfaceSecondary || '#f1f5f9';
      case 'danger': return colors.error || '#dc2626';
      case 'emergency': return colors.emergency || '#dc2626';
      case 'outline':
      case 'ghost': return colors.transparent;
    }
  };

  const getTextColor = () => {
    if (isDisabled) return colors.disabledText;
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return colors.text;
      case 'danger':
      case 'emergency': return '#FFFFFF';
      case 'outline': return colors.primary[600] || '#1d4ed8';
      case 'ghost': return colors.primary[600] || '#1d4ed8';
    }
  };

  const getBorder = () => {
    if (variant === 'outline' || variant === 'secondary') {
      return {
        borderWidth: 2,
        borderColor: isDisabled ? colors.disabledBorder : (variant === 'outline' ? colors.primary[600] : colors.borderStrong),
      };
    }
    if (variant === 'emergency') {
      return {
        borderWidth: 2,
        borderColor: '#FCA5A5',
      };
    }
    return { borderWidth: 0, borderColor: colors.transparent };
  };

  const getMinHeight = () => {
    switch (size) {
      case 'small': return 48;   // Glove touch minimum
      case 'medium': return 54;  // Glove touch medium
      case 'large': return 60;   // Glove touch primary action (56-64px)
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return { paddingVertical: spacing.xs, paddingHorizontal: spacing.base };
      case 'medium': return { paddingVertical: spacing.sm, paddingHorizontal: spacing.xl };
      case 'large': return { paddingVertical: spacing.md, paddingHorizontal: spacing['2xl'] };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return typography.fontSize.sm;
      case 'medium': return typography.fontSize.md;
      case 'large': return typography.fontSize.lg;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: getBg(),
          borderRadius: borderRadius.lg,
          minHeight: getMinHeight(),
          ...getBorder(),
          ...getPadding(),
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
                fontWeight: '700',
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  label: {
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
});
