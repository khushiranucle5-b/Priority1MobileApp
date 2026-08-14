import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/navigation.types';
import { HomeNavigator } from './HomeNavigator';
import { AttendanceNavigator } from './AttendanceNavigator';
import { DutyScreen } from '../features/duty/screens/DutyScreen';
import { PatrolScreen } from '../features/patrol/screens/PatrolScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { useTheme } from '../providers/ThemeProvider';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.secondary,
        headerShown: false // Hiding header in Tab Navigator so Stack headers can show if needed, or ScreenLayout handles it
      }}
    >
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="Attendance" component={AttendanceNavigator} />
      <Tab.Screen name="Duty" component={DutyScreen} />
      <Tab.Screen name="Patrol" component={PatrolScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
