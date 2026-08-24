import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { StatusBadge } from '../../../components/StatusBadge';
import { useTheme } from '../../../providers/ThemeProvider';
import { useLiveAttendance } from '../../../hooks/useLiveAttendance';
import { useGuardStore } from '../../../store/useGuardStore';
import { LoggerService } from '../../../services';

export const AttendanceCard: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { workingHours, clockInTimeStr, clockOutTimeStr, attendanceStatus } = useLiveAttendance();
  const { isClockedIn, isClockedOut } = useGuardStore();

  React.useEffect(() => {
    LoggerService.log(`[AttendanceCard] Current Attendance Info - Status: ${attendanceStatus}, ClockIn: ${clockInTimeStr}, ClockOut: ${clockOutTimeStr}`);
  }, [attendanceStatus, clockInTimeStr, clockOutTimeStr]);

  const handleClockIn = () => {
    LoggerService.log('[AttendanceCard] Clock In tapped');
    navigation.navigate('SelfieVerification', { actionType: 'Clock In' });
  };

  const handleClockOut = () => {
    LoggerService.log('[AttendanceCard] Clock Out tapped');
    navigation.navigate('SelfieVerification', { actionType: 'Clock Out' });
  };

  const badgeStatus = isClockedIn ? 'Checked In' : isClockedOut ? 'Checked Out' : 'Not Checked In';

  return (
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View>
          <Heading level="h4" color="primary" style={styles.title}>ATTENDANCE</Heading>
          <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>Real-time Shift Status</AppText>
        </View>
        <StatusBadge status={badgeStatus} size="md" />
      </View>

      <View style={styles.divider} />

      {/* 1. Working Hours at Upper Center */}
      <View style={[styles.workingHoursBox, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border }]}>
        <AppText size="xs" color="secondary" weight="bold" style={{ letterSpacing: 0.8 }}>WORKING HOURS</AppText>
        <AppText size="xl" weight="bold" style={[styles.workingHoursText, { color: isClockedIn ? '#059669' : colors.text }]}>
          {workingHours}
        </AppText>
      </View>

      {/* 2. Button right below Working Hours (Always Enabled) */}
      <View style={styles.actionContainer}>
        {isClockedIn ? (
          <Button
            title="CLOCK OUT"
            variant="danger"
            size="large"
            fullWidth
            onPress={handleClockOut}
            style={styles.actionBtn}
          />
        ) : (
          <Button
            title="CLOCK IN"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleClockIn}
            style={styles.actionBtn}
          />
        )}
      </View>

      {/* 3. Below button: Clock In & Clock Out times side-by-side in one line */}
      <View style={styles.timeRow}>
        <View style={[styles.timeBox, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border }]}>
          <AppText size="xs" color="secondary" weight="bold">CLOCK IN</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.statValue}>
            {isClockedIn || isClockedOut ? clockInTimeStr || '--:--' : '--:--'}
          </AppText>
        </View>

        <View style={[styles.timeBox, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border }]}>
          <AppText size="xs" color="secondary" weight="bold">CLOCK OUT</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.statValue}>
            {isClockedOut ? clockOutTimeStr || '--:--' : '--:--'}
          </AppText>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    letterSpacing: 0.5,
    fontSize: 20,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginVertical: 14,
  },
  workingHoursBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  workingHoursText: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  actionContainer: {
    marginBottom: 16,
  },
  actionBtn: {
    minHeight: 64,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  statValue: {
    marginTop: 2,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
  },
});

