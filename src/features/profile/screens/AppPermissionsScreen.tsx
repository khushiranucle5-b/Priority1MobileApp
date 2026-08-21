import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { Button } from '../../../components/Button';

export const AppPermissionsScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  return (
    <ScreenLayout>
      <PageHeader title="App Permissions" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <AppText size="lg" weight="bold" style={styles.title}>Required Application Permissions</AppText>
          
          <View style={styles.detailRow}>
            <View style={styles.rowHeader}>
              <AppText weight="bold">Location & GPS</AppText>
              <AppText size="xs" style={[styles.badge, { backgroundColor: colors.successLight || '#DCFCE7', color: '#166534' }]}>GRANTED</AppText>
            </View>
            <AppText color="secondary" style={styles.descText}>Used for attendance verification, lone worker safety check-ins, and checkpoint geofencing.</AppText>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.rowHeader}>
              <AppText weight="bold">Camera Access</AppText>
              <AppText size="xs" style={[styles.badge, { backgroundColor: colors.successLight || '#DCFCE7', color: '#166534' }]}>GRANTED</AppText>
            </View>
            <AppText color="secondary" style={styles.descText}>Required for scanning checkpoint QR codes, selfie verification, and attaching photos to incident reports.</AppText>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.rowHeader}>
              <AppText weight="bold">Push Notifications</AppText>
              <AppText size="xs" style={[styles.badge, { backgroundColor: colors.successLight || '#DCFCE7', color: '#166534' }]}>ACTIVE</AppText>
            </View>
            <AppText color="secondary" style={styles.descText}>Used for shift reminders, lone worker safety alerts, and supervisor broadcast messages.</AppText>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <View style={styles.rowHeader}>
              <AppText weight="bold">Storage & Attachments</AppText>
              <AppText size="xs" style={[styles.badge, { backgroundColor: colors.successLight || '#DCFCE7', color: '#166534' }]}>GRANTED</AppText>
            </View>
            <AppText color="secondary" style={styles.descText}>Used for caching site documents and offline incident attachments.</AppText>
          </View>

          <View style={{ marginTop: 24, width: '100%' }}>
            <Button title="Manage Device Permissions" onPress={() => Linking.openSettings()} variant="primary" />
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
    marginBottom: 20,
  },
  title: {
    marginBottom: 20,
  },
  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '700',
    overflow: 'hidden',
  },
  descText: {
    marginTop: 2,
    fontSize: 13,
  }
});
