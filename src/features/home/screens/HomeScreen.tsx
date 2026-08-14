import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { 
  HomeHeader, 
  TodayDutyCard, 
  AttendanceCard, 
  QuickActionsGrid, 
  NotificationCard, 
  DailySummaryCard 
} from '../components';

export const HomeScreen: React.FC = () => {
  return (
    <ScreenLayout>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HomeHeader />
        <AttendanceCard />
        <TodayDutyCard />
        <NotificationCard />
        <QuickActionsGrid />
        <DailySummaryCard />
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
});
