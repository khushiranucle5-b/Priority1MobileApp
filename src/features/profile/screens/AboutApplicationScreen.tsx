import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
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
          <AppText size="lg" weight="bold" style={styles.title}>Priority One Guard App</AppText>
          
          <View style={styles.detailRow}>
            <AppText color="secondary">Version:</AppText>
            <AppText weight="bold">{CONFIG.APP_VERSION}</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText color="secondary">Environment:</AppText>
            <AppText weight="medium" style={{ textTransform: 'capitalize' }}>{CONFIG.ENV}</AppText>
          </View>

          <AppText size="sm" color="secondary" style={styles.footer}>
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
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
  }
});
