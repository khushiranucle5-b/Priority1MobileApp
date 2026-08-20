import React, { useState, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { Heading } from '../../../components/typography/Heading';
import { AppText } from '../../../components/typography/Text';
import { useGuardStore } from '../../../store/useGuardStore';

import { 
  MonthlySummary, 
  AttendanceCalendar, 
  SelectedDateDetails
} from '../components';
import { getMonthRecords, getMergedStatusForDate, formatDateKey } from '../utils/attendanceLogic';

export const AttendanceScreen: React.FC = () => {
  const { isClockedIn, clockInTimestamp, attendanceHistory, leaves, shifts, todayShift, assignedSite } = useGuardStore();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [detailsY, setDetailsY] = useState<number>(0);

  const monthRecords = useMemo(() => {
    return getMonthRecords(currentDate.getFullYear(), currentDate.getMonth(), attendanceHistory, leaves);
  }, [currentDate, attendanceHistory, leaves]);

  const dateStr = useMemo(() => {
    return formatDateKey(selectedDate);
  }, [selectedDate]);

  const selectedRecord = useMemo(() => {
    const baseRecord = getMergedStatusForDate(dateStr, attendanceHistory, leaves);
    const todayStr = formatDateKey(new Date());

    // Dynamic connection with today's live Clock-In state
    if (dateStr === todayStr && isClockedIn) {
      const activeSession = {
        id: `live-clock-in-${clockInTimestamp || Date.now()}`,
        date: todayStr,
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        siteName: assignedSite || 'Ahmedabad Plant',
        shiftName: todayShift?.title || 'Morning Shift 08:00 AM - 04:00 PM',
        clockIn: clockInTimestamp ? new Date(clockInTimestamp).toISOString() : new Date().toISOString(),
        clockOut: null,
        workingHours: 0,
        status: 'Present',
        notes: 'Live Clocked In',
      };

      const existingSessions = baseRecord.attendances ? [...baseRecord.attendances] : (baseRecord.attendance ? [baseRecord.attendance] : []);
      const hasActiveAlready = existingSessions.some(s => s.clockIn && (!s.clockOut || s.clockOut === '—' || s.clockOut === 'Ongoing'));
      
      if (!hasActiveAlready) {
        existingSessions.push(activeSession);
      }

      return {
        dateStr: todayStr,
        type: 'attendance' as const,
        status: 'Present',
        attendance: existingSessions[0],
        attendances: existingSessions,
      };
    }

    return baseRecord;
  }, [dateStr, attendanceHistory, leaves, isClockedIn, clockInTimestamp, assignedSite, todayShift]);

  const selectedShift = useMemo(() => {
    return shifts.find(s => s.date === dateStr) || (dateStr === formatDateKey(new Date()) ? todayShift : null);
  }, [shifts, todayShift, dateStr]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (scrollViewRef.current && detailsY > 0) {
      scrollViewRef.current.scrollTo({ y: detailsY - 12, animated: true });
    }
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
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topContainer}>
          <Heading level="h2" color="primary">My Shift & Attendance</Heading>
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
        
        <View 
          onLayout={(e) => {
            const layout = e.nativeEvent.layout;
            setDetailsY(layout.y);
          }}
        >
          <SelectedDateDetails 
            record={selectedRecord} 
            selectedDate={selectedDate} 
            shift={selectedShift}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  topContainer: {
    padding: 16,
  },
  subtitle: {
    marginTop: 4,
    lineHeight: 18,
  },
});
