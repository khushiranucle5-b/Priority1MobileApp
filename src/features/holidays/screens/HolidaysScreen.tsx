import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { HolidayCard, HolidayData } from '../components/HolidayCard';

const mockHolidays: HolidayData[] = [
  { id: '1', name: 'New Year Day', dateStr: 'Jan 01, 2026', dayOfWeek: 'Thursday', type: 'National Holiday', isUpcoming: false },
  { id: '2', name: 'Republic Day', dateStr: 'Jan 26, 2026', dayOfWeek: 'Monday', type: 'National Holiday', isUpcoming: false },
  { id: '3', name: 'Holi', dateStr: 'Mar 15, 2026', dayOfWeek: 'Sunday', type: 'Festival Holiday', isUpcoming: false },
  { id: '4', name: 'Independence Day', dateStr: 'Aug 15, 2026', dayOfWeek: 'Saturday', type: 'National Holiday', isUpcoming: true },
  { id: '5', name: 'Foundation Day', dateStr: 'Sep 10, 2026', dayOfWeek: 'Thursday', type: 'Company Holiday', isUpcoming: true },
  { id: '6', name: 'Diwali', dateStr: 'Nov 01, 2026', dayOfWeek: 'Sunday', type: 'Festival Holiday', isUpcoming: true },
  { id: '7', name: 'Christmas', dateStr: 'Dec 25, 2026', dayOfWeek: 'Friday', type: 'National Holiday', isUpcoming: true },
];

export const HolidaysScreen: React.FC = () => {
  const { colors, spacing } = useTheme();

  const upcomingHolidays = mockHolidays.filter(h => h.isUpcoming);
  const pastHolidays = mockHolidays.filter(h => !h.isUpcoming);
  const nextHoliday = upcomingHolidays.length > 0 ? upcomingHolidays[0] : null;
  const remainingUpcoming = upcomingHolidays.slice(1);

  return (
    <ScreenLayout>
      <PageHeader title="Company Holidays 2026" showBack />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {nextHoliday && (
          <View style={styles.section}>
            <Heading level="h4" style={styles.sectionTitle}>Next Upcoming Holiday</Heading>
            <HolidayCard data={nextHoliday} />
          </View>
        )}

        {remainingUpcoming.length > 0 && (
          <View style={styles.section}>
            <Heading level="h4" style={styles.sectionTitle}>Upcoming Holidays</Heading>
            {remainingUpcoming.map((holiday) => (
              <HolidayCard key={holiday.id} data={holiday} />
            ))}
          </View>
        )}

        {pastHolidays.length > 0 && (
          <View style={styles.section}>
            <Heading level="h4" style={styles.sectionTitle}>Past Holidays</Heading>
            {pastHolidays.map((holiday) => (
              <View key={holiday.id} style={{ opacity: 0.6 }}>
                <HolidayCard data={holiday} />
              </View>
            ))}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  }
});
