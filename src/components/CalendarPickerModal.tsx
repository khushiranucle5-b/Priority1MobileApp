import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
} from 'lucide-react-native';
import { AppText } from './typography/Text';
import { Heading } from './typography/Heading';
import { useTheme } from '../providers/ThemeProvider';

export interface CalendarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (formattedDate: string) => void;
  initialDate?: string;
  title?: string;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CalendarPickerModal = ({
  visible,
  onClose,
  onSelectDate,
  initialDate,
  title = 'Select Date of Birth',
  minYear = 1945,
  maxYear = new Date().getFullYear(),
}: CalendarPickerModalProps) => {
  const { colors, borderRadius } = useTheme();

  // Mode: 'calendar' | 'year' | 'month'
  const [viewMode, setViewMode] = useState<'calendar' | 'year' | 'month'>('calendar');

  const parsedInitial = useMemo(() => {
    if (!initialDate) return null;
    const d = new Date(initialDate);
    if (!isNaN(d.getTime())) return d;
    return null;
  }, [initialDate]);

  const [selectedYear, setSelectedYear] = useState<number>(
    parsedInitial ? parsedInitial.getFullYear() : 1995
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    parsedInitial ? parsedInitial.getMonth() : 9 // October
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(
    parsedInitial ? parsedInitial.getDate() : 12
  );

  // Sync state whenever modal opens or initialDate changes
  useEffect(() => {
    if (visible) {
      setViewMode('calendar');
      if (initialDate) {
        const d = new Date(initialDate);
        if (!isNaN(d.getTime())) {
          setSelectedYear(d.getFullYear());
          setSelectedMonth(d.getMonth());
          setSelectedDay(d.getDate());
          return;
        }
      }
      // Defaults if empty
      setSelectedYear(1995);
      setSelectedMonth(9);
      setSelectedDay(12);
    }
  }, [visible, initialDate]);

  const yearsList = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  // Compute days for calendar month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    const cells: Array<{ day: number | null; key: string }> = [];

    // Leading empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ day: null, key: `empty-${i}` });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, key: `day-${d}` });
    }

    return cells;
  }, [selectedYear, selectedMonth]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      if (selectedYear > minYear) {
        setSelectedYear((prev) => prev - 1);
        setSelectedMonth(11);
      }
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      if (selectedYear < maxYear) {
        setSelectedYear((prev) => prev + 1);
        setSelectedMonth(0);
      }
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const formattedSelected = useMemo(() => {
    if (!selectedDay) return 'No date selected';
    return `${MONTHS_SHORT[selectedMonth]} ${selectedDay}, ${selectedYear}`;
  }, [selectedYear, selectedMonth, selectedDay]);

  const handleConfirm = () => {
    if (!selectedDay) return;
    const result = `${MONTHS_SHORT[selectedMonth]} ${selectedDay}, ${selectedYear}`;
    onSelectDate(result);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface, borderRadius: borderRadius.xl || 16 },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconWrap, { backgroundColor: '#EEF2FF' }]}>
                <CalendarIcon size={18} color="#4F46E5" />
              </View>
              <Heading level="h4" style={[styles.modalTitle, { color: colors.text }]}>
                {title}
              </Heading>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Selected Date Preview Banner */}
          <View style={[styles.previewBanner, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
            <AppText size="xs" weight="medium" style={{ color: '#6366F1' }}>
              SELECTED DATE
            </AppText>
            <AppText size="lg" weight="bold" style={{ color: '#312E81', marginTop: 2 }}>
              {formattedSelected}
            </AppText>
          </View>

          {/* Month & Year Navigation / Switcher */}
          <View style={[styles.navRow, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={handlePrevMonth}
              style={[styles.navArrowBtn, { backgroundColor: colors.surfaceSecondary }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft size={20} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.pickerToggleGroup}>
              {/* Month Selector Toggle */}
              <TouchableOpacity
                onPress={() => setViewMode(viewMode === 'month' ? 'calendar' : 'month')}
                style={[
                  styles.toggleChip,
                  viewMode === 'month' && styles.toggleChipActive,
                  { backgroundColor: viewMode === 'month' ? '#4F46E5' : colors.surfaceSecondary },
                ]}
              >
                <AppText
                  size="sm"
                  weight="bold"
                  style={{ color: viewMode === 'month' ? '#FFFFFF' : colors.text }}
                >
                  {MONTHS[selectedMonth]}
                </AppText>
                <ChevronDown
                  size={14}
                  color={viewMode === 'month' ? '#FFFFFF' : colors.textSecondary}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>

              {/* Year Selector Toggle */}
              <TouchableOpacity
                onPress={() => setViewMode(viewMode === 'year' ? 'calendar' : 'year')}
                style={[
                  styles.toggleChip,
                  viewMode === 'year' && styles.toggleChipActive,
                  { backgroundColor: viewMode === 'year' ? '#4F46E5' : colors.surfaceSecondary },
                ]}
              >
                <AppText
                  size="sm"
                  weight="bold"
                  style={{ color: viewMode === 'year' ? '#FFFFFF' : colors.text }}
                >
                  {selectedYear}
                </AppText>
                <ChevronDown
                  size={14}
                  color={viewMode === 'year' ? '#FFFFFF' : colors.textSecondary}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleNextMonth}
              style={[styles.navArrowBtn, { backgroundColor: colors.surfaceSecondary }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronRight size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Main Body depending on viewMode */}
          {viewMode === 'year' && (
            <View style={styles.viewContainer}>
              <AppText size="xs" weight="bold" style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                SELECT BIRTH YEAR
              </AppText>
              <ScrollView style={styles.yearScroll} contentContainerStyle={styles.yearGrid}>
                {yearsList.map((y) => {
                  const isCurrent = y === selectedYear;
                  return (
                    <TouchableOpacity
                      key={y}
                      style={[
                        styles.yearChip,
                        isCurrent && { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
                        !isCurrent && { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                      ]}
                      onPress={() => {
                        setSelectedYear(y);
                        setViewMode('month');
                      }}
                    >
                      <AppText
                        size="sm"
                        weight={isCurrent ? 'bold' : 'medium'}
                        style={{ color: isCurrent ? '#FFFFFF' : colors.text }}
                      >
                        {y}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {viewMode === 'month' && (
            <View style={styles.viewContainer}>
              <AppText size="xs" weight="bold" style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                SELECT MONTH
              </AppText>
              <View style={styles.monthGrid}>
                {MONTHS_SHORT.map((m, idx) => {
                  const isCurrent = idx === selectedMonth;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.monthChip,
                        isCurrent && { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
                        !isCurrent && { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                      ]}
                      onPress={() => {
                        setSelectedMonth(idx);
                        setViewMode('calendar');
                      }}
                    >
                      <AppText
                        size="sm"
                        weight={isCurrent ? 'bold' : 'medium'}
                        style={{ color: isCurrent ? '#FFFFFF' : colors.text }}
                      >
                        {m}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {viewMode === 'calendar' && (
            <View style={styles.calendarContainer}>
              {/* Weekday Row */}
              <View style={styles.weekdaysRow}>
                {WEEKDAYS.map((w, idx) => (
                  <View key={w} style={styles.weekdayCell}>
                    <AppText
                      size="xs"
                      weight="bold"
                      style={{ color: idx === 0 || idx === 6 ? '#EF4444' : colors.textSecondary }}
                    >
                      {w}
                    </AppText>
                  </View>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {calendarDays.map((cell) => {
                  if (!cell.day) {
                    return <View key={cell.key} style={styles.dayCell} />;
                  }

                  const isSelected = cell.day === selectedDay;

                  return (
                    <TouchableOpacity
                      key={cell.key}
                      style={[
                        styles.dayCell,
                        styles.dayButton,
                        isSelected && { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
                      ]}
                      onPress={() => setSelectedDay(cell.day)}
                      activeOpacity={0.7}
                    >
                      <AppText
                        size="sm"
                        weight={isSelected ? 'bold' : 'medium'}
                        style={{
                          color: isSelected ? '#FFFFFF' : colors.text,
                        }}
                      >
                        {cell.day}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelBtn, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
              activeOpacity={0.7}
            >
              <AppText size="sm" weight="semibold" style={{ color: colors.textSecondary }}>
                Cancel
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!selectedDay}
              style={[
                styles.confirmBtn,
                { backgroundColor: selectedDay ? '#4F46E5' : '#A5B4FC' },
              ]}
              activeOpacity={0.8}
            >
              <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <AppText size="sm" weight="bold" style={{ color: '#FFFFFF' }}>
                Confirm Date
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBanner: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
    alignItems: 'center',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  navArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleChipActive: {
    elevation: 2,
  },
  viewContainer: {
    height: 250,
  },
  sectionSubtitle: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  yearScroll: {
    flex: 1,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingBottom: 10,
  },
  yearChip: {
    width: '22%',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingTop: 10,
  },
  monthChip: {
    width: '30%',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarContainer: {
    minHeight: 250,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  weekdayCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayButton: {
    borderRadius: 19,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
