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
            <NavIcon name="security" size={28} color="#2563EB" />
          </View>

          <Heading level="h4" color="primary" style={styles.appTitle}>
            Priority One Guard App
          </Heading>
          <AppText size="xs" color="secondary" style={styles.appSubtitle}>
            Enterprise Security Workforce Management
          </AppText>

          <View style={styles.divider} />

          {/* Application Detail Rows */}
          <View style={styles.detailRow}>
            <View style={styles.rowLabelContainer}>
              <View style={styles.rowIconBox}>
                <NavIcon name="info" size={16} color="#2563EB" />
              </View>
              <AppText size="xs" color="secondary" weight="medium">Application</AppText>
            </View>
            <AppText size="xs" weight="bold" color="primary" style={styles.valueText}>
              Priority One Guard
            </AppText>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.rowLabelContainer}>
              <View style={styles.rowIconBox}>
                <NavIcon name="document" size={16} color="#2563EB" />
              </View>
              <AppText size="xs" color="secondary" weight="medium">Version</AppText>
            </View>
            <AppText size="xs" weight="bold" color="primary" style={styles.valueText}>
              v{CONFIG.APP_VERSION}
            </AppText>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.rowLabelContainer}>
              <View style={styles.rowIconBox}>
                <NavIcon name="settings" size={16} color="#2563EB" />
              </View>
              <AppText size="xs" color="secondary" weight="medium">Environment</AppText>
            </View>
            <AppText size="xs" weight="bold" color="primary" style={[styles.valueText, { textTransform: 'capitalize' }]}>
              {CONFIG.ENV}
            </AppText>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.rowLabelContainer}>
              <View style={styles.rowIconBox}>
                <NavIcon name="security" size={16} color="#2563EB" />
              </View>
              <AppText size="xs" color="secondary" weight="medium">Security</AppText>
            </View>
            <AppText size="xs" weight="bold" color="primary" style={styles.valueText}>
              AES-256 & GPS
            </AppText>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <View style={styles.rowLabelContainer}>
              <View style={styles.rowIconBox}>
                <NavIcon name="phone" size={16} color="#2563EB" />
              </View>
              <AppText size="xs" color="secondary" weight="medium">Support Email</AppText>
            </View>
            <AppText size="xs" weight="bold" color="primary" style={styles.valueText}>
              support@priorityone.com
            </AppText>
          </View>

          <AppText size="xs" color="secondary" style={styles.footer}>
            © {new Date().getFullYear()} Priority One Security Services. All rights reserved.
          </AppText>
        </View>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginTop: 8,
  },
  appIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  appTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  appSubtitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  rowLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
  },
});
