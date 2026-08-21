import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

interface GuardListItemProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  status?: React.ReactNode;
  rightAction?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const GuardListItem: React.FC<GuardListItemProps> = ({
  icon,
  title,
  subtitle,
  status,
  rightAction,
  onPress,
  style,
}) => {
  const { colors, borderRadius } = useTheme();

  const ContainerComponent = onPress ? TouchableOpacity : View;

  return (
    <ContainerComponent
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: borderRadius.lg,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.iconBox}>{icon}</View>}

      <View style={styles.contentBox}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        {status && <View style={styles.statusBox}>{status}</View>}
      </View>

      {rightAction && <View style={styles.rightBox}>{rightAction}</View>}
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    borderWidth: 1.5,
    minHeight: 64,
  },
  iconBox: {
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentBox: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
    includeFontPadding: false,
  },
  statusBox: {
    marginTop: 6,
  },
  rightBox: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
