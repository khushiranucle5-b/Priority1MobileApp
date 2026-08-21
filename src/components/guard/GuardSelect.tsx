import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

interface GuardSelectProps {
  label?: string;
  value: string;
  placeholder?: string;
  icon?: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const GuardSelect: React.FC<GuardSelectProps> = ({
  label,
  value,
  placeholder = 'Select option...',
  icon = '📋',
  onPress,
  disabled = false,
  style,
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();

  return (
    <View style={{ marginBottom: spacing.base }}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: disabled ? colors.disabledText : colors.text,
              fontSize: typography.fontSize.base,
              fontWeight: '700',
              marginBottom: spacing.xs + 2,
              letterSpacing: 0.3,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: disabled ? colors.disabledBackground : colors.surface,
            borderColor: colors.borderStrong || '#cbd5e1',
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.base,
          },
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text
          style={[
            styles.valueText,
            {
              color: value ? colors.text : colors.textTertiary || '#94a3b8',
            },
          ]}
        >
          {value || placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
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
    borderWidth: 2,
    minHeight: 56,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  valueText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    includeFontPadding: false,
  },
  arrow: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: 'bold',
  },
});
