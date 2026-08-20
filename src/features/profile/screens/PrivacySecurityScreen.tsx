import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useAuthStore } from '../../../store/useAuthStore';

export const PrivacySecurityScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuthStore();

  return (
    <ScreenLayout>
      <PageHeader title="Privacy & Security" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <AppText size="lg" weight="bold" style={styles.title}>Active Session Details</AppText>
          
          <View style={styles.detailRow}>
            <AppText color="secondary">Logged in as:</AppText>
            <AppText weight="medium">{user?.email}</AppText>
          </View>
          
          <View style={styles.detailRow}>
            <AppText color="secondary">Role:</AppText>
            <AppText weight="medium" style={{ textTransform: 'capitalize' }}>{user?.role || 'User'}</AppText>
          </View>
          
          <View style={styles.detailRow}>
            <AppText color="secondary">Assigned Site:</AppText>
            <AppText weight="medium">{(user as any)?.site || 'Global'}</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText color="secondary">Data Access:</AppText>
            <AppText weight="medium">Restricted to Assigned Site</AppText>
          </View>
        </View>

        <AppText color="secondary" style={styles.footer}>
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
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  title: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  footer: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  }
});
