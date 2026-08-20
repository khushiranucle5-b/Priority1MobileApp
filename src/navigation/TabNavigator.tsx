import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/navigation.types';
import { HomeNavigator } from './HomeNavigator';
import { AttendanceNavigator } from './AttendanceNavigator';
import { DutyScreen } from '../features/duty/screens/DutyScreen';
import { PatrolNavigator } from './PatrolNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { useTheme } from '../providers/ThemeProvider';
import { NavIcon } from '../components/NavIcon';
import { LoneWorkerGlobalListener } from '../components/LoneWorkerGlobalListener';

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
      <Tab.Screen 
        name="Home" 
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <NavIcon name="dashboard" color={color} size={size} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Attendance" 
        component={AttendanceNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <NavIcon name="leaves" color={color} size={size} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Duty" 
        component={DutyScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <NavIcon name="payslips" color={color} size={size} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Patrol" 
        component={PatrolNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <NavIcon name="loneworker" color={color} size={size} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <NavIcon name="employees" color={color} size={size} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
};

