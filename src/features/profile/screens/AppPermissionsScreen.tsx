import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { Button } from '../../../components/Button';
import { PermissionsService, PermissionStatus } from '../../../services/permissions.service';

import { typography } from '../../../theme/tokens/typography';

export const AppPermissionsScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  const [locationStatus, setLocationStatus] = useState<PermissionStatus>('unavailable');
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('unavailable');
  const [notificationStatus, setNotificationStatus] = useState<PermissionStatus>('unavailable');
  const [storageStatus, setStorageStatus] = useState<PermissionStatus>('unavailable');
  const [loading, setLoading] = useState(true);

  // Read actual runtime Android permission states
  const refreshPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const [loc, cam, notif, stor] = await Promise.all([
        PermissionsService.checkLocation(),
        PermissionsService.checkCamera(),
        PermissionsService.checkNotification(),
        PermissionsService.checkStorage(),
      ]);

      setLocationStatus(loc);
      setCameraStatus(cam);
      setNotificationStatus(notif);
      setStorageStatus(stor);
    } catch (e) {
      console.error('Error checking permissions:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-check permissions whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshPermissions();
    }, [refreshPermissions])
  );

  // Re-check permissions automatically when user returns from Android Settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refreshPermissions();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshPermissions]);

  const handleRequestLocation = async () => {
    if (locationStatus === 'blocked') {
      await PermissionsService.openAppSettings();
    } else {
      await PermissionsService.requestLocation();
      await refreshPermissions();
    }
  };

  const handleRequestCamera = async () => {
    if (cameraStatus === 'blocked') {
      await PermissionsService.openAppSettings();
    } else {
      await PermissionsService.requestCamera();
      await refreshPermissions();
    }
  };

  const handleRequestNotification = async () => {
    if (notificationStatus === 'blocked') {
      await PermissionsService.openAppSettings();
    } else {
      await PermissionsService.requestNotification();
      await refreshPermissions();
    }
  };

  const handleRequestStorage = async () => {
    if (storageStatus === 'blocked') {
      await PermissionsService.openAppSettings();
    } else {
      await PermissionsService.requestStorage();
      await refreshPermissions();
    }
  };

  const renderBadge = (status: PermissionStatus, customLabel?: string) => {
    switch (status) {
      case 'granted':
        return (
          <View style={[styles.badge, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
            <AppText style={[styles.badgeText, { color: '#15803D' }]}>{customLabel || 'GRANTED'}</AppText>
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

  return (
    <ScreenLayout>
      <PageHeader title="App Permissions" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary[500]} style={{ marginTop: 40 }} />
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <AppText style={styles.title}>Required Application Permissions</AppText>
            
            {/* Location & GPS */}
            <TouchableOpacity 
              activeOpacity={locationStatus !== 'granted' ? 0.7 : 1}
              onPress={locationStatus !== 'granted' ? handleRequestLocation : undefined}
              style={styles.detailRow}
            >
              <View style={styles.rowHeader}>
                <AppText style={styles.permTitle}>Location & GPS</AppText>
                {renderBadge(locationStatus)}
              </View>
              <AppText style={styles.descText}>
                Used for attendance verification, lone worker safety check-ins, and checkpoint geofencing.
              </AppText>
              {locationStatus !== 'granted' && (
                <AppText style={styles.actionPrompt}>
                  {locationStatus === 'blocked' ? 'Tap to Open Settings →' : 'Tap to Grant Permission →'}
                </AppText>
              )}
            </TouchableOpacity>

            {/* Camera Access */}
            <TouchableOpacity 
              activeOpacity={cameraStatus !== 'granted' ? 0.7 : 1}
              onPress={cameraStatus !== 'granted' ? handleRequestCamera : undefined}
              style={styles.detailRow}
            >
              <View style={styles.rowHeader}>
                <AppText style={styles.permTitle}>Camera Access</AppText>
                {renderBadge(cameraStatus)}
              </View>
              <AppText style={styles.descText}>
                Required for scanning checkpoint QR codes, selfie verification, and attaching photos to incident reports.
              </AppText>
              {cameraStatus !== 'granted' && (
                <AppText style={styles.actionPrompt}>
                  {cameraStatus === 'blocked' ? 'Tap to Open Settings →' : 'Tap to Grant Permission →'}
                </AppText>
              )}
            </TouchableOpacity>

            {/* Push Notifications */}
            <TouchableOpacity 
              activeOpacity={notificationStatus !== 'granted' ? 0.7 : 1}
              onPress={notificationStatus !== 'granted' ? handleRequestNotification : undefined}
              style={styles.detailRow}
            >
              <View style={styles.rowHeader}>
                <AppText style={styles.permTitle}>Push Notifications</AppText>
                {renderBadge(notificationStatus, 'ACTIVE')}
              </View>
              <AppText style={styles.descText}>
                Used for shift reminders, lone worker safety alerts, and supervisor broadcast messages.
              </AppText>
              {notificationStatus !== 'granted' && (
                <AppText style={styles.actionPrompt}>
                  {notificationStatus === 'blocked' ? 'Tap to Open Settings →' : 'Tap to Grant Permission →'}
                </AppText>
              )}
            </TouchableOpacity>

            {/* Storage & Attachments */}
            <TouchableOpacity 
              activeOpacity={storageStatus !== 'granted' ? 0.7 : 1}
              onPress={storageStatus !== 'granted' ? handleRequestStorage : undefined}
              style={[styles.detailRow, { borderBottomWidth: 0 }]}
            >
              <View style={styles.rowHeader}>
                <AppText style={styles.permTitle}>Storage & Attachments</AppText>
                {renderBadge(storageStatus)}
              </View>
              <AppText style={styles.descText}>
                Used for caching site documents and offline incident attachments.
              </AppText>
              {storageStatus !== 'granted' && (
                <AppText style={styles.actionPrompt}>
                  {storageStatus === 'blocked' ? 'Tap to Open Settings →' : 'Tap to Grant Permission →'}
                </AppText>
              )}
            </TouchableOpacity>

            <View style={{ marginTop: 20, width: '100%' }}>
              <Button 
                title="Manage Device Permissions" 
                size="large"
                fullWidth
                style={{ minHeight: 60 }}
                onPress={() => PermissionsService.openAppSettings()} 
                variant="primary" 
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
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 16,
  },
  title: {
    ...typography.presets.cardTitle,
    color: '#0F172A',
    marginBottom: 16,
  },
  detailRow: {
    paddingVertical: 14,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  permTitle: {
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
  descText: {
    ...typography.presets.helper,
    lineHeight: 22,
    color: '#475569',
    marginTop: 4,
  },
  actionPrompt: {
    marginTop: 6,
    ...typography.presets.helper,
    fontWeight: '600',
    color: '#2563EB',
  }
});
