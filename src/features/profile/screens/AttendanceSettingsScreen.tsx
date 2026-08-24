import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useAuthStore } from '../../../store/useAuthStore';

import { Switch, TouchableOpacity } from 'react-native';
import { useSettingsStore } from '../../../store/useSettingsStore';

import { typography } from '../../../theme/tokens/typography';

export const AttendanceSettingsScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { selfieCheckInRequired, autoClockOutTimeout, setSelfieCheckInRequired, setAutoClockOutTimeout } = useSettingsStore();

  const timeoutOptions = [8, 12, 16];

  return (
    <ScreenLayout>
      <PageHeader title="Attendance Settings" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <AppText style={styles.title}>Site Shift Rules</AppText>
          
          <View style={styles.detailRow}>
            <AppText style={styles.label}>Primary Assigned Site:</AppText>
            <AppText style={styles.value}>{(user as any)?.assignedSite || (user as any)?.site || 'Ahmedabad Plant'}</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText style={styles.label}>Geofence Boundary:</AppText>
            <AppText style={styles.value}>Enforced (200m Radius)</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText style={styles.label}>Overtime Tracking:</AppText>
            <AppText style={styles.value}>Automatic Calculation</AppText>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <AppText style={styles.title}>Attendance Preferences</AppText>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <AppText style={styles.toggleTitle}>Require Selfie Verification</AppText>
              <AppText style={styles.toggleSub}>
                Prompt camera selfie snapshot during clock-in and clock-out.
              </AppText>
            </View>
            <Switch
              value={selfieCheckInRequired}
              onValueChange={setSelfieCheckInRequired}
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
              thumbColor="#FFFFFF"
              style={{ transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }] }}
            />
          </View>

          <View style={[styles.detailRow, { flexDirection: 'column', alignItems: 'flex-start', borderBottomWidth: 0, marginTop: 14 }]}>
            <AppText style={styles.toggleTitle}>Auto Clock-out Safety Limit</AppText>
            <AppText style={styles.toggleSub}>
              Automatically flag shift as completed if open session exceeds limit.
            </AppText>
            
            <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 14 }}>
              {timeoutOptions.map(hours => {
                const isSelected = autoClockOutTimeout === hours;
                return (
                  <TouchableOpacity
                    key={hours}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? '#2563EB' : colors.background,
                        borderColor: isSelected ? '#2563EB' : '#CBD5E1',
                        borderRadius: borderRadius.md,
                      }
                    ]}
                    onPress={() => setAutoClockOutTimeout(hours)}
                    activeOpacity={0.8}
                  >
                    <AppText
                      style={[styles.chipText, { color: isSelected ? '#FFFFFF' : '#334155' }]}
                    >
                      {hours} Hours
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
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
    marginBottom: 18,
  },
  title: {
    ...typography.presets.cardTitle,
    color: '#0F172A',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  toggleTitle: {
    ...typography.presets.body,
    fontWeight: '600',
    color: '#0F172A',
  },
  toggleSub: {
    ...typography.presets.helper,
    lineHeight: 22,
    color: '#64748B',
    marginTop: 4,
  },
  chip: {
    flex: 1,
    minHeight: 56,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  chipText: {
    ...typography.presets.body,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 14,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    ...typography.presets.label,
    color: '#475569',
  },
  value: {
    ...typography.presets.body,
    fontWeight: '600',
    color: '#0F172A',
  }
});
