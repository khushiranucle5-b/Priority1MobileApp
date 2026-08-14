import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AttendanceStackParamList } from '../types/navigation.types';
import { AttendanceScreen } from '../features/attendance/screens/AttendanceScreen';
import { SelfieVerificationScreen } from '../features/attendance/screens/SelfieVerificationScreen';
import { AttendanceHistoryScreen } from '../features/attendance/screens/AttendanceHistoryScreen';
import { AttendanceDetailsScreen } from '../features/attendance/screens/AttendanceDetailsScreen';

const Stack = createNativeStackNavigator<AttendanceStackParamList>();

export const AttendanceNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AttendanceMain" component={AttendanceScreen} />
      <Stack.Screen name="SelfieVerification" component={SelfieVerificationScreen} />
      <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
      <Stack.Screen name="AttendanceDetails" component={AttendanceDetailsScreen} />
    </Stack.Navigator>
  );
};
