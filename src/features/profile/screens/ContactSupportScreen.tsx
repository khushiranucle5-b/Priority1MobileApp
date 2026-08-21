import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { Button } from '../../../components/Button';

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
          <AppText size="lg" weight="bold" style={styles.title}>Priority One Support</AppText>
          <AppText size="base" color="secondary" style={styles.description}>
            If you need immediate operational assistance while on duty, contact your Site Supervisor directly. For technical issues, reach out to application support.
          </AppText>
          
          <View style={styles.buttonContainer}>
            <Button title={`Call Supervisor (${supervisor || 'Jane Smith'})`} onPress={handleCallSupervisor} variant="primary" style={{ marginBottom: 12 }} />
            <Button title="Email Support (support@priority-one.io)" onPress={handleEmailSupport} variant="outline" style={{ marginBottom: 12 }} />
            <Button title="Call Technical Support Hotline" onPress={handleCallSupport} variant="secondary" />
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
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
  }
});
