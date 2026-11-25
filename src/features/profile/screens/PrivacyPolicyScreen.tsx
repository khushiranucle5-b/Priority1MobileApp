import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

import { typography } from '../../../theme/tokens/typography';

export const PrivacyPolicyScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  return (
    <ScreenLayout>
      <PageHeader title="Privacy Policy" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderRadius: borderRadius.md }]}>
          <AppText style={[styles.mainTitle, { color: colors.text }]}>Priority One Guard Privacy Policy</AppText>
          <AppText style={[styles.subTitle, { color: colors.textSecondary }]}>Last Updated: August 2026</AppText>
          
          <AppText style={[styles.sectionHeader, { color: colors.text }]}>1. Information We Collect</AppText>
          <AppText style={[styles.bodyText, { color: colors.textSecondary }]}>
            Priority One Mobile App collects location telemetry, biometric check-in snapshots, and checkpoint scanning logs exclusively when you are actively clocked in to a security shift.
          </AppText>

          <AppText style={[styles.sectionHeader, { color: colors.text }]}>2. Location Tracking & Geofencing</AppText>
          <AppText style={[styles.bodyText, { color: colors.textSecondary }]}>
            GPS location data is tracked ONLY during active duty for lone worker safety monitoring, SOS emergency response, and verifying geofence compliance. Background tracking stops automatically upon clocking out.
          </AppText>

          <AppText style={[styles.sectionHeader, { color: colors.text }]}>3. Media & Photo Security</AppText>
          <AppText style={[styles.bodyText, { color: colors.textSecondary }]}>
            Selfie verification snapshots and incident photos are encrypted in local app storage and securely transmitted over HTTPS to your organization's compliance portal.
          </AppText>

          <AppText style={[styles.sectionHeader, { color: colors.text }]}>4. Data Retention & Access</AppText>
          <AppText style={[styles.bodyText, { color: colors.textSecondary }]}>
            Operational logs and attendance records are stored according to your security provider's compliance policy. You may request record inspection through your supervisor.
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
    padding: 20,
    borderWidth: 1.5,
    marginTop: 8,
  },
  mainTitle: {
    ...typography.presets.cardTitle,
    marginBottom: 6,
  },
  subTitle: {
    ...typography.presets.helper,
    marginBottom: 16,
  },
  sectionHeader: {
    marginTop: 18,
    marginBottom: 8,
    ...typography.presets.cardTitle,
  },
  bodyText: {
    ...typography.presets.body,
    lineHeight: 26,
    textAlign: 'justify',
  },
});
