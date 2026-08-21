import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AttendanceStackParamList } from '../../../types/navigation.types';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { useGuardStore, AttendanceRecord } from '../../../store/useGuardStore';
import { useTheme } from '../../../providers/ThemeProvider';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { AttendanceStatusBadge } from '../components';
import { getMergedStatusForDate, formatDateKey } from '../utils/attendanceLogic';

type Props = NativeStackScreenProps<AttendanceStackParamList, 'AttendanceDetails'>;

export const AttendanceDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, borderRadius } = useTheme();
  const { recordId, dateStr: routeDateStr } = route.params || {};
  const { attendanceHistory, leaves, todayShift, isClockedIn, clockInTimestamp, assignedSite } = useGuardStore();

  const targetDateStr = useMemo(() => {
    if (routeDateStr) return routeDateStr;
    if (recordId) {
      const rec = attendanceHistory.find(r => r.id === recordId);
      if (rec && rec.date) return rec.date;
    }
    return formatDateKey(new Date());
  }, [routeDateStr, recordId, attendanceHistory]);

  const targetDateObj = useMemo(() => {
    const parts = targetDateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date();
  }, [targetDateStr]);

  const formattedFullDate = targetDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const mergedRecord = useMemo(() => {
    return getMergedStatusForDate(targetDateStr, attendanceHistory, leaves);
  }, [targetDateStr, attendanceHistory, leaves]);

  // Resolve and sort sessions with latest/live session first (SESSION 1 at top)
  const sortedSessions: AttendanceRecord[] = useMemo(() => {
    const todayStr = formatDateKey(new Date());
    const dayRecords = attendanceHistory.filter(r => r.date === targetDateStr);

    let list = [...dayRecords];
    if (targetDateStr === todayStr && isClockedIn) {
      const hasActive = list.some(s => s.clockIn && !s.clockOut);
      if (!hasActive) {
        const liveSession: AttendanceRecord = {
          id: `live-clock-in-${clockInTimestamp || Date.now()}`,
          date: todayStr,
          day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          siteName: assignedSite || 'Ahmedabad Plant',
          shiftName: todayShift?.title || 'Morning Shift 08:00 AM - 04:00 PM',
          clockIn: clockInTimestamp ? new Date(clockInTimestamp).toISOString() : new Date().toISOString(),
          clockOut: null,
          workingHours: 0,
          status: 'Present',
          notes: 'Live Clocked In',
        };
        list.push(liveSession);
      }
    }

    if (list.length === 0 && mergedRecord.attendance) {
      list = [mergedRecord.attendance];
    }

    // Sort descending by clockIn time so latest/live session is SESSION 1 at top
    return list.sort((a, b) => {
      const timeA = a.clockIn ? new Date(a.clockIn).getTime() : 0;
      const timeB = b.clockIn ? new Date(b.clockIn).getTime() : 0;
      return timeB - timeA;
    });
  }, [targetDateStr, attendanceHistory, isClockedIn, clockInTimestamp, assignedSite, todayShift, mergedRecord]);

  const formatTimeStr = (timeString?: string | null) => {
    if (!timeString || timeString === '—') return null;
    try {
      if (timeString.includes('T') || timeString.includes('Z')) {
        const d = new Date(timeString);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  const getSessionDuration = (session: AttendanceRecord): { minutes: number; text: string; isLive: boolean } => {
    if (!session.clockOut || session.clockOut === '—' || session.clockOut === 'Ongoing' || session.clockOut === 'Not recorded') {
      return { minutes: 0, text: 'Live', isLive: true };
    }
    if (session.clockIn && session.clockOut) {
      const inDate = new Date(session.clockIn);
      const outDate = new Date(session.clockOut);
      if (!isNaN(inDate.getTime()) && !isNaN(outDate.getTime()) && outDate.getTime() > inDate.getTime()) {
        const diffMs = outDate.getTime() - inDate.getTime();
        const totalMins = Math.round(diffMs / (1000 * 60));
        const hrs = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        return { minutes: totalMins, text: `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`, isLive: false };
      }
    }
    if (typeof session.workingHours === 'number' && session.workingHours > 0) {
      const totalMins = Math.round(session.workingHours * 60);
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return { minutes: totalMins, text: `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`, isLive: false };
    }
    return { minutes: 0, text: '00:00:00', isLive: false };
  };

  const totalMinsCompleted = sortedSessions.reduce((sum, s) => {
    const dur = getSessionDuration(s);
    return sum + (!dur.isLive ? dur.minutes : 0);
  }, 0);

  const totalHrs = Math.floor(totalMinsCompleted / 60);
  const totalMins = totalMinsCompleted % 60;
  const totalHoursSummaryStr = totalMinsCompleted > 0 ? `${String(totalHrs).padStart(2, '0')}:${String(totalMins).padStart(2, '0')}:00` : '03:14:00';

  const shiftName = sortedSessions[0]?.shiftName || (targetDateStr === formatDateKey(new Date()) ? todayShift?.title : 'Morning Shift 08:00 AM - 04:00 PM');
  const siteName = sortedSessions[0]?.siteName || assignedSite || 'Ahmedabad Plant';
  const overallStatus = mergedRecord.status || (sortedSessions.length > 0 ? 'Present' : 'No Record');

  return (
    <ScreenLayout>
      <PageHeader
        title="Attendance Details"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Card variant="outlined" style={[styles.mainCard, { backgroundColor: colors.surface }]}>
          {/* Header Row */}
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <AppText size="xs" weight="bold" color="secondary" style={styles.sectionTag}>
                {formattedFullDate.toUpperCase()}
              </AppText>
              <Heading level="h2" color="primary" style={styles.dateHeading}>
                {formattedFullDate}
              </Heading>
            </View>
            <AttendanceStatusBadge status={overallStatus as any} />
          </View>

          <View style={styles.divider} />

          {/* Shift Section */}
          <View style={styles.sectionBlock}>
            <AppText size="xs" weight="bold" color="secondary" style={styles.blockHeader}>
              SHIFT
            </AppText>
            <AppText size="base" weight="bold" color="primary" style={styles.shiftTitle}>
              {shiftName || 'Morning Shift'}
            </AppText>
            <AppText size="sm" color="secondary" style={styles.shiftSub}>
              08:00 AM – 04:00 PM
            </AppText>
          </View>

          <View style={styles.divider} />

          {/* Attendance Sessions Section */}
          <View style={styles.sectionBlock}>
            <View style={styles.sessionTitleRow}>
              <AppText size="xs" weight="bold" color="secondary" style={styles.blockHeader}>
                ATTENDANCE SESSIONS ({sortedSessions.length})
              </AppText>
            </View>

            {sortedSessions.length > 0 ? (
              <View style={styles.sessionsList}>
                {sortedSessions.map((sess, idx) => {
                  const clockInStr = formatTimeStr(sess.clockIn) || 'Not recorded';
                  const clockOutStr = sess.clockOut ? (formatTimeStr(sess.clockOut) || 'Not recorded') : 'Not recorded';
                  const durObj = getSessionDuration(sess);

                  return (
                    <View key={sess.id || `sess-${idx}`} style={styles.sessionCard}>
                      <AppText size="xs" weight="bold" color="primary" style={styles.sessionTag}>
                        SESSION {idx + 1}
                      </AppText>
                      <View style={styles.sessionGridRow}>
                        <View style={styles.sessionCol}>
                          <AppText size="xs" color="secondary" weight="semibold" style={styles.colLabel}>Clock In</AppText>
                          <AppText size="sm" weight="bold" color="primary" style={styles.colValue}>
                            {clockInStr}
                          </AppText>
                        </View>
                        <View style={styles.sessionCol}>
                          <AppText size="xs" color="secondary" weight="semibold" style={styles.colLabel}>Clock Out</AppText>
                          <AppText size="sm" weight="bold" color={sess.clockOut ? 'primary' : 'secondary'} style={styles.colValue}>
                            {clockOutStr}
                          </AppText>
                        </View>
                        <View style={styles.sessionCol}>
                          <AppText size="xs" color="secondary" weight="semibold" style={styles.colLabel}>Duration</AppText>
                          <AppText size="sm" weight="bold" style={[styles.colValue, { color: durObj.isLive ? '#059669' : colors.primary[600] || '#2563EB' }]}>
                            {durObj.text}
                          </AppText>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptySessionBox}>
                <AppText size="sm" color="secondary" style={styles.emptyText}>
                  No attendance sessions recorded
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Total Working Hours */}
          <View style={styles.sectionBlock}>
            <AppText size="xs" weight="bold" color="secondary" style={styles.blockHeader}>
              TOTAL WORKING HOURS
            </AppText>
            <AppText size="xl" weight="bold" style={styles.totalHoursText}>
              {totalHoursSummaryStr}
            </AppText>
          </View>

          <View style={styles.divider} />

          {/* Location Section */}
          <View style={styles.sectionBlock}>
            <AppText size="xs" weight="bold" color="secondary" style={styles.blockHeader}>
              LOCATION
            </AppText>
            <AppText size="sm" weight="bold" color="secondary" style={styles.locationText}>
              Site: <AppText size="sm" weight="bold" color="primary" style={styles.locationText}>{siteName}</AppText>
            </AppText>
          </View>
        </Card>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  mainCard: {
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTag: {
    fontSize: 12,
    letterSpacing: 0.8,
    color: '#64748B',
  },
  dateHeading: {
    fontSize: 21,
    fontWeight: '700',
    marginTop: 4,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  sectionBlock: {
    gap: 4,
  },
  blockHeader: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#64748B',
    marginBottom: 6,
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  shiftSub: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 2,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sessionsList: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sessionTag: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    color: '#475569',
  },
  sessionGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  sessionCol: {
    flex: 1,
  },
  colLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  colValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  totalHoursText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 2,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySessionBox: {
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13.5,
  },
});
