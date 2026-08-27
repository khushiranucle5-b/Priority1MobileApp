import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { typography } from '../../../theme/tokens/typography';
import { CONFIG } from '../../../constants/config';
import { NavIcon } from '../../../components/NavIcon';

export const AboutApplicationScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  return (
    <ScreenLayout>
      <PageHeader title="About Application" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          {/* Main App Icon Box */}
          <View style={styles.appIconBox}>
            <NavIcon name="security" size={32} color="#4F46E5" />
          </View>

          <Heading level="h3" color="primary" style={styles.appTitle}>
            Priority One Guard App
          </Heading>
          <AppText size="sm" color="secondary" style={styles.appSubtitle}>
            Enterprise Security Workforce Management
          </AppText>

          <View style={styles.divider} />

          {/* Application Detail Rows with Matching Icons */}
          <View style={styles.detailRow}>
            <View style={styles.rowLabelContainer}>
              <View style={styles.rowIconBox}>
                <NavIcon name="info" size={18} color="#4F46E5" />
              </View>
              <AppText style={styles.label}>Application:</AppText>
            </View>
            <AppText style={styles.value}>Priority One Guard</AppText>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.rowLabelContainer}>
              <View style={styles.rowIconBox}>
                <NavIcon name="document" size={18} color="#4F46E5" />
              </View>
              <AppText style={styles.label}>Version:</AppText>
            </View>
            <AppText style={styles.value}>v{CONFIG.APP_VERSION}</AppText>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.rowLabelContainer}>
              <View style={styles.rowIconBox}>
                <NavIcon name="settings" size={18} color="#4F46E5" />
              </View>
              <AppText style={styles.label}>Environment:</AppText>
            </View>
            <AppText style={[styles.value, { textTransform: 'capitalize' }]}>{CONFIG.ENV}</AppText>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.rowLabelContainer}>
              <View style={styles.rowIconBox}>
                <NavIcon name="security" size={18} color="#4F46E5" />
              </View>
              <AppText style={styles.label}>Security Protocol:</AppText>
            </View>
            <AppText style={styles.value}>AES-256 & GPS Verified</AppText>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.rowLabelContainer}>
              <View style={styles.rowIconBox}>
                <NavIcon name="phone" size={18} color="#4F46E5" />
              </View>
              <AppText style={styles.label}>Support Email:</AppText>
            </View>
            <AppText style={styles.value}>support@priorityone.com</AppText>
          </View>

          <AppText style={styles.footer}>
            © {new Date().getFullYear()} Priority One Security Services. All rights reserved.
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
    marginTop: 12,
  },
  appIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appTitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  appSubtitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  label: {
    ...typography.presets.label,
    color: '#475569',
    fontSize: 15,
  },
  value: {
    ...typography.presets.body,
    fontWeight: '700',
    fontSize: 15,
    color: '#0F172A',
  },
  footer: {
    marginTop: 24,
    ...typography.presets.helper,
    color: '#64748B',
    textAlign: 'center',
  }
});
