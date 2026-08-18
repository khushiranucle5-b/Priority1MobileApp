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
        <Heading level="h4" color="primary">Shift Attendance </Heading>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isClockedIn ? '#D1FAE5' : '#FEF3C7',
              borderRadius: borderRadius.full,
            },
          ]}
        >
          <AppText
            size="xs"
            weight="bold"
            style={{ color: isClockedIn ? '#059669' : '#D97706' }}
          >
            {attendanceStatus}
          </AppText>
        </View>
      </View>

      {/* Clock Details Row */}
    

      {/* Mutually Exclusive Glove-Friendly Side-by-Side Action Buttons */}
      <View style={styles.actionsContainer}>
        {isClockedIn ? (
          <>
            <Button
              title="Clocked In"
              variant="secondary"
              size="large"
              disabled
              style={[styles.actionBtn, { height: 54, opacity: 0.6 }]}
            />
            <Button
              title="CLOCK OUT"
              variant="primary"
              size="large"
              onPress={handleClockOut}
              style={[styles.actionBtn, { height: 54, backgroundColor: '#DC2626' }]}
            />
          </>
        ) : (
          <>
            <Button
              title="CLOCK IN"
              variant="primary"
              size="large"
              onPress={handleClockIn}
              style={[styles.actionBtn, { height: 54, backgroundColor: '#4F46E5' }]}
            />
            <Button
              title="Clocked Out"
              variant="secondary"
              size="large"
              disabled
              style={[styles.actionBtn, { height: 54, opacity: 0.6 }]}
            />
          </>
        )}
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
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    marginVertical: 0,
  },
});
