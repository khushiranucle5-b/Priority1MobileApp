import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1.5,
            height: 60 + bottomInset,
            paddingBottom: bottomInset,
            paddingTop: 6,
            elevation: 12,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
          },
          tabBarItemStyle: {
            height: 54,
            paddingHorizontal: 0,
            paddingVertical: 2,
          },
          tabBarActiveTintColor: '#0F172A',
          tabBarInactiveTintColor: '#64748B',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0,
            marginTop: 2,
            includeFontPadding: false,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeNavigator}
          listeners={({ navigation }) => ({
            tabPress: () => {
              navigation.navigate('Home', { screen: 'HomeMain' });
            },
          })}
          options={{
            tabBarLabel: 'HOME',
            tabBarIcon: ({ color }) => (
              <NavIcon name="dashboard" color={color} size={28} />
            ),
          }} 
        />
        <Tab.Screen 
          name="Attendance" 
          component={AttendanceNavigator}
          listeners={({ navigation }) => ({
            tabPress: () => {
              navigation.navigate('Attendance', { screen: 'AttendanceMain' });
            },
          })}
          options={{
            tabBarLabel: 'ATTENDANCE',
            tabBarIcon: ({ color }) => (
              <NavIcon name="attendance" color={color} size={28} />
            ),
          }} 
        />
        <Tab.Screen 
          name="Duty" 
          component={DutyScreen}
          options={{
            tabBarLabel: 'DUTY',
            tabBarIcon: ({ color }) => (
              <NavIcon name="shifts" color={color} size={28} />
            ),
          }} 
        />
        <Tab.Screen 
          name="Patrol" 
          component={PatrolNavigator}
          listeners={({ navigation }) => ({
            tabPress: () => {
              navigation.navigate('Patrol', { screen: 'PatrolMain' });
            },
          })}
          options={{
            tabBarLabel: 'PATROL',
            tabBarIcon: ({ color }) => (
              <NavIcon name="patrol" color={color} size={28} />
            ),
          }} 
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileNavigator}
          listeners={({ navigation }) => ({
            tabPress: () => {
              navigation.navigate('Profile', { screen: 'ProfileMain' });
            },
          })}
          options={{
            tabBarLabel: 'PROFILE',
            tabBarIcon: ({ color }) => (
              <NavIcon name="employees" color={color} size={28} />
            ),
          }} 
        />
      </Tab.Navigator>
      <LoneWorkerGlobalListener />
    </>
  );
};
