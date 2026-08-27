import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
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
            borderTopColor: '#CBD5E1',
            borderTopWidth: 1.5,
            height: 78 + bottomInset,
            paddingBottom: bottomInset + 4,
            paddingTop: 6,
            elevation: 16,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
          },
          tabBarItemStyle: {
            height: 70,
            paddingHorizontal: 0,
            paddingVertical: 2,
          },
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
            letterSpacing: 0.2,
            marginTop: 6,
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
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Home', state: { routes: [{ name: 'HomeMain' }] } }],
                })
              );
            },
          })}
          options={{
            tabBarLabel: 'HOME',
            tabBarIcon: ({ focused }) => (
              <View style={focused ? styles.activeIconPill : styles.inactiveIconBox}>
                <NavIcon name="dashboard" color={focused ? '#2563EB' : '#94A3B8'} size={30} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Attendance"
          component={AttendanceNavigator}
          listeners={({ navigation }) => ({
            tabPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Attendance', state: { routes: [{ name: 'AttendanceMain' }] } }],
                })
              );
            },
          })}
          options={{
            tabBarLabel: 'ATTENDANCE',
            tabBarIcon: ({ focused }) => (
              <View style={focused ? styles.activeIconPill : styles.inactiveIconBox}>
                <NavIcon name="attendance" color={focused ? '#2563EB' : '#94A3B8'} size={30} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Duty"
          component={DutyScreen}
          options={{
            tabBarLabel: 'DUTY',
            tabBarIcon: ({ focused }) => (
              <View style={focused ? styles.activeIconPill : styles.inactiveIconBox}>
                <NavIcon name="shifts" color={focused ? '#2563EB' : '#94A3B8'} size={30} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Patrol"
          component={PatrolNavigator}
          listeners={({ navigation }) => ({
            tabPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Patrol', state: { routes: [{ name: 'PatrolMain' }] } }],
                })
              );
            },
          })}
          options={{
            tabBarLabel: 'PATROL',
            tabBarIcon: ({ focused }) => (
              <View style={focused ? styles.activeIconPill : styles.inactiveIconBox}>
                <NavIcon name="patrol" color={focused ? '#2563EB' : '#94A3B8'} size={30} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileNavigator}
          listeners={({ navigation }) => ({
            tabPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Profile', state: { routes: [{ name: 'ProfileMain' }] } }],
                })
              );
            },
          })}
          options={{
            tabBarLabel: 'PROFILE',
            tabBarIcon: ({ focused }) => (
              <View style={focused ? styles.activeIconPill : styles.inactiveIconBox}>
                <NavIcon name="employees" color={focused ? '#2563EB' : '#94A3B8'} size={30} />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
      <LoneWorkerGlobalListener />
    </>
  );
};

const styles = StyleSheet.create({
  activeIconPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  inactiveIconBox: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
