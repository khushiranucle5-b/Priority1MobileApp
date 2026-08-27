import React, { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { Heading } from '../../../components/typography/Heading';
import { AppText } from '../../../components/typography/Text';
import { useGuardStore } from '../../../store/useGuardStore';

import { 
  MonthlySummary, 
  AttendanceCalendar
} from '../components';
import { getMonthRecords, formatDateKey } from '../utils/attendanceLogic';

export const AttendanceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { attendanceHistory, leaves } = useGuardStore();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const monthRecords = useMemo(() => {
    return getMonthRecords(currentDate.getFullYear(), currentDate.getMonth(), attendanceHistory, leaves);
  }, [currentDate, attendanceHistory, leaves]);

  // Tapping ANY date opens a NEW dedicated Attendance Details page
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const targetDateStr = formatDateKey(date);
    navigation.navigate('AttendanceDetails', { dateStr: targetDateStr });
  };

  const handleMonthChange = (newDate: Date) => {
    setCurrentDate(newDate);
    const year = newDate.getFullYear();
    const month = newDate.getMonth();
    const daysInNewMonth = new Date(year, month + 1, 0).getDate();
    const targetDay = Math.min(selectedDate.getDate(), daysInNewMonth);
    setSelectedDate(new Date(year, month, targetDay));
  };

  return (
    <ScreenLayout activeRoute="Attendance">
      <PageHeader title="My Attendance" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topContainer}>
          <AppText size="sm" color="secondary" style={styles.subtitle}>
            Unified Attendance, Geofence Verification, Overtime Calculation, and Payroll Connection.
          </AppText>
        </View>

        <MonthlySummary monthRecords={monthRecords} />
        
        <AttendanceCalendar 
          currentDate={currentDate} 
          selectedDate={selectedDate} 
          monthRecords={monthRecords}
          onMonthChange={handleMonthChange} 
          onDateSelect={handleDateSelect} 
        />
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  topContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
  },
});
