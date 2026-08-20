import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

export const PrivacyPolicyScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  return (
    <ScreenLayout>
      <PageHeader title="Privacy Policy" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <AppText style={styles.icon}>📄</AppText>
          <AppText size="lg" weight="bold" style={styles.title}>Organization Privacy Policy</AppText>
          <AppText size="base" color="secondary" style={styles.description}>
            The detailed Privacy Policy is maintained by your organization. 
            When a formal policy is published to your environment, it will appear here.
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
