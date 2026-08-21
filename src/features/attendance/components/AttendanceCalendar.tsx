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

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const handlePrevMonth = () => {
    onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Render dynamic calendar weeks (4, 5, or 6 rows)
  const renderCalendarWeeks = () => {
    const totalCells = firstDay + daysInMonth;
    const totalRows = Math.ceil(totalCells / 7);
    const weeks = [];

    const safeMonthRecords = Array.isArray(monthRecords) ? monthRecords : [];

    for (let row = 0; row < totalRows; row++) {
      const weekCells = [];
      for (let col = 0; col < 7; col++) {
        const cellIndex = row * 7 + col;
        const dayNum = cellIndex - firstDay + 1;

        if (cellIndex < firstDay || dayNum > daysInMonth) {
          // Empty slot outside current month
          weekCells.push(
            <View key={`empty-${row}-${col}`} style={styles.dayCell} />
          );
        } else {
          const isSelected =
            selectedDate.getDate() === dayNum &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year;

          const isToday =
            today.getDate() === dayNum &&
            today.getMonth() === month &&
            today.getFullYear() === year;

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const record = safeMonthRecords.find(r => r.dateStr === dateStr);

          let borderColor = undefined;
          let borderWidth = 0;

          if (record && record.type !== 'none') {
            borderWidth = 1.5;
            const statusLower = record.status.toLowerCase();
            if (statusLower === 'present') {
              borderColor = colors.success ? colors.success[600] || '#16a34a' : '#16a34a';
            } else if (statusLower === 'absent') {
              borderColor = colors.error ? colors.error[600] || '#dc2626' : '#dc2626';
            } else if (statusLower === 'leave') {
              borderColor = colors.warning ? colors.warning[600] || '#ea580c' : '#ea580c';
            } else if (statusLower === 'half day') {
              borderColor = '#8b5cf6';
            }
          }

          weekCells.push(
            <TouchableOpacity
              key={`day-${year}-${month}-${dayNum}`}
              style={styles.dayCell}
              onPress={() => onDateSelect(new Date(year, month, dayNum))}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dateCircle,
                  isSelected && {
                    backgroundColor: colors.primary[600],
                    borderColor: borderColor || 'transparent',
                    borderWidth: borderColor ? 2 : 0,
                  },
                  !isSelected && borderColor ? { borderColor, borderWidth } : null,
                  !isSelected && !borderColor && isToday ? { borderColor: colors.primary[500] || '#2563eb', borderWidth: 1.5 } : null,
                ]}
              >
                <AppText
                  size="base"
                  weight={isSelected || isToday ? 'bold' : 'bold'}
                  style={{ color: isSelected ? '#FFFFFF' : colors.text, fontSize: 16, lineHeight: 20 }}
                >
                  {dayNum}
                </AppText>
              </View>
              {isToday && (
                <View style={[styles.todayIndicator, { backgroundColor: isSelected ? '#FFFFFF' : (colors.primary[600] || '#2563eb') }]} />
              )}
            </TouchableOpacity>
          );
        }
      }

      weeks.push(
        <View key={`week-${year}-${month}-${row}`} style={styles.weekRow}>
          {weekCells}
        </View>
      );
    }

    return weeks;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: '#cbd5e1' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AppText size="lg" weight="bold" color="primary" style={styles.navArrow}>‹</AppText>
        </TouchableOpacity>
        
        <AppText size="md" weight="bold" color="primary" style={styles.monthTitle}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </AppText>
        
        <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AppText size="lg" weight="bold" color="primary" style={styles.navArrow}>›</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.headerWeekRow}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <View key={day} style={styles.dayCell}>
            <AppText size="xs" color="secondary" weight="bold" style={styles.weekLabel}>{day}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {renderCalendarWeeks()}
      </View>
      
      <View style={[styles.legendContainer, { borderTopColor: '#E2E8F0' }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { borderColor: '#059669', backgroundColor: '#ECFDF5' }]} />
          <AppText size="xs" color="secondary" style={styles.legendText}>Present</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { borderColor: '#DC2626', backgroundColor: '#FEF2F2' }]} />
          <AppText size="xs" color="secondary" style={styles.legendText}>Absent</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { borderColor: '#7C3AED', backgroundColor: '#F5F3FF' }]} />
          <AppText size="xs" color="secondary" style={styles.legendText}>Half Day</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { borderColor: '#D97706', backgroundColor: '#FFFBEB' }]} />
          <AppText size="xs" color="secondary" style={styles.legendText}>Leave</AppText>
        </View>
        <View style={styles.legendItem}>
          <AppText size="xs" color="secondary" style={styles.legendDot}>•</AppText>
          <AppText size="xs" color="secondary" style={styles.legendText}>No Record</AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1.5,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    padding: 4,
    minWidth: 42,
    minHeight: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
  },
  navArrow: {
    fontSize: 24,
    lineHeight: 26,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerWeekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  calendarGrid: {
    flexDirection: 'column',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  dayCell: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  legendCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  legendDot: {
    fontSize: 16,
    marginRight: 2,
    color: '#94A3B8',
  }
});
