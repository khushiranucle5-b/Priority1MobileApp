import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

import { typography } from '../../../theme/tokens/typography';

export const TermsConditionsScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  return (
    <ScreenLayout>
      <PageHeader title="Terms & Conditions" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        <AppText style={styles.introText}>
          Please read the latest Terms & Conditions for Priority One Security.
        </AppText>
        
        <View style={[styles.termsBox, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <AppText style={styles.sectionHeader}>
            1. Acceptance of Terms
          </AppText>
          <AppText style={styles.bodyText}>
            By accessing or using the Guard Application, you agree to be bound by these terms. This application tracks location data while on duty for lone worker safety and geofence verification.
          </AppText>

          <AppText style={styles.sectionHeader}>
            2. Privacy & Location Tracking
          </AppText>
          <AppText style={styles.bodyText}>
            Location tracking is active strictly during your clocked-in hours to ensure safety checks and accurate attendance.
          </AppText>

          <AppText style={styles.sectionHeader}>
            3. Responsibilities
          </AppText>
          <AppText style={styles.bodyText}>
            You must accurately log incidents, execute assigned patrols, and maintain confidentiality of site data. Misuse of the application may result in disciplinary action.
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
  introText: {
    ...typography.presets.helper,
    color: '#334155',
    marginBottom: 14,
  },
  termsBox: {
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  sectionHeader: {
    ...typography.presets.cardTitle,
    color: '#1E293B',
    marginBottom: 8,
  },
  bodyText: {
    ...typography.presets.body,
    lineHeight: 26,
    color: '#475569',
    marginBottom: 16,
  }
});
