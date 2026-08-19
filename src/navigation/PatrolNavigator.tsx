import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PatrolStackParamList } from '../types/navigation.types';
import { PatrolScreen } from '../features/patrol/screens/PatrolScreen';
import { PatrolDateLogsScreen } from '../features/patrol/screens/PatrolDateLogsScreen';
import { PatrolDetailsScreen } from '../features/patrol/screens/PatrolDetailsScreen';

const Stack = createNativeStackNavigator<PatrolStackParamList>();

export const PatrolNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatrolMain" component={PatrolScreen} />
      <Stack.Screen name="PatrolDateLogs" component={PatrolDateLogsScreen} />
      <Stack.Screen name="PatrolDetails" component={PatrolDetailsScreen} />
    </Stack.Navigator>
  );
};
