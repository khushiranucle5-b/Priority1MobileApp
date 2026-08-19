import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { MergedAttendanceRecord } from '../utils/attendanceLogic';

interface MonthlySummaryProps {
  monthRecords: MergedAttendanceRecord[];
}

export const MonthlySummary = ({ monthRecords }: MonthlySummaryProps) => {
  const { colors, borderRadius } = useTheme();

  const presentCount = monthRecords.filter(r => r.type === 'attendance' && r.status.toLowerCase() === 'present').length;
  const absentCount = monthRecords.filter(r => r.type === 'attendance' && r.status.toLowerCase() === 'absent').length;
  const leaveCount = monthRecords.filter(r => r.type === 'leave').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }]}>
      <View style={styles.statBox}>
        <AppText size="lg" weight="bold" color="primary">{presentCount}</AppText>
        <AppText size="sm" color="secondary">Present</AppText>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.statBox}>
        <AppText size="lg" weight="bold" color="primary">{absentCount}</AppText>
        <AppText size="sm" color="secondary">Absent</AppText>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.statBox}>
        <AppText size="lg" weight="bold" color="primary">{leaveCount}</AppText>
        <AppText size="sm" color="secondary">Leave</AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '100%',
  },
});
