import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/navigation.types';
import { HomeNavigator } from './HomeNavigator';
import { AttendanceNavigator } from './AttendanceNavigator';
import { DutyScreen } from '../features/duty/screens/DutyScreen';
import { PatrolNavigator } from './PatrolNavigator';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { useTheme } from '../providers/ThemeProvider';
import { LoneWorkerGlobalListener } from '../components/LoneWorkerGlobalListener';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
          tabBarActiveTintColor: colors.primary[600],
          tabBarInactiveTintColor: colors.secondary,
          headerShown: false
        }}
      >
        <Tab.Screen name="Home" component={HomeNavigator} />
        <Tab.Screen name="Attendance" component={AttendanceNavigator} />
        <Tab.Screen name="Duty" component={DutyScreen} />
        <Tab.Screen name="Patrol" component={PatrolNavigator} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <LoneWorkerGlobalListener />
    </View>
  );
};

