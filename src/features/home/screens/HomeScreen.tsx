import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import {
  HomeHeader,
  TodayDutyCard,
  AttendanceCard,
  ClockInOutActionCard,
  LoneWorkerCard,
  PatrolProgressSummaryCard,
  NotificationCard,
  QuickActionsGrid,
  DailySummaryCard,
} from '../components';

import { SidebarDrawer } from '../../../components';

export const HomeScreen: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  return (
    <ScreenLayout activeRoute="HomeScreen">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HomeHeader onMenuPress={() => setIsDrawerOpen(true)} />
        <AttendanceCard />
        <TodayDutyCard />
        <ClockInOutActionCard />
        <QuickActionsGrid />
        <PatrolProgressSummaryCard />        
        <NotificationCard />        
      </ScrollView>
      <SidebarDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
});
