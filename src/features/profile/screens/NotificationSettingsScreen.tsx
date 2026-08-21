import React from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useSettingsStore } from '../../../store/useSettingsStore';

export const NotificationSettingsScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const {
    notificationsEnabled,
    shiftRemindersEnabled,
    incidentAlertsEnabled,
    loneWorkerAlertsEnabled,
    setNotificationsEnabled,
    setShiftRemindersEnabled,
    setIncidentAlertsEnabled,
    setLoneWorkerAlertsEnabled,
  } = useSettingsStore();

  return (
    <ScreenLayout>
      <PageHeader title="Notification Settings" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <View style={styles.textContainer}>
            <AppText size="base" weight="bold">Global Push Notifications</AppText>
            <AppText size="sm" color="secondary" style={styles.description}>
              Receive all system notifications and emergency dispatch alerts.
            </AppText>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary[500] }}
          />
        </View>

        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <View style={styles.textContainer}>
            <AppText size="base" weight="medium">Shift Reminders</AppText>
            <AppText size="sm" color="secondary" style={styles.description}>
              Get reminded 30 minutes before your scheduled shift starts.
            </AppText>
          </View>
          <Switch
            value={shiftRemindersEnabled}
            onValueChange={setShiftRemindersEnabled}
            disabled={!notificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary[500] }}
          />
        </View>

        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <View style={styles.textContainer}>
            <AppText size="base" weight="medium">Incident & Security Broadcasts</AppText>
            <AppText size="sm" color="secondary" style={styles.description}>
              Notifications when high priority incidents are filed or updated on your site.
            </AppText>
          </View>
          <Switch
            value={incidentAlertsEnabled}
            onValueChange={setIncidentAlertsEnabled}
            disabled={!notificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary[500] }}
          />
        </View>

        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <View style={styles.textContainer}>
            <AppText size="base" weight="medium">Lone Worker Safety Check Reminders</AppText>
            <AppText size="sm" color="secondary" style={styles.description}>
              Audible sound and push alert when a periodic safety check-in is due.
            </AppText>
          </View>
          <Switch
            value={loneWorkerAlertsEnabled}
            onValueChange={setLoneWorkerAlertsEnabled}
            disabled={!notificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary[500] }}
          />
        </View>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  description: {
    marginTop: 4,
  }
});
