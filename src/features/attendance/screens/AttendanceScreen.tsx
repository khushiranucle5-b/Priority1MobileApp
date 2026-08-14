import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import {
  AttendanceHeader,
  ShiftCard,
  AttendanceStatusCard,
  AttendanceActionButtons,
  AttendanceSummaryCard,
  AttendanceTimeline,
  AttendanceInfoCard,
  EmptyAttendanceState
} from '../components';
import { Button } from '../../../components/Button';
import { useNavigation } from '@react-navigation/native';

export const AttendanceScreen: React.FC = () => {
  // Mock state to demonstrate empty state vs populated state
  // This is purely for UI demonstration
  const [hasAttendance] = useState(true);
  const navigation = useNavigation<any>();

  return (
    <ScreenLayout>
      <AttendanceHeader />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ShiftCard />
        
        {hasAttendance ? (
          <>
            <AttendanceStatusCard />
            <AttendanceActionButtons />
            <AttendanceSummaryCard />
            <AttendanceTimeline />
          </>
        ) : (
          <>
            <AttendanceActionButtons />
            <EmptyAttendanceState />
          </>
        )}
        
        <AttendanceInfoCard />
        
        <Button 
          title="View Attendance History" 
          variant="outline" 
          size="large" 
          fullWidth 
          style={styles.historyBtn}
          onPress={() => navigation.navigate('AttendanceHistory')}
        />
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  historyBtn: {
    marginHorizontal: 16,
    marginTop: 16,
  }
});
