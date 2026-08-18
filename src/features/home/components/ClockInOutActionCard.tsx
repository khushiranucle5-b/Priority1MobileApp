import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useLiveAttendance } from '../../../hooks/useLiveAttendance';
import { useGuardStore } from '../../../store/useGuardStore';
import { LoggerService } from '../../../services';

export const ClockInOutActionCard: React.FC = () => {
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { workingHours, clockInTimeStr, attendanceStatus } = useLiveAttendance();
  const { isClockedIn } = useGuardStore();

  const handleClockIn = () => {
    LoggerService.log('[ClockInOutActionCard] Clock In tapped');
    navigation.navigate('Attendance', { screen: 'SelfieVerification', params: { actionType: 'Clock In' } });
  };

  const handleClockOut = () => {
    LoggerService.log('[ClockInOutActionCard] Clock Out tapped');
    navigation.navigate('Attendance', { screen: 'SelfieVerification', params: { actionType: 'Clock Out' } });
  };

  return (
    <Card variant="elevated" style={[styles.card, { backgroundColor: colors.surface, ...shadows.md }]}>
      <View style={styles.headerRow}>
        <Heading level="h4" color="primary">Shift Attendance & Action</Heading>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isClockedIn ? colors.successLight : colors.warningLight,
              borderRadius: borderRadius.full,
            },
          ]}
        >
          <AppText
            size="xs"
            weight="bold"
            style={{ color: isClockedIn ? colors.success[700] : colors.warning[700] }}
          >
            {attendanceStatus}
          </AppText>
        </View>
      </View>

      {/* Clock Details Row */}
      {isClockedIn ? (
        <View style={[styles.detailsBox, { backgroundColor: colors.primary[50], borderRadius: borderRadius.md, padding: spacing.sm }]}>
          <View style={styles.detailItem}>
            <AppText size="xs" color="secondary">Clock In Time</AppText>
            <AppText size="sm" weight="bold" color="primary">{clockInTimeStr}</AppText>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <AppText size="xs" color="secondary">Working Duration</AppText>
            <AppText size="sm" weight="bold" color="success" style={{ fontVariant: ['tabular-nums'] }}>
              {workingHours}
            </AppText>
          </View>
        </View>
      ) : (
        <AppText size="xs" color="secondary" style={styles.hintText}>
          📍 You are currently not clocked in. Tap Clock In below when arriving at your assigned site.
        </AppText>
      )}

      {/* Mutually Exclusive Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          title={isClockedIn ? "Clocked In" : "Clock In"}
          variant={isClockedIn ? "secondary" : "primary"}
          size="large"
          fullWidth
          disabled={isClockedIn}
          onPress={handleClockIn}
          style={styles.actionBtn}
        />
        <Button
          title="Clock Out"
          variant={isClockedIn ? "primary" : "secondary"}
          size="large"
          fullWidth
          disabled={!isClockedIn}
          onPress={handleClockOut}
          style={styles.actionBtn}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  detailsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  hintText: {
    marginBottom: 14,
    lineHeight: 18,
  },
  actionsContainer: {
    gap: 10,
  },
  actionBtn: {
    marginVertical: 0,
  },
});
