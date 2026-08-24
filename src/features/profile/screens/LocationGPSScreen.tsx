import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { typography } from '../../../theme/tokens/typography';
import { PermissionsService, PermissionStatus } from '../../../services/permissions.service';
import { Button } from '../../../components/Button';
import { useSettingsStore } from '../../../store/useSettingsStore';

export const LocationGPSScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { locationEnabled } = useSettingsStore();

  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('unavailable');
  const [loading, setLoading] = useState(true);

  // Read actual runtime Android location permission state
  const refreshLocationStatus = useCallback(async () => {
    setLoading(true);
    try {
      const currentStatus = await PermissionsService.checkLocation();
      setPermissionStatus(currentStatus);
    } catch (e) {
      setPermissionStatus('unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-check permissions automatically when screen gains focus
  useFocusEffect(
    useCallback(() => {
      refreshLocationStatus();
    }, [refreshLocationStatus])
  );

  // Re-check permissions automatically when returning from Android Settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refreshLocationStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshLocationStatus]);

  const handleOpenSettings = async () => {
    await PermissionsService.openLocationSettings();
  };

  const handleGrantPermission = async () => {
    if (permissionStatus === 'blocked') {
      await PermissionsService.openAppSettings();
    } else {
      await PermissionsService.requestLocation();
      await refreshLocationStatus();
    }
  };

  const renderBadge = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return (
          <View style={[styles.badge, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
            <AppText style={[styles.badgeText, { color: '#15803D' }]}>GRANTED</AppText>
          </View>
        );
      case 'denied':
        return (
          <View style={[styles.badge, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
            <AppText style={[styles.badgeText, { color: '#B91C1C' }]}>DENIED</AppText>
          </View>
        );
      case 'blocked':
        return (
          <View style={[styles.badge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
            <AppText style={[styles.badgeText, { color: '#B45309' }]}>BLOCKED</AppText>
          </View>
        );
      default:
        return (
          <View style={[styles.badge, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
            <AppText style={[styles.badgeText, { color: '#64748B' }]}>UNAVAILABLE</AppText>
          </View>
        );
    }
  };

  const isLocalActive = permissionStatus === 'granted' && locationEnabled;

  return (
    <ScreenLayout>
      <PageHeader title="Location & GPS" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary[500]} style={{ marginTop: 40 }} />
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <AppText style={styles.title}>GPS Status & Permissions</AppText>
            
            <View style={styles.detailRow}>
              <AppText style={styles.label}>Device Permission:</AppText>
              {renderBadge(permissionStatus)}
            </View>

            <View style={styles.detailRow}>
              <AppText style={styles.label}>App Requirement:</AppText>
              <AppText style={styles.value}>Required on Duty</AppText>
            </View>
            
            <View style={styles.detailRow}>
              <AppText style={styles.label}>Local Setting:</AppText>
              <AppText style={[styles.value, { color: isLocalActive ? '#15803D' : '#DC2626' }]}>
                {isLocalActive ? 'Active' : 'Inactive'}
              </AppText>
            </View>

            <AppText style={styles.description}>
              {permissionStatus === 'granted' 
                ? 'GPS location tracking is active during your clocked-in hours for lone worker safety checks, checkpoint geofencing, and SOS emergency dispatch.'
                : permissionStatus === 'blocked'
                ? 'Location permission is permanently blocked in Android Settings. Tap "Open Device Settings" below to allow location access.'
                : 'Background location tracking is required exclusively when you are clocked in to a shift for lone worker safety and geofence verification.'}
            </AppText>

            <View style={{ marginTop: 20, width: '100%', gap: 12 }}>
              {permissionStatus !== 'granted' && (
                <Button 
                  title={permissionStatus === 'blocked' ? 'Grant Permission in Settings' : 'Grant Location Permission'} 
                  onPress={handleGrantPermission} 
                  variant="primary" 
                  size="large" 
                  fullWidth
                  style={{ minHeight: 60 }}
                />
              )}

              <Button 
                title="Open Device Settings" 
                onPress={handleOpenSettings} 
                variant={permissionStatus === 'granted' ? 'primary' : 'outline'} 
                size="large" 
                fullWidth
                style={{ minHeight: 60 }}
              />
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
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    ...typography.presets.cardTitle,
    color: '#0F172A',
    marginBottom: 16,
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
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    ...typography.presets.navLabel,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    marginTop: 16,
    textAlign: 'center',
    ...typography.presets.helper,
    lineHeight: 22,
    color: '#475569',
  }
});
