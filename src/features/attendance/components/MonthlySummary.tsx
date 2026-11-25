import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { MergedAttendanceRecord } from '../utils/attendanceLogic';

interface MonthlySummaryProps {
  monthRecords: MergedAttendanceRecord[];
}

export const MonthlySummary = ({ monthRecords }: MonthlySummaryProps) => {
  const { colors, borderRadius } = useTheme();

  const safeMonthRecords = Array.isArray(monthRecords) ? monthRecords : [];
  const presentCount = safeMonthRecords.filter(r => r.normalizedStatus === 'PRESENT').length;
  const absentCount = safeMonthRecords.filter(r => r.normalizedStatus === 'ABSENT').length;
  const halfDayCount = safeMonthRecords.filter(r => r.normalizedStatus === 'HALF_DAY').length;
  const leaveCount = safeMonthRecords.filter(r => r.normalizedStatus === 'LEAVE').length;

  const stats = [
    { label: 'Present', count: presentCount, color: colors.successDark, bg: colors.successLight, border: colors.success },
    { label: 'Absent', count: absentCount, color: colors.errorDark, bg: colors.errorLight, border: colors.error },
    { label: 'Half Day', count: halfDayCount, color: colors.primary[600], bg: colors.primary[50], border: colors.primary[600] },
    { label: 'Leave', count: leaveCount, color: colors.warningDark, bg: colors.warningLight, border: colors.warning },
  ];

  return (
    <View style={styles.grid}>
      {stats.map((item) => (
        <View
          key={item.label}
          style={[
            styles.card,
            {
              backgroundColor: item.bg,
              borderColor: item.border,
              borderRadius: borderRadius.lg || 12,
            },
          ]}
        >
          <AppText size="xl" weight="bold" style={{ color: item.color, fontSize: 24, lineHeight: 28 }}>
            {item.count}
          </AppText>
          <AppText size="sm" weight="bold" style={{ color: item.color, fontSize: 14, marginTop: 4 }}>
            {item.label}
          </AppText>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  card: {
    width: '48%',
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
});
