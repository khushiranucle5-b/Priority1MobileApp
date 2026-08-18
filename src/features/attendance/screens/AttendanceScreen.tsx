import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { GuardAttendanceTableView, AttendanceInfoCard } from '../components';

export const AttendanceScreen: React.FC = () => {
  return (
    <ScreenLayout activeRoute="Attendance">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <GuardAttendanceTableView />
        <AttendanceInfoCard />
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
