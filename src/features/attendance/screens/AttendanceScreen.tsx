import React, { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { Heading } from '../../../components/typography/Heading';
import { AppText } from '../../../components/typography/Text';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { LoggerService } from '../../../services';

import { 
  MonthlySummary, 
  AttendanceCalendar, 
  SelectedDateDetails, 
  DatewiseAttendanceList 
} from '../components';
import { getMonthRecords, getMergedStatusForDate } from '../utils/attendanceLogic';

export const AttendanceScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { isClockedIn, attendanceHistory, leaves } = useGuardStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleClockIn = () => {
    LoggerService.log('[AttendanceScreen] Clock In pressed');
    navigation.navigate('SelfieVerification', { actionType: 'Clock In' });
  };

  const handleClockOut = () => {
    LoggerService.log('[AttendanceScreen] Clock Out pressed');
    navigation.navigate('SelfieVerification', { actionType: 'Clock Out' });
  };

  const monthRecords = useMemo(() => {
    return getMonthRecords(currentDate.getFullYear(), currentDate.getMonth(), attendanceHistory, leaves);
  }, [currentDate, attendanceHistory, leaves]);

  const selectedRecord = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return getMergedStatusForDate(dateStr, attendanceHistory, leaves);
  }, [selectedDate, attendanceHistory, leaves]);

  return (
    <ScreenLayout activeRoute="Attendance">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topContainer}>
          <View style={styles.topHeader}>
            <View style={styles.titleArea}>
              <Heading level="h2" color="primary">My Shift & Attendance</Heading>
              <AppText size="sm" color="secondary" style={styles.subtitle}>
                Unified Attendance, Geofence Verification, Overtime Calculation, and Payroll Connection.
              </AppText>
            </View>

            <View style={styles.topActions}>
              <Button
                title="Clock In"
                variant={isClockedIn ? "secondary" : "primary"}
                size="medium"
                disabled={isClockedIn}
                onPress={handleClockIn}
                style={styles.topBtn}
              />
              <Button
                title="Clock Out"
                variant={isClockedIn ? "primary" : "secondary"}
                size="medium"
                disabled={!isClockedIn}
                onPress={handleClockOut}
                style={styles.topBtn}
              />
            </View>
          </View>
        </View>

        <MonthlySummary monthRecords={monthRecords} />
        
        <AttendanceCalendar 
          currentDate={currentDate} 
          selectedDate={selectedDate} 
          onMonthChange={setCurrentDate} 
          onDateSelect={setSelectedDate} 
        />
        
        <SelectedDateDetails record={selectedRecord} selectedDate={selectedDate} />
        
        <DatewiseAttendanceList monthRecords={monthRecords} />

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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 12,
  },
  titleArea: {
    flex: 1,
    minWidth: 240,
  },
  subtitle: {
    marginTop: 4,
    lineHeight: 18,
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  topBtn: {
    minWidth: 100,
  }
});
