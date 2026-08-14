import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { Card } from '../../../components/Card';

export const AttendanceHistorySummary: React.FC = () => {
  const { colors, spacing } = useTheme();
  const history = useGuardStore(state => state.attendanceHistory);

  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let halfDays = 0;
    let holidays = 0;
    let totalHours = 0;

    history.forEach(record => {
      if (record.status === 'Present') present++;
      if (record.status === 'Absent') absent++;
      if (record.status === 'Half Day') halfDays++;
      if (record.status === 'Holiday') holidays++;
      totalHours += record.workingHours || 0;
    });

    const totalDays = history.length;
    const avgHours = totalDays > 0 ? (totalHours / present || 0).toFixed(1) : '0.0';

    return { totalDays, present, absent, halfDays, holidays, totalHours: totalHours.toFixed(1), avgHours };
  }, [history]);

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Summary</Text>
        <Text style={[styles.month, { color: colors.primary[600], backgroundColor: colors.primary[50] }]}>
          {currentMonth}
        </Text>
      </View>
      
      <View style={styles.grid}>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalDays}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Days</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.success }]}>{stats.present}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Present</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.error }]}>{stats.absent}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Absent</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.warning }]}>{stats.halfDays}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Half Days</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#9b59b6' }]}>{stats.holidays}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Holidays</Text>
        </View>
      </View>

      <View style={[styles.hoursContainer, { borderTopColor: colors.border }]}>
        <View style={styles.hourBox}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Hours</Text>
          <Text style={[styles.hourValue, { color: colors.text }]}>{stats.totalHours}h</Text>
        </View>
        <View style={styles.hourBox}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg. Hours</Text>
          <Text style={[styles.hourValue, { color: colors.text }]}>{stats.avgHours}h</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  month: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  hoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  hourBox: {
    alignItems: 'center',
    flex: 1,
  },
  hourValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
});
