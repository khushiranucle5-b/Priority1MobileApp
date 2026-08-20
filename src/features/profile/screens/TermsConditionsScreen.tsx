import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

export const TermsConditionsScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  return (
    <ScreenLayout>
      <PageHeader title="Terms & Conditions" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        <AppText size="sm" color="text" style={{ marginBottom: spacing.md }}>
          Please read the latest Terms & Conditions for Priority One Security.
        </AppText>
        
        <View style={[styles.termsBox, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <AppText size="sm" color="secondary" style={{ marginBottom: spacing.sm, fontWeight: 'bold' }}>
            1. Acceptance of Terms
          </AppText>
          <AppText size="sm" color="secondary" style={{ marginBottom: spacing.md, lineHeight: 20 }}>
            By accessing or using the Guard Application, you agree to be bound by these terms. This application tracks location data while on duty for lone worker safety and geofence verification.
          </AppText>

          <AppText size="sm" color="secondary" style={{ marginBottom: spacing.sm, fontWeight: 'bold' }}>
            2. Privacy & Location Tracking
          </AppText>
          <AppText size="sm" color="secondary" style={{ marginBottom: spacing.md, lineHeight: 20 }}>
            Location tracking is active strictly during your clocked-in hours to ensure safety checks and accurate attendance.
          </AppText>

          <AppText size="sm" color="secondary" style={{ marginBottom: spacing.sm, fontWeight: 'bold' }}>
            3. Responsibilities
          </AppText>
          <AppText size="sm" color="secondary" style={{ lineHeight: 20 }}>
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
  termsBox: {
    padding: 20,
    borderWidth: 1,
  }
});
