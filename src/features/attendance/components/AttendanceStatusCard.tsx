import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

import { useLiveAttendance } from '../../../hooks/useLiveAttendance';

export const AttendanceStatusCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const { attendanceStatus } = useLiveAttendance();

  const getBadgeStyle = () => {
    if (attendanceStatus === 'Checked In') {
      return { bg: colors.successLight, color: colors.success[700] };
    }
    if (attendanceStatus === 'Checked Out') {
      return { bg: colors.warningLight, color: colors.warning[700] };
    }
    return { bg: colors.surfaceSecondary, color: colors.textSecondary };
  };

  const badgeStyle = getBadgeStyle();

  return (
    <Card variant="flat" style={styles.card}>
      <View style={styles.content}>
        <AppText size="sm" color="secondary">Current Status</AppText>
        <View style={[styles.badge, { backgroundColor: badgeStyle.bg, borderRadius: borderRadius.full, marginTop: spacing.xs }]}>
          <AppText size="base" style={{ color: badgeStyle.color }} weight="bold">{attendanceStatus}</AppText>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  }
});
