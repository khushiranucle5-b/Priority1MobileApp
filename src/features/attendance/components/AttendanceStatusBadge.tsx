import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../providers/ThemeProvider';

export type AttendanceStatusType = 'Present' | 'Absent' | 'Half Day' | 'Holiday' | 'Leave';

interface Props {
  status: AttendanceStatusType;
}

export const AttendanceStatusBadge: React.FC<Props> = ({ status }) => {
  const { colors, spacing, borderRadius } = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'Present':
        return { color: colors.success, bg: colors.successLight, text: '🟢 Present' };
      case 'Absent':
        return { color: colors.error, bg: colors.errorLight, text: '🔴 Absent' };
      case 'Half Day':
        return { color: colors.warning, bg: colors.warningLight, text: '🟡 Half Day' };
      case 'Holiday':
        return { color: colors.purple, bg: colors.purpleLight, text: '🟣 Holiday' };
      case 'Leave':
        return { color: colors.info, bg: colors.infoLight, text: '🔵 Leave' };
      default:
        return { color: colors.textSecondary, bg: colors.surfaceSecondary, text: status };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderRadius: borderRadius.sm }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
