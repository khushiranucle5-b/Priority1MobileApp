import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import {
  HomeHeader,
  TodayDutyCard,
  AttendanceCard,
  LoneWorkerCard,
  PatrolProgressSummaryCard,
  NotificationCard,
  QuickActionsGrid,
  DailySummaryCard,
} from '../components';

import { SidebarDrawer } from '../../../components';

export const HomeScreen: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <ScreenLayout activeRoute="HomeScreen">
      <View style={styles.mainWrapper}>
        {/* Sticky Home Header at top */}
        <HomeHeader
          isScrolled={isScrolled}
          onMenuPress={() => setIsDrawerOpen(true)}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            const offsetY = e.nativeEvent.contentOffset.y;
            setIsScrolled(offsetY > 10);
          }}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Attendance */}
          <AttendanceCard />

          {/* 2. Patrol Progress (Directly below Attendance) */}
          <PatrolProgressSummaryCard />

         

          {/* 4. Quick Actions */}
          <QuickActionsGrid />

          {/* 5. Recent Notifications */}
          <NotificationCard />
        </ScrollView>
      </View>
      <SidebarDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 24,
  },
});
