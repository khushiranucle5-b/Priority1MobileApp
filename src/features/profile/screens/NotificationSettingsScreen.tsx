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
    setNotificationsEnabled,
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
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderRadius: borderRadius.md }]}>
          <View style={styles.textContainer}>
            <AppText style={[styles.titleText, { color: colors.text }]}>Global Push Notifications</AppText>
            <AppText style={[styles.description, { color: colors.textSecondary }]}>
              Receive all system notifications and emergency dispatch alerts.
            </AppText>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.borderStrong, true: colors.primary[600] }}
            thumbColor={colors.surface}
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
    marginBottom: 6,
  },
  description: {
    ...typography.presets.helper,
    lineHeight: 22,
  },
});
