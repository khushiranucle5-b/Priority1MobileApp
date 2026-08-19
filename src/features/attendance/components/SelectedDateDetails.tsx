import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { MergedAttendanceRecord } from '../utils/attendanceLogic';

interface SelectedDateDetailsProps {
  record: MergedAttendanceRecord;
  selectedDate: Date;
}

export const SelectedDateDetails = ({ record, selectedDate }: SelectedDateDetailsProps) => {
  const { colors, borderRadius } = useTheme();

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formatTimeStr = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }]}>
      <AppText size="lg" weight="bold" color="primary" style={styles.title}>
        {formattedDate}
      </AppText>

      {record.type === 'attendance' && record.attendance && (
        <View style={styles.detailsBox}>
          <AppText size="md" weight="bold" style={styles.statusLine}>
            Status: {record.status}
          </AppText>
          <AppText size="sm" color="secondary" style={styles.detailLine}>
            <AppText size="sm" weight="bold" color="text">Check In: </AppText>
            {formatTimeStr(record.attendance.clockIn)}
          </AppText>
          {record.attendance.clockOut && (
            <AppText size="sm" color="secondary" style={styles.detailLine}>
              <AppText size="sm" weight="bold" color="text">Check Out: </AppText>
              {formatTimeStr(record.attendance.clockOut)}
            </AppText>
          )}
          {record.attendance.workingHours > 0 && (
            <AppText size="sm" color="secondary" style={styles.detailLine}>
              <AppText size="sm" weight="bold" color="text">Working Hours: </AppText>
              {record.attendance.workingHours.toFixed(1)} hrs
            </AppText>
          )}
          {record.attendance.notes && (
            <AppText size="sm" color="secondary" style={styles.detailLine}>
              <AppText size="sm" weight="bold" color="text">Notes: </AppText>
              {record.attendance.notes}
            </AppText>
          )}
        </View>
      )}

      {record.type === 'leave' && record.leave && (
        <View style={styles.detailsBox}>
          <AppText size="md" weight="bold" style={styles.statusLine}>
            Status: {record.status}
          </AppText>
          <AppText size="sm" color="secondary" style={styles.detailLine}>
            <AppText size="sm" weight="bold" color="text">Leave Type: </AppText>
            {record.leave.type}
          </AppText>
          <AppText size="sm" color="secondary" style={styles.detailLine}>
            <AppText size="sm" weight="bold" color="text">Reason: </AppText>
            {record.leave.reason}
          </AppText>
        </View>
      )}

      {record.type === 'none' && (
        <View style={styles.detailsBox}>
          <AppText size="md" color="secondary">
            {record.status}
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
  },
  detailsBox: {
    gap: 4,
  },
  statusLine: {
    marginBottom: 8,
  },
  detailLine: {
    marginBottom: 4,
  }
});
