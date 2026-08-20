import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useAuthStore } from '../../../store/useAuthStore';

export const AttendanceSettingsScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuthStore();

  return (
    <ScreenLayout>
      <PageHeader title="Attendance Settings" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <AppText size="lg" weight="bold" style={styles.title}>Shift Configuration</AppText>
          
          <View style={styles.detailRow}>
            <AppText color="secondary">Primary Site:</AppText>
            <AppText weight="medium">{(user as any)?.site || 'Global'}</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText color="secondary">Clock-in Requirement:</AppText>
            <AppText weight="medium">Geofence & Selfie</AppText>
          </View>

          <AppText size="sm" color="secondary" style={styles.description}>
            Attendance configurations and geofence restrictions are managed automatically based on your assigned site. Custom scheduling reminders are currently managed at the organization level.
          </AppText>
        </View>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  description: {
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 20,
  }
});
