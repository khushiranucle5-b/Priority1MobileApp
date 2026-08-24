import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { Button } from '../../../components/Button';

import { typography } from '../../../theme/tokens/typography';
import { useGuardStore } from '../../../store/useGuardStore';

export const ContactSupportScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { supervisor, supervisorPhone } = useGuardStore();

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@priority-one.io?subject=Guard%20App%20Support%20Request');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:1-800-555-0199');
  };

  const handleCallSupervisor = () => {
    const phone = supervisorPhone || '+1 415 555 0187';
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <ScreenLayout>
      <PageHeader title="Contact Support" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <AppText style={styles.icon}>📞</AppText>
          <AppText style={styles.title}>Priority One Support</AppText>
          <AppText style={styles.description}>
            If you need immediate operational assistance while on duty, contact your Site Supervisor directly. For technical issues, reach out to application support.
          </AppText>

          <View style={styles.buttonContainer}>
            <Button title={`Call Supervisor (${supervisor || 'Jane Smith'})`} onPress={handleCallSupervisor} variant="primary" size="large" fullWidth style={{ minHeight: 60, marginBottom: 14 }} />
            <Button title="Email Support (support@priority-one.io)" onPress={handleEmailSupport} variant="outline" size="large" fullWidth style={{ minHeight: 60, marginBottom: 14 }} />
            <Button title="Call Technical Support Hotline" onPress={handleCallSupport} variant="secondary" size="large" fullWidth style={{ minHeight: 60 }} />
          </View>
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
    borderColor: '#CBD5E1',
    alignItems: 'center',
    marginTop: 14,
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    ...typography.presets.cardTitle,
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    ...typography.presets.helper,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
  }
});
