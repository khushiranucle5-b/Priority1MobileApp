import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useLiveAttendance } from '../../../hooks/useLiveAttendance';

export const AttendanceCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const { workingHours, clockInTimeStr, clockOutTimeStr, attendanceStatus } = useLiveAttendance();
  
  const getStatusColor = () => {
    if (attendanceStatus === 'Checked In') return 'success';
    if (attendanceStatus === 'Checked Out') return 'error';
    return 'warning';
  };

  const getStatusIcon = () => {
    if (attendanceStatus === 'Checked In') return '🟢 ';
    if (attendanceStatus === 'Checked Out') return '🔴 ';
    return '🟡 ';
  };

  return (
    <Card variant="flat" style={styles.card}>
      <View style={styles.header}>
        <Heading level="h4">Attendance Status</Heading>
        <AppText size="sm" color={getStatusColor()} weight="medium">
          {getStatusIcon()}{attendanceStatus}
        </AppText>
      </View>

      <View style={[styles.grid, { marginTop: spacing.md }]}>
        <View style={[styles.item, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}>
          <AppText size="xs" color="secondary">Clock In</AppText>
          <AppText size="base" weight="semibold">{clockInTimeStr}</AppText>
        </View>
        <View style={[styles.item, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}>
          <AppText size="xs" color="secondary">Clock Out</AppText>
          <AppText size="base" weight="semibold">{clockOutTimeStr}</AppText>
        </View>
        <View style={[styles.item, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}>
          <AppText size="xs" color="secondary">Working Hrs</AppText>
          <AppText size="base" weight="semibold" style={{ fontVariant: ['tabular-nums'] }}>{workingHours}</AppText>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  item: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  }
});
