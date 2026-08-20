import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useSettingsStore } from '../../../store/useSettingsStore';

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
              >
                <AppText size="base" weight={isSelected ? 'bold' : undefined} color={isSelected ? 'primary' : 'text'}>
                  {option.label}
                </AppText>
                {isSelected && <AppText style={{ color: colors.primary[500] }}>✓</AppText>}
              </TouchableOpacity>
            );
          })}
        </View>

        <AppText size="sm" color="secondary" style={styles.description}>
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
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  description: {
    marginTop: 16,
    paddingHorizontal: 8,
    textAlign: 'center',
  }
});
