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

export const ClockInOutActionCard: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { attendanceStatus, workingHours, clockInTimeStr } = useLiveAttendance();
  const { isClockedIn, isClockedOut } = useGuardStore();

  const handleClockIn = () => {
    LoggerService.log('[ClockInOutActionCard] Clock In tapped');
    navigation.navigate('SelfieVerification', { actionType: 'Clock In' });
  };

  const handleClockOut = () => {
    LoggerService.log('[ClockInOutActionCard] Clock Out tapped');
    navigation.navigate('SelfieVerification', { actionType: 'Clock Out' });
  };

  const badgeStatus = isClockedIn ? 'Checked In' : isClockedOut ? 'Checked Out' : 'Not Checked In';

  return (
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.headerRow}>
        <View>
          <Heading level="h4" color="primary">ATTENDANCE</Heading>
          <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>Real-time Shift Status</AppText>
        </View>
        <StatusBadge status={badgeStatus} size="md" />
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <AppText size="xs" color="secondary" weight="semibold">CLOCK IN TIME</AppText>
          <AppText size="base" weight="bold" color="primary" style={{ marginTop: 2 }}>
            {isClockedIn || isClockedOut ? clockInTimeStr || '--:--' : '--:--'}
          </AppText>
        </View>

        <View style={styles.statBox}>
          <AppText size="xs" color="secondary" weight="semibold">WORKING HOURS</AppText>
          <AppText size="base" weight="bold" style={{ color: isClockedIn ? '#059669' : colors.text, marginTop: 2 }}>
            {workingHours}
          </AppText>
        </View>
      </View>

      {/* Dominant 60px Primary Action Button */}
      <View style={styles.actionBox}>
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
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 18,
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#cbd5e1',
    marginVertical: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: 120,
  },
  actionBox: {
    marginTop: 4,
  },
  actionBtn: {
    height: 60,
  },
});
