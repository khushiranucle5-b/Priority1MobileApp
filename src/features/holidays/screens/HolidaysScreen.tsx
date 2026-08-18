import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { useTheme } from '../../../providers/ThemeProvider';

export interface HolidayData {
  id: string;
  name: string;
  dateStr: string;
  dayOfWeek: string;
  type: 'National Holiday' | 'Company Holiday' | 'Festival Holiday';
  isUpcoming: boolean;
  dayOfMonth: number;
  monthIndex: number; // 0-indexed (7 = August)
  year: number;
}

const mockHolidays: HolidayData[] = [
  { id: '1', name: "New Year's Day", dateStr: 'Jan 01, 2026', dayOfWeek: 'Thursday', type: 'National Holiday', isUpcoming: false, dayOfMonth: 1, monthIndex: 0, year: 2026 },
  { id: '2', name: 'Republic Day', dateStr: 'Jan 26, 2026', dayOfWeek: 'Monday', type: 'National Holiday', isUpcoming: false, dayOfMonth: 26, monthIndex: 0, year: 2026 },
  { id: '3', name: 'Holi', dateStr: 'Mar 15, 2026', dayOfWeek: 'Sunday', type: 'Festival Holiday', isUpcoming: false, dayOfMonth: 15, monthIndex: 2, year: 2026 },
  { id: '4', name: 'Independence Day', dateStr: 'Aug 15, 2026', dayOfWeek: 'Saturday', type: 'National Holiday', isUpcoming: true, dayOfMonth: 15, monthIndex: 7, year: 2026 },
  { id: '5', name: 'Foundation Day', dateStr: 'Aug 19, 2026', dayOfWeek: 'Wednesday', type: 'Company Holiday', isUpcoming: true, dayOfMonth: 19, monthIndex: 7, year: 2026 },
  { id: '6', name: 'Company Anniversary', dateStr: 'Sep 10, 2026', dayOfWeek: 'Thursday', type: 'Company Holiday', isUpcoming: true, dayOfMonth: 10, monthIndex: 8, year: 2026 },
  { id: '7', name: 'Diwali', dateStr: 'Nov 01, 2026', dayOfWeek: 'Sunday', type: 'Festival Holiday', isUpcoming: true, dayOfMonth: 1, monthIndex: 10, year: 2026 },
  { id: '8', name: 'Christmas', dateStr: 'Dec 25, 2026', dayOfWeek: 'Friday', type: 'National Holiday', isUpcoming: true, dayOfMonth: 25, monthIndex: 11, year: 2026 },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const HolidaysScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  const [viewType, setViewType] = useState<'List' | 'Calendar'>('List');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(7); // August 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayData | null>(mockHolidays[4]); // Aug 19 Foundation Day

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIndex(prev => prev + 1);
    }
  };

  const handleToday = () => {
    setCurrentMonthIndex(7); // Aug 2026
    setCurrentYear(2026);
  };

  // Build calendar days for currentMonthIndex & currentYear
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sun

  const monthHolidays = mockHolidays.filter(
    h => h.monthIndex === currentMonthIndex && h.year === currentYear
  );

  const getTypeColor = (type: string) => {
    if (type === 'Company Holiday') return { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' };
    if (type === 'Festival Holiday') return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
    return { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC' };
  };

  return (
    <ScreenLayout activeRoute="Holidays">
      <PageHeader title="Company Holidays 2026" showBack />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Toggle Bar: List vs Calendar */}
        <View style={[styles.toggleRow, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewType === 'List' && { backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}
            onPress={() => setViewType('List')}
          >
            <AppText size="sm" weight={viewType === 'List' ? 'bold' : 'medium'} color={viewType === 'List' ? 'primary' : 'secondary'}>
              📋 List View
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, viewType === 'Calendar' && { backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}
            onPress={() => setViewType('Calendar')}
          >
            <AppText size="sm" weight={viewType === 'Calendar' ? 'bold' : 'medium'} color={viewType === 'Calendar' ? 'primary' : 'secondary'}>
              📅 Calendar View
            </AppText>
          </TouchableOpacity>
        </View>

        {viewType === 'List' ? (
          <>
            <Heading level="h4" style={styles.sectionTitle}>Company Holidays List</Heading>
            {mockHolidays.map((holiday) => {
              const themeColors = getTypeColor(holiday.type);
              return (
                <Card key={holiday.id} style={styles.holidayCard}>
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Heading level="h4" color="primary">{holiday.name}</Heading>
                      <AppText size="sm" color="secondary" style={{ marginTop: 2 }}>
                        {holiday.dateStr} ({holiday.dayOfWeek})
                      </AppText>
                    </View>
                    <View style={[styles.badge, { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}>
                      <AppText size="xs" weight="bold" style={{ color: themeColors.text }}>
                        {holiday.type}
                      </AppText>
                    </View>
                  </View>
                  <View style={styles.statusRow}>
                    <View style={styles.statusDot}>
                      <View style={[styles.dot, { backgroundColor: holiday.isUpcoming ? '#10B981' : '#6B7280' }]} />
                      <AppText size="xs" color="secondary" weight="semibold">
                        {holiday.isUpcoming ? 'Active / Upcoming' : 'Past'}
                      </AppText>
                    </View>
                  </View>
                </Card>
              );
            })}
          </>
        ) : (
          /* Calendar View */
          <View>
            {/* Calendar Controls */}
            <View style={styles.calendarHeader}>
              <Heading level="h3" color="primary">{MONTH_NAMES[currentMonthIndex]} {currentYear}</Heading>
              <View style={styles.monthNavBtns}>
                <TouchableOpacity style={[styles.navBtn, { borderColor: colors.border }]} onPress={handlePrevMonth}>
                  <AppText size="md" weight="bold">‹</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navBtn, { borderColor: colors.border }]} onPress={handleToday}>
                  <AppText size="xs" weight="bold">Today</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navBtn, { borderColor: colors.border }]} onPress={handleNextMonth}>
                  <AppText size="md" weight="bold">›</AppText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Days of Week Row */}
            <Card style={styles.calendarCard}>
              <View style={styles.weekDaysRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                  <AppText key={idx} size="xs" weight="bold" color="secondary" style={styles.weekDayText}>
                    {day}
                  </AppText>
                ))}
              </View>

              {/* Grid of Dates */}
              <View style={styles.daysGrid}>
                {/* Blank lead cells */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.dateCell} />
                ))}

                {/* Actual day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const holidayMatch = monthHolidays.find(h => h.dayOfMonth === dayNum);
                  const isSelected = selectedHoliday && selectedHoliday.dayOfMonth === dayNum && selectedHoliday.monthIndex === currentMonthIndex;

                  return (
                    <TouchableOpacity
                      key={dayNum}
                      style={[
                        styles.dateCell,
                        holidayMatch && { backgroundColor: '#4F46E5', borderRadius: 8 },
                        isSelected && { borderWidth: 2, borderColor: '#312E81' },
                      ]}
                      onPress={() => {
                        if (holidayMatch) setSelectedHoliday(holidayMatch);
                      }}
                    >
                      <AppText
                        size="sm"
                        weight={holidayMatch ? 'bold' : 'regular'}
                        color={holidayMatch ? 'inverse' : 'primary'}
                      >
                        {dayNum}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* Selected Holiday Detail Card */}
            {selectedHoliday ? (
              <View style={styles.detailSection}>
                <Heading level="h4" style={{ marginBottom: 8 }}>Holiday Details</Heading>
                <Card style={[styles.holidayCard, { borderColor: '#4F46E5', borderWidth: 1.5 }]}>
                  <Heading level="h3" color="primary">{selectedHoliday.name}</Heading>
                  <AppText size="sm" color="secondary" style={{ marginTop: 4 }}>
                    {selectedHoliday.dateStr} ({selectedHoliday.dayOfWeek})
                  </AppText>
                  <View style={[styles.badge, { backgroundColor: '#EEF2FF', marginTop: 10, alignSelf: 'flex-start' }]}>
                    <AppText size="xs" weight="bold" style={{ color: '#4F46E5' }}>
                      {selectedHoliday.type}
                    </AppText>
                  </View>
                </Card>
              </View>
            ) : (
              <View style={styles.detailSection}>
                <AppText size="sm" color="secondary" style={{ textAlign: 'center', marginTop: 12 }}>
                  Tap a highlighted date on the calendar to view holiday details.
                </AppText>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  toggleRow: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 14,
  },
  holidayCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  statusDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthNavBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  navBtn: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  calendarCard: {
    padding: 12,
    marginBottom: 16,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: '14.28%',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  detailSection: {
    marginTop: 10,
  },
});
