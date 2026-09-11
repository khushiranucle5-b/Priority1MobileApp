import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useAuthStore } from '../../../store/useAuthStore';

import { typography } from '../../../theme/tokens/typography';

export const PrivacySecurityScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuthStore();

  return (
    <ScreenLayout>
      <PageHeader title="Privacy & Security" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderRadius: borderRadius.md }]}>
          <AppText style={[styles.title, { color: colors.text }]}>Active Session Details</AppText>
          
          <View style={[styles.detailRow, { borderBottomColor: colors.borderStrong }]}>
            <AppText style={[styles.label, { color: colors.textSecondary }]}>Logged in as:</AppText>
            <AppText style={[styles.value, { color: colors.text }]}>{user?.email}</AppText>
          </View>
          
          <View style={[styles.detailRow, { borderBottomColor: colors.borderStrong }]}>
            <AppText style={[styles.label, { color: colors.textSecondary }]}>Role:</AppText>
            <AppText style={[styles.value, { color: colors.text, textTransform: 'capitalize' }]}>{user?.role || 'User'}</AppText>
          </View>
          
          <View style={[styles.detailRow, { borderBottomColor: colors.borderStrong }]}>
            <AppText style={[styles.label, { color: colors.textSecondary }]}>Assigned Site:</AppText>
            <AppText style={[styles.value, { color: colors.text }]}>{(user as any)?.site || 'Global'}</AppText>
          </View>

          <View style={[styles.detailRow, { borderBottomColor: colors.borderStrong }]}>
            <AppText style={[styles.label, { color: colors.textSecondary }]}>Data Access:</AppText>
            <AppText style={[styles.value, { color: colors.text }]}>Restricted to Assigned Site</AppText>
          </View>
        </View>

        <AppText style={[styles.footer, { color: colors.textSecondary }]}>
          Your session and permissions are governed by your organization's security policies. 
          To manage advanced security options, please contact your administrator.
        </AppText>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  card: {
    padding: 18,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  title: {
    ...typography.presets.cardTitle,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 60,
    borderBottomWidth: 1,
  },
  label: {
    ...typography.presets.label,
  },
  value: {
    ...typography.presets.body,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    ...typography.presets.helper,
    lineHeight: 22,
    paddingHorizontal: 16,
  }
});
