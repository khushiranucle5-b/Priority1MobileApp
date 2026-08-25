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

  // Resolve and sort sessions with latest/live session first
  const sortedSessions: AttendanceRecord[] = useMemo(() => {
    const isSameDateKey = (d1Str?: string | null, d2Str?: string | null) => {
      if (!d1Str || !d2Str) return false;
      if (d1Str === d2Str) return true;
      try {
        const k1 = formatDateKey(new Date(d1Str));
        const k2 = formatDateKey(new Date(d2Str));
        return k1 === k2;
      } catch {
        return false;
      }
    };

    let dayRecords = attendanceHistory.filter(r => isSameDateKey(r.date, targetDateStr) || isSameDateKey(r.clockIn, targetDateStr));

    // Deduplicate by ID or identical clockIn timestamp
    const uniqueMap = new Map<string, AttendanceRecord>();
    dayRecords.forEach(rec => {
      const key = rec.id || `${rec.clockIn}-${rec.clockOut}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, rec);
      }
    });

    let list = Array.from(uniqueMap.values());

    if (list.length === 0 && mergedRecord.attendance) {
      list = [mergedRecord.attendance];
    }

    const isToday = isSameDateKey(targetDateStr, formatDateKey(new Date()));
    if (isToday && isClockedIn && clockInTimestamp) {
      const hasOpenSession = list.some(s => !s.clockOut || s.clockOut === '—' || s.clockOut === 'Ongoing' || s.clockOut === 'null');
      if (!hasOpenSession) {
        const liveRecord: AttendanceRecord = {
          id: `att-live-${clockInTimestamp}`,
          date: targetDateStr,
          day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          siteName: assignedSite || 'Ahmedabad Plant',
          shiftName: todayShift ? todayShift.title : 'Day Shift Guard',
          clockIn: new Date(clockInTimestamp).toISOString(),
          clockOut: null,
          workingHours: 0,
          status: 'Present',
          notes: 'Active Clocked In Session',
        };
        list.unshift(liveRecord);
      }
    }

    // Sort descending by clockIn time so latest/live session is SESSION 1 at top
    return list.sort((a, b) => {
      const timeA = a.clockIn ? new Date(a.clockIn).getTime() : 0;
      const timeB = b.clockIn ? new Date(b.clockIn).getTime() : 0;
      return timeB - timeA;
    });
  }, [targetDateStr, attendanceHistory, mergedRecord, isClockedIn, clockInTimestamp, assignedSite, todayShift]);

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
    const isClockedOutValid = session.clockOut &&
      session.clockOut !== '—' &&
      session.clockOut !== 'Ongoing' &&
      session.clockOut !== 'Not recorded' &&
      session.clockOut !== 'null' &&
      session.clockOut !== 'undefined';

    if (!isClockedOutValid) {
      return { minutes: 0, text: 'Live', isLive: true };
    }

    if (session.clockIn && session.clockOut) {
      const inDate = new Date(session.clockIn);
      const outDate = new Date(session.clockOut);
      if (!isNaN(inDate.getTime()) && !isNaN(outDate.getTime()) && outDate.getTime() >= inDate.getTime()) {
        const diffMs = Math.max(0, outDate.getTime() - inDate.getTime());
        const totalSecs = Math.floor(diffMs / 1000);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        return {
          minutes: Math.round(diffMs / 60000),
          text: `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
          isLive: false
        };
      }
    }

    return { minutes: 0, text: '00:00:00', isLive: false };
  };

  const totalMinsCompleted = sortedSessions.reduce((sum, s) => {
    const dur = getSessionDuration(s);
    return sum + (!dur.isLive ? dur.minutes : 0);
  }, 0);

  const totalHrs = Math.floor(totalMinsCompleted / 60);
  const totalMins = totalMinsCompleted % 60;
  const totalHoursSummaryStr = `${String(totalHrs).padStart(2, '0')}:${String(totalMins).padStart(2, '0')}:00`;

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
            <AppText size="sm" weight="bold" color="secondary" style={styles.blockHeader}>
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
              <AppText size="sm" weight="bold" color="secondary" style={styles.blockHeader}>
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
                      <AppText size="sm" weight="bold" color="primary" style={styles.sessionTag}>
                        SESSION {idx + 1}
                      </AppText>
                      <View style={styles.sessionGridRow}>
                        <View style={styles.sessionCol}>
                          <AppText size="sm" color="secondary" weight="semibold" style={styles.colLabel}>Clock In</AppText>
                          <AppText size="md" weight="bold" color="primary" style={styles.colValue}>
                            {clockInStr}
                          </AppText>
                        </View>
                        <View style={styles.sessionCol}>
                          <AppText size="sm" color="secondary" weight="semibold" style={styles.colLabel}>Clock Out</AppText>
                          <AppText size="md" weight="bold" color={sess.clockOut ? 'primary' : 'secondary'} style={styles.colValue}>
                            {clockOutStr}
                          </AppText>
                        </View>
                        <View style={styles.sessionCol}>
                          <AppText size="sm" color="secondary" weight="semibold" style={styles.colLabel}>Duration</AppText>
                          <AppText size="md" weight="bold" style={[styles.colValue, { color: durObj.isLive ? '#059669' : colors.primary[600] || '#2563EB' }]}>
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
            <AppText size="sm" weight="bold" color="secondary" style={styles.blockHeader}>
              TOTAL WORKING HOURS
            </AppText>
            <AppText size="xl" weight="bold" style={styles.totalHoursText}>
              {totalHoursSummaryStr}
            </AppText>
          </View>

          <View style={styles.divider} />

          {/* Location Section */}
          <View style={styles.sectionBlock}>
            <AppText size="sm" weight="bold" color="secondary" style={styles.blockHeader}>
              LOCATION
            </AppText>
            <AppText size="md" weight="bold" color="secondary" style={styles.locationText}>
              Site: <AppText size="md" weight="bold" color="primary" style={styles.locationText}>{siteName}</AppText>
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
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#475569',
    marginBottom: 6,
  },
  shiftTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  shiftSub: {
    fontSize: 15,
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
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  colValue: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  totalHoursText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 4,
  },
  locationText: {
    fontSize: 17,
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
