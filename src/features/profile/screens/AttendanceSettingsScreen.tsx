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
          <AppText size="lg" weight="bold" style={styles.title}>Site Shift Rules</AppText>
          
          <View style={styles.detailRow}>
            <AppText color="secondary">Primary Assigned Site:</AppText>
            <AppText weight="bold">{(user as any)?.assignedSite || (user as any)?.site || 'Ahmedabad Plant'}</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText color="secondary">Geofence Boundary:</AppText>
            <AppText weight="bold">Enforced (200m Radius)</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText color="secondary">Overtime Tracking:</AppText>
            <AppText weight="bold">Automatic Calculation</AppText>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <AppText size="lg" weight="bold" style={styles.title}>Attendance Preferences</AppText>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <AppText size="base" weight="medium">Require Selfie Verification</AppText>
              <AppText size="sm" color="secondary" style={{ marginTop: 4 }}>
                Prompt camera selfie snapshot during clock-in and clock-out.
              </AppText>
            </View>
            <Switch
              value={selfieCheckInRequired}
              onValueChange={setSelfieCheckInRequired}
              trackColor={{ false: colors.border, true: colors.primary[500] }}
            />
          </View>

          <View style={[styles.detailRow, { flexDirection: 'column', alignItems: 'flex-start', borderBottomWidth: 0, marginTop: 12 }]}>
            <AppText size="base" weight="medium" style={{ marginBottom: 8 }}>Auto Clock-out Safety Limit</AppText>
            <AppText size="sm" color="secondary" style={{ marginBottom: 12 }}>
              Automatically flag shift as completed if open session exceeds limit.
            </AppText>
            
            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              {timeoutOptions.map(hours => {
                const isSelected = autoClockOutTimeout === hours;
                return (
                  <TouchableOpacity
                    key={hours}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary[600] : colors.background,
                        borderColor: isSelected ? colors.primary[600] : colors.border,
                        borderRadius: borderRadius.md,
                      }
                    ]}
                    onPress={() => setAutoClockOutTimeout(hours)}
                  >
                    <AppText
                      size="sm"
                      weight="bold"
                      style={{ color: isSelected ? '#FFFFFF' : colors.text }}
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
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  description: {
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 20,
  }
});
