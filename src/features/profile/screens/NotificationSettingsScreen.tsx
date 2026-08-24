import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useSettingsStore } from '../../../store/useSettingsStore';

import { typography } from '../../../theme/tokens/typography';

export const NotificationSettingsScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const {
    notificationsEnabled,
    shiftRemindersEnabled,
    incidentAlertsEnabled,
    patrolAlertsEnabled,
    leaveStatusAlertsEnabled,
    companyNoticesEnabled,
    emergencyAlarmSoundEnabled,
    setNotificationsEnabled,
    setShiftRemindersEnabled,
    setIncidentAlertsEnabled,
    setPatrolAlertsEnabled,
    setLeaveStatusAlertsEnabled,
    setCompanyNoticesEnabled,
    setEmergencyAlarmSoundEnabled,
    loadSettings,
  } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <ScreenLayout>
      <PageHeader title="Notification Settings" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        {/* Global Push Notifications Switch */}
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <View style={styles.textContainer}>
            <AppText style={styles.titleText}>Global Push Notifications</AppText>
            <AppText style={styles.description}>
              Receive all system notifications and emergency dispatch alerts.
            </AppText>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }] }}
          />
        </View>

        {/* Shift Reminders Switch */}
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md, opacity: notificationsEnabled ? 1 : 0.6 }]}>
          <View style={styles.textContainer}>
            <AppText style={styles.titleText}>Shift Reminders</AppText>
            <AppText style={styles.description}>
              Get reminded 30 minutes before your scheduled shift starts.
            </AppText>
          </View>
          <Switch
            value={shiftRemindersEnabled}
            onValueChange={setShiftRemindersEnabled}
            disabled={!notificationsEnabled}
            trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }] }}
          />
        </View>

        {/* Patrol Route & Checkpoint Alerts Switch */}
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md, opacity: notificationsEnabled ? 1 : 0.6 }]}>
          <View style={styles.textContainer}>
            <AppText style={styles.titleText}>Patrol & Checkpoint Alerts</AppText>
            <AppText style={styles.description}>
              Receive notifications for upcoming patrol routes and missed checkpoints.
            </AppText>
          </View>
          <Switch
            value={patrolAlertsEnabled}
            onValueChange={setPatrolAlertsEnabled}
            disabled={!notificationsEnabled}
            trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }] }}
          />
        </View>

        {/* Incident & Security Broadcasts Switch */}
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md, opacity: notificationsEnabled ? 1 : 0.6 }]}>
          <View style={styles.textContainer}>
            <AppText style={styles.titleText}>Incident & Security Broadcasts</AppText>
            <AppText style={styles.description}>
              Notifications when high priority incidents are filed or updated on your site.
            </AppText>
          </View>
          <Switch
            value={incidentAlertsEnabled}
            onValueChange={setIncidentAlertsEnabled}
            disabled={!notificationsEnabled}
            trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }] }}
          />
        </View>

        {/* Lone Worker Safety Check Reminders Switch (Mandatory Safety Rule - Always ON) */}
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <View style={styles.textContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <AppText style={styles.titleText}>Lone Worker Safety Check Reminders</AppText>
              <View style={styles.mandatoryBadgeContainer}>
                <AppText style={styles.mandatoryBadgeText}>Mandatory Safety Protocol</AppText>
              </View>
            </View>
            <AppText style={styles.description}>
              Audible sound and push alert when a periodic safety check-in is due. Always active for guard safety.
            </AppText>
          </View>
          <Switch
            value={true}
            disabled={true}
            trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }] }}
          />
        </View>

        {/* Leave & Request Updates Switch */}
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md, opacity: notificationsEnabled ? 1 : 0.6 }]}>
          <View style={styles.textContainer}>
            <AppText style={styles.titleText}>Leave & Request Status Updates</AppText>
            <AppText style={styles.description}>
              Alerts when your leave applications or equipment requests are approved.
            </AppText>
          </View>
          <Switch
            value={leaveStatusAlertsEnabled}
            onValueChange={setLeaveStatusAlertsEnabled}
            disabled={!notificationsEnabled}
            trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }] }}
          />
        </View>

        {/* Company Announcements Switch */}
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md, opacity: notificationsEnabled ? 1 : 0.6 }]}>
          <View style={styles.textContainer}>
            <AppText style={styles.titleText}>Company Announcements & Notices</AppText>
            <AppText style={styles.description}>
              Receive official policy updates and company-wide news broadcasts.
            </AppText>
          </View>
          <Switch
            value={companyNoticesEnabled}
            onValueChange={setCompanyNoticesEnabled}
            disabled={!notificationsEnabled}
            trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }] }}
          />
        </View>

        {/* High Volume Emergency Alarm Sound Switch */}
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md, opacity: notificationsEnabled ? 1 : 0.6 }]}>
          <View style={styles.textContainer}>
            <AppText style={styles.titleText}>High-Volume Emergency Sound</AppText>
            <AppText style={styles.description}>
              Play high-decibel alarm tone during SOS triggers and panic dispatches.
            </AppText>
          </View>
          <Switch
            value={emergencyAlarmSoundEnabled}
            onValueChange={setEmergencyAlarmSoundEnabled}
            disabled={!notificationsEnabled}
            trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }] }}
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
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 14,
    minHeight: 60,
  },
  textContainer: {
    flex: 1,
    paddingRight: 14,
  },
  titleText: {
    ...typography.presets.body,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  description: {
    ...typography.presets.helper,
    lineHeight: 22,
    color: '#64748B',
  },
  mandatoryBadgeContainer: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  mandatoryBadgeText: {
    color: '#2563EB',
    ...typography.presets.navLabel,
  },
});
