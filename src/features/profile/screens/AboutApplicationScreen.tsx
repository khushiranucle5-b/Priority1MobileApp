import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { typography } from '../../../theme/tokens/typography';
import { CONFIG } from '../../../constants/config';

export const AboutApplicationScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  return (
    <ScreenLayout>
      <PageHeader title="About Application" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <AppText style={styles.icon}>📱</AppText>
          <AppText style={styles.title}>Priority One Guard App</AppText>

          <View style={styles.detailRow}>
            <AppText style={styles.label}>Version:</AppText>
            <AppText style={styles.value}>{CONFIG.APP_VERSION}</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText style={styles.label}>Environment:</AppText>
            <AppText style={[styles.value, { textTransform: 'capitalize' }]}>{CONFIG.ENV}</AppText>
          </View>

          <AppText style={styles.footer}>
            © {new Date().getFullYear()} Priority One Security. All rights reserved.
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
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    marginTop: 16,
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    ...typography.presets.cardTitle,
    color: '#0F172A',
    marginBottom: 24,
    textAlign: 'center',
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
  },
  footer: {
    marginTop: 24,
    ...typography.presets.helper,
    color: '#64748B',
    textAlign: 'center',
  }
});
