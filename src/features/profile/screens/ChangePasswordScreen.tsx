import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

export const ChangePasswordScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  return (
    <ScreenLayout>
      <PageHeader title="Change Password" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <AppText style={styles.icon}>🔒</AppText>
          <AppText size="lg" weight="bold" style={styles.title}>Managed Authentication</AppText>
          <AppText size="base" color="secondary" style={styles.description}>
            Password changes are managed through your organization's authentication/SSO system. 
            Please contact your system administrator or use the SSO portal to update your credentials.
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
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  }
});
