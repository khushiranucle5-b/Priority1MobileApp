import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

interface AttendanceCalendarProps {
  currentDate: Date;
  selectedDate: Date;
  onMonthChange: (newDate: Date) => void;
  onDateSelect: (date: Date) => void;
}

export const AttendanceCalendar = ({
  currentDate,
  selectedDate,
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

      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.dayCell,
            isSelected && { backgroundColor: colors.primary[600], borderRadius: borderRadius.md }
          ]}
          onPress={() => onDateSelect(new Date(year, month, i))}
        >
          <AppText
            size="sm"
            weight={isSelected ? 'bold' : undefined}
            style={{ color: isSelected ? '#FFFFFF' : colors.text }}
          >
            {i}
          </AppText>
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
  }
});
