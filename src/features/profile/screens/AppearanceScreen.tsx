import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useSettingsStore } from '../../../store/useSettingsStore';

import { typography } from '../../../theme/tokens/typography';

export const AppearanceScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { themeMode, setThemeMode } = useSettingsStore();

  const options = [
    { label: 'System Default', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ] as const;

  return (
    <ScreenLayout>
      <PageHeader title="Appearance" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          {options.map((option, index) => {
            const isSelected = themeMode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.row,
                  { borderBottomColor: colors.border },
                  index === options.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => setThemeMode(option.value)}
                activeOpacity={0.7}
              >
                <AppText style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {option.label}
                </AppText>
                {isSelected && <AppText style={{ color: colors.primary[600] || '#2563EB', fontSize: 24, fontWeight: '700' }}>✓</AppText>}
              </TouchableOpacity>
            );
          })}
        </View>

        <AppText style={styles.description}>
          System Default will automatically match your device's global appearance settings.
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
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    minHeight: 60,
    borderBottomWidth: 1,
  },
  optionLabel: {
    ...typography.presets.body,
    color: '#0F172A',
  },
  optionLabelSelected: {
    fontWeight: '700',
    color: '#2563EB',
  },
  description: {
    marginTop: 16,
    paddingHorizontal: 12,
    ...typography.presets.helper,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
  }
});
