import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { useDrawerStore } from '../../../store/useDrawerStore';
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

export const HomeScreen: React.FC = () => {
  const openDrawer = useDrawerStore((state) => state.openDrawer);
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <ScreenLayout activeRoute="HomeScreen">
      <View style={styles.mainWrapper}>
        {/* Sticky Home Header at top */}
        <HomeHeader
          isScrolled={isScrolled}
          onMenuPress={() => {
            console.log('[HomeScreen] onMenuPress triggered, opening drawer store');
            openDrawer();
          }}
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
