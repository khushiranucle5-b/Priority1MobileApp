import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { a11yInput } from '../utils/accessibility';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  disabled = false,
  style,
  ...props
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error)     return colors.error;
    if (disabled)  return colors.disabledBorder;
    if (isFocused) return colors.borderFocus;
    return colors.border;
  };

  const getBg = () => {
    if (disabled) return colors.disabledBackground;
    return colors.surface;
  };

  return (
    <View style={{ marginBottom: spacing.base }}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: disabled ? colors.disabledText : colors.text,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.container,
          {
            backgroundColor: getBg(),
            borderColor: getBorderColor(),
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
          },
          style,
        ]}
      >
        {leftIcon && <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: disabled ? colors.disabledText : colors.text,
              fontSize: typography.fontSize.md,
            },
          ]}
          placeholderTextColor={colors.textTertiary}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...(label ? a11yInput(label) : {})}
          {...props}
        />
        {rightIcon && <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View>}
      </View>

      {error && (
        <Text style={[styles.helper, { color: colors.error, fontSize: typography.fontSize.sm }]}>
          {error}
        </Text>
      )}
      {!error && hint && (
        <Text style={[styles.helper, { color: colors.textSecondary, fontSize: typography.fontSize.sm }]}>
          {hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    includeFontPadding: false,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 50,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    includeFontPadding: false,
  },
  helper: {
    marginTop: 4,
    includeFontPadding: false,
  },
});
