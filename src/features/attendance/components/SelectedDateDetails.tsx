import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { MergedAttendanceRecord } from '../utils/attendanceLogic';
import { DBShift } from '../../../services/db';
import { AttendanceRecord } from '../../../store/useGuardStore';

interface SelectedDateDetailsProps {
  record: MergedAttendanceRecord;
  selectedDate: Date;
  shift?: DBShift | null;
}

export const SelectedDateDetails = ({ record, selectedDate, shift }: SelectedDateDetailsProps) => {
  const { colors, borderRadius } = useTheme();

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formatTimeStr = (timeString?: string | null) => {
    if (!timeString || timeString === '—') return '—';
    try {
      if (timeString.includes('T') || timeString.includes('Z')) {
        const d = new Date(timeString);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
        }
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  const getSessionDuration = (session: AttendanceRecord): { minutes: number; text: string } => {
    if (!session.clockOut || session.clockOut === '—' || session.clockOut === 'Ongoing') {
      return { minutes: 0, text: 'Active' };
    }
    
    if (session.clockIn && session.clockOut) {
      const inDate = new Date(session.clockIn);
      const outDate = new Date(session.clockOut);
      if (!isNaN(inDate.getTime()) && !isNaN(outDate.getTime()) && outDate.getTime() > inDate.getTime()) {
        const diffMs = outDate.getTime() - inDate.getTime();
        const totalMins = Math.round(diffMs / (1000 * 60));
        const hrs = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        return {
          minutes: totalMins,
          text: `${hrs}h ${String(mins).padStart(2, '0')}m`
        };
      }
    }

    if (typeof session.workingHours === 'number' && session.workingHours > 0) {
      const totalMins = Math.round(session.workingHours * 60);
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return {
        minutes: totalMins,
        text: `${hrs}h ${String(mins).padStart(2, '0')}m`
      };
    }

    return { minutes: 0, text: '—' };
  };

  const getStatusColors = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'present') {
      return {
        bg: colors.successLight || '#dcfce7',
        text: colors.success ? colors.success[700] || '#15803d' : '#15803d',
        border: colors.success ? colors.success[600] || '#16a34a' : '#16a34a',
      };
    } else if (s === 'absent') {
      return {
        bg: colors.errorLight || '#fee2e2',
        text: colors.error ? colors.error[700] || '#b91c1c' : '#b91c1c',
        border: colors.error ? colors.error[600] || '#dc2626' : '#dc2626',
      };
    } else if (s === 'leave') {
      return {
        bg: colors.warningLight || '#ffedd5',
        text: colors.warning ? colors.warning[700] || '#c2410c' : '#c2410c',
        border: colors.warning ? colors.warning[600] || '#ea580c' : '#ea580c',
      };
    } else if (s === 'half day' || s === 'half-day') {
      return {
        bg: '#f3e8ff',
        text: '#6b21a8',
        border: '#8b5cf6',
      };
    }
    return {
      bg: colors.background || '#f3f4f6',
      text: colors.textSecondary || '#6b7280',
      border: colors.border || '#e5e7eb',
    };
  };

  const statusStyle = getStatusColors(record.status);

  // All punch sessions for this date
  const sessions: AttendanceRecord[] = record.attendances && record.attendances.length > 0 
    ? record.attendances 
    : (record.attendance ? [record.attendance] : []);

  const completedMins = sessions.reduce((sum: number, s: AttendanceRecord) => {
    const dur = getSessionDuration(s);
    return sum + (dur.text !== 'Active' ? dur.minutes : 0);
  }, 0);

  const totalHrs = Math.floor(completedMins / 60);
  const totalMins = completedMins % 60;
  const totalHoursStr = completedMins > 0 ? `${totalHrs}h ${String(totalMins).padStart(2, '0')}m` : '0h 00m';

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <View style={styles.dateTitleBox}>
          <AppText size="xs" weight="bold" color="secondary" style={styles.sectionLabel}>
            SELECTED DATE
          </AppText>
          <AppText size="md" weight="bold" color="primary" style={styles.dateText}>
            {formattedDate}
          </AppText>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <AppText size="xs" weight="bold" style={{ color: statusStyle.text }}>
            {record.status}
          </AppText>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {record.type === 'attendance' && sessions.length > 0 && (
        <View style={styles.detailsGrid}>
          <View style={styles.infoRow}>
            <AppText size="sm" weight="bold" color="secondary" style={styles.infoLabel}>
              Shift
            </AppText>
            <AppText size="sm" weight="medium" color="primary">
              {sessions[0].shiftName || shift?.title || 'Morning Shift 08:00 AM - 04:00 PM'}
            </AppText>
          </View>

          {sessions[0].siteName && (
            <View style={styles.infoRow}>
              <AppText size="sm" weight="bold" color="secondary" style={styles.infoLabel}>
                Site
              </AppText>
              <AppText size="sm" weight="medium" color="primary">
                {sessions[0].siteName}
              </AppText>
            </View>
          )}

          <AppText size="xs" weight="bold" color="secondary" style={styles.sessionsHeader}>
            CLOCK IN / CLOCK OUT PUNCH LOGS ({sessions.length} {sessions.length === 1 ? 'Session' : 'Sessions'})
          </AppText>

          <View style={[styles.tableContainer, { borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <View style={[styles.tableHeaderRow, { backgroundColor: colors.background || 'rgba(0,0,0,0.03)', borderBottomColor: colors.border }]}>
              <AppText size="xs" weight="bold" color="secondary" style={styles.colSession}>Session</AppText>
              <AppText size="xs" weight="bold" color="secondary" style={styles.colTime}>Clock In</AppText>
              <AppText size="xs" weight="bold" color="secondary" style={styles.colTime}>Clock Out</AppText>
              <AppText size="xs" weight="bold" color="secondary" style={styles.colDuration}>Total Hours</AppText>
            </View>

            {sessions.map((sess: AttendanceRecord, idx: number) => {
              const dur = getSessionDuration(sess);
              return (
                <View 
                  key={sess.id || idx} 
                  style={[
                    styles.tableBodyRow, 
                    { borderBottomColor: colors.border },
                    idx === sessions.length - 1 ? { borderBottomWidth: 0 } : null
                  ]}
                >
                  <AppText size="xs" weight="bold" color="primary" style={styles.colSession}>
                    Session {idx + 1}
                  </AppText>
                  <AppText size="xs" color="primary" style={styles.colTime}>
                    {formatTimeStr(sess.clockIn)}
                  </AppText>
                  <AppText size="xs" color="primary" style={styles.colTime}>
                    {sess.clockOut ? formatTimeStr(sess.clockOut) : '—'}
                  </AppText>
                  <AppText 
                    size="xs" 
                    weight="bold" 
                    style={[
                      styles.colDuration,
                      { color: dur.text === 'Active' ? (colors.primary[600] || '#2563eb') : colors.text }
                    ]}
                  >
                    {dur.text}
                  </AppText>
                </View>
              );
            })}
          </View>

          <View style={[styles.totalHoursBox, { backgroundColor: colors.background || 'rgba(0,0,0,0.02)', borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <AppText size="sm" weight="bold" color="primary">
              TOTAL HOURS: {totalHoursStr}
            </AppText>
          </View>
        </View>
      )}

      {record.type === 'leave' && record.leave && (
        <View style={styles.detailsGrid}>
          <View style={styles.infoRow}>
            <AppText size="sm" weight="bold" color="secondary" style={styles.infoLabel}>
              Leave Type
            </AppText>
            <AppText size="sm" weight="bold" color="primary">
              {record.leave.type}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText size="sm" weight="bold" color="secondary" style={styles.infoLabel}>
              Reason
            </AppText>
            <AppText size="sm" color="text">
              {record.leave.reason || 'Not specified'}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText size="sm" weight="bold" color="secondary" style={styles.infoLabel}>
              Duration
            </AppText>
            <AppText size="sm" color="primary">
              {record.leave.days} day(s) ({record.leave.fromDate} to {record.leave.toDate})
            </AppText>
          </View>
        </View>
      )}

      {record.type === 'none' && (
        <View style={styles.emptyBox}>
          <AppText size="sm" color="secondary" style={styles.emptyText}>
            No attendance data for this date.
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTitleBox: {
    flex: 1,
    marginRight: 8,
  },
  sectionLabel: {
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dateText: {
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  detailsGrid: {
    gap: 10,
  },
  sessionsHeader: {
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  infoLabel: {
    minWidth: 110,
  },
  tableContainer: {
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 8,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  tableBodyRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  colSession: {
    width: '25%',
  },
  colTime: {
    width: '27.5%',
  },
  colDuration: {
    width: '20%',
    textAlign: 'right',
  },
  totalHoursBox: {
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyBox: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontStyle: 'italic',
  }
});
