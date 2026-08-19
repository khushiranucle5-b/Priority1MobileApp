import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { MergedAttendanceRecord } from '../utils/attendanceLogic';

interface DatewiseAttendanceListProps {
  monthRecords: MergedAttendanceRecord[];
}

export const DatewiseAttendanceList = ({ monthRecords }: DatewiseAttendanceListProps) => {
  const { colors, borderRadius } = useTheme();

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

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Only show dates that have an explicit status (Present, Absent, Leave)
  const safeMonthRecords = Array.isArray(monthRecords) ? monthRecords : [];
  const listRecords = safeMonthRecords.filter(r => r.type !== 'none');

  if (listRecords.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <AppText size="sm" color="secondary">No attendance records found for this month.</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppText size="md" weight="bold" color="primary" style={styles.listTitle}>
        Attendance Details
      </AppText>
      
      {listRecords.map(record => (
        <View 
          key={record.dateStr} 
          style={[styles.recordCard, { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderColor: colors.border }]}
        >
          <View style={styles.recordHeader}>
            <AppText size="sm" weight="bold" color="primary">
              {formatDateLabel(record.dateStr)}
            </AppText>
            <View style={[styles.statusBadge, { 
              backgroundColor: record.status.toLowerCase() === 'present' ? colors.successLight : 
                               record.status.toLowerCase() === 'leave' ? colors.primary[50] : 
                               colors.warningLight 
            }]}>
              <AppText size="xs" weight="bold" style={{ 
                color: record.status.toLowerCase() === 'present' ? colors.success[700] : 
                       record.status.toLowerCase() === 'leave' ? colors.primary[700] : 
                       colors.warning[700] 
              }}>
                {record.status}
              </AppText>
            </View>
          </View>
          
          {record.type === 'attendance' && record.attendance && (
            <View style={styles.recordBody}>
              <View style={styles.bodyRow}>
                <AppText size="xs" color="secondary">Clock In: </AppText>
                <AppText size="xs" weight="medium">{formatTimeStr(record.attendance.clockIn)}</AppText>
              </View>
              <View style={styles.bodyRow}>
                <AppText size="xs" color="secondary">Clock Out: </AppText>
                <AppText size="xs" weight="medium">{formatTimeStr(record.attendance.clockOut)}</AppText>
              </View>
            </View>
          )}

          {record.type === 'leave' && record.leave && (
            <View style={styles.recordBody}>
              <View style={styles.bodyRow}>
                <AppText size="xs" color="secondary">Type: </AppText>
                <AppText size="xs" weight="medium">{record.leave.type}</AppText>
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listTitle: {
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  recordCard: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordBody: {
    flexDirection: 'row',
    gap: 16,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
