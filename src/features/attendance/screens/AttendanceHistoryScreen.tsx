import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AttendanceStackParamList } from '../../../types/navigation.types';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AttendanceHistorySummary, AttendanceHistoryList } from '../components';

type Props = NativeStackScreenProps<AttendanceStackParamList, 'AttendanceHistory'>;

export const AttendanceHistoryScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScreenLayout>
      <PageHeader title="Attendance History" showBack onBack={() => navigation.goBack()} />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <AttendanceHistorySummary />
        <AttendanceHistoryList />
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
