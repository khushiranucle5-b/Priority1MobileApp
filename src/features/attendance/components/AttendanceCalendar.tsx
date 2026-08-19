import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { MergedAttendanceRecord } from '../utils/attendanceLogic';

interface AttendanceCalendarProps {
  currentDate: Date;
  selectedDate: Date;
  monthRecords: MergedAttendanceRecord[];
  onMonthChange: (newDate: Date) => void;
  onDateSelect: (date: Date) => void;
}

export const AttendanceCalendar = ({
  currentDate,
  selectedDate,
  monthRecords,
  onMonthChange,
  onDateSelect,
}: AttendanceCalendarProps) => {
  const { colors, borderRadius } = useTheme();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty slots before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = 
        selectedDate.getDate() === i &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      // Extract yyyy-mm-dd
      const dateStr = new Date(year, month, i, 12).toISOString().split('T')[0];
      const safeMonthRecords = Array.isArray(monthRecords) ? monthRecords : [];
      const record = safeMonthRecords.find(r => r.dateStr === dateStr);
      let borderColor = undefined;
      let borderWidth = 0;

      if (!isSelected && record && record.type !== 'none') {
        borderWidth = 1.5;
        if (record.status.toLowerCase() === 'present') borderColor = colors.success ? colors.success[600] || '#16a34a' : '#16a34a';
        else if (record.status.toLowerCase() === 'absent') borderColor = colors.error ? colors.error[600] || '#dc2626' : '#dc2626';
        else if (record.status.toLowerCase() === 'leave') borderColor = colors.warning ? colors.warning[600] || '#ea580c' : '#ea580c';
      }

      days.push(
        <TouchableOpacity
          key={i}
          style={styles.dayCell}
          onPress={() => onDateSelect(new Date(year, month, i))}
        >
          <View
            style={[
              styles.dateCircle,
              isSelected && { backgroundColor: colors.primary[600], borderColor: 'transparent', borderWidth: 0 },
              (!isSelected && borderColor) ? { borderColor, borderWidth } : null
            ]}
          >
            <AppText
              size="sm"
              weight={isSelected ? 'bold' : undefined}
              style={{ color: isSelected ? '#FFFFFF' : colors.text }}
            >
              {i}
            </AppText>
          </View>
        </TouchableOpacity>
      );
    }
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
          <AppText size="lg" color="primary">‹</AppText>
        </TouchableOpacity>
        
        <AppText size="md" weight="bold" color="primary">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </AppText>
        
        <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
          <AppText size="lg" color="primary">›</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <View key={day} style={styles.dayCell}>
            <AppText size="xs" color="secondary" weight="bold">{day}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {renderCalendarDays()}
      </View>
      
      <View style={[styles.legendContainer, { borderTopColor: colors.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { borderColor: colors.success ? colors.success[600] || '#16a34a' : '#16a34a' }]} />
          <AppText size="xs" color="secondary">Present</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { borderColor: colors.error ? colors.error[600] || '#dc2626' : '#dc2626' }]} />
          <AppText size="xs" color="secondary">Absent</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { borderColor: colors.warning ? colors.warning[600] || '#ea580c' : '#ea580c' }]} />
          <AppText size="xs" color="secondary">Leave</AppText>
        </View>
        <View style={styles.legendItem}>
          <AppText size="xs" color="secondary" style={styles.legendDot}>•</AppText>
          <AppText size="xs" color="secondary">No Record</AppText>
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  legendDot: {
    marginRight: 2,
  }
});
