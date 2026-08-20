import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { PermissionsService, PermissionStatus } from '../../../services/permissions.service';
import { Button } from '../../../components/Button';
import { useSettingsStore } from '../../../store/useSettingsStore';

export const LocationGPSScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { locationEnabled } = useSettingsStore();
  
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    const currentStatus = await PermissionsService.checkLocation();
    setStatus(currentStatus);
    setLoading(false);
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  return (
    <ScreenLayout>
      <PageHeader title="Location & GPS" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary[500]} style={{ marginTop: 40 }} />
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <AppText size="lg" weight="bold" style={styles.title}>GPS Status</AppText>
            
            <View style={styles.detailRow}>
              <AppText color="secondary">Device Permission:</AppText>
              <AppText weight="bold" style={{ textTransform: 'capitalize' }}>{status || 'Unknown'}</AppText>
            </View>

            <View style={styles.detailRow}>
              <AppText color="secondary">App Requirement:</AppText>
              <AppText weight="medium">Required on Duty</AppText>
            </View>
            
            <View style={styles.detailRow}>
              <AppText color="secondary">Local Setting:</AppText>
              <AppText weight="medium">{locationEnabled ? 'Active' : 'Disabled'}</AppText>
            </View>

            <AppText size="sm" color="secondary" style={styles.description}>
              {status === 'unavailable' 
                ? 'Location permission status is currently unavailable via the Permission Service.'
                : 'Background location tracking is used exclusively when you are clocked in to a shift for lone worker safety and geofence verification.'}
            </AppText>

            <View style={{ marginTop: 20, width: '100%' }}>
              <Button title="Open Device Settings" onPress={handleOpenSettings} variant="outline" />
            </View>
          </View>
        )}

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
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
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
