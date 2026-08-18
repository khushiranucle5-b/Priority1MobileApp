import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, LoneWorkerHistoryItem } from '../../../store/useGuardStore';
import { useNavigation } from '@react-navigation/native';
import { NavIcon } from '../../../components/NavIcon';

export const LoneWorkerScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const {
    guardName,
    guardId,
    assignedSite,
    supervisor,
    loneWorker,
    loneWorkerHistory,
    checkInLoneWorker,
    reportIncident,
  } = useGuardStore();

  const [verifyingGps, setVerifyingGps] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const cooldownMs = 30 * 60 * 1000;
  const elapsedMs = loneWorker.lastCheckInTimestamp ? nowMs - loneWorker.lastCheckInTimestamp : Infinity;
  const isCheckInDisabled = loneWorker.lastCheckInTimestamp !== null && elapsedMs < cooldownMs;
  const remainingMins = isCheckInDisabled ? Math.max(1, Math.ceil((cooldownMs - elapsedMs) / (60 * 1000))) : 0;

  // Filter history records for currently logged-in guard only
  const myHistory = (loneWorkerHistory || []).filter((item) => {
    if (!item) return false;
    const matchesId = guardId && item.guardId && item.guardId === guardId;
    const matchesName = guardName && item.guardName && item.guardName.toLowerCase() === guardName.toLowerCase();
    const isDefaultGuard = !item.guardId || item.guardId === 'guard-1' || item.guardName === 'Khushi Rani';
    return matchesId || matchesName || isDefaultGuard;
  });

  // Group history items by date
  const groupedHistory = myHistory.reduce<{ [date: string]: LoneWorkerHistoryItem[] }>((acc, item) => {
    const key = item.dateStr || 'Recent Check-Ins';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const handleSafeCheckIn = () => {
    setVerifyingGps(true);
    setTimeout(() => {
      setVerifyingGps(false);

      // Simulate device GPS calculation relative to site (Ahmedabad Plant)
      const mockLat = 23.1145;
      const mockLng = 72.5821;
      const distance = 42; // meters
      const isVerified = distance <= 200;

      checkInLoneWorker({
        latitude: mockLat,
        longitude: mockLng,
        distanceMeters: distance,
        gpsStatus: isVerified ? 'GPS Verified' : 'Location Not Verified',
        status: 'Safe',
      });

      Alert.alert(
        isVerified ? 'GPS Verified — I\'M SAFE' : 'Location Not Verified',
        isVerified
          ? `Safety check-in verified successfully!\nGPS Location: ${mockLat}° N, ${mockLng}° E\nDistance: ${distance}m inside site radius.`
          : `Device location is outside the allowed site radius (${distance}m). Safety logged as unverified.`,
        [{ text: 'OK' }]
      );
    }, 800);
  };

  const handleReportSOS = () => {
    Alert.alert(
      'Emergency SOS Alert',
      'Are you sure you want to send an emergency SOS alert to the Control Room & Supervisor?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Emergency SOS',
          style: 'destructive',
          onPress: async () => {
            checkInLoneWorker({
              status: 'SOS / Issue Reported',
              gpsStatus: 'GPS Verified',
            });

            await reportIncident({
              type: 'Emergency SOS',
              title: 'EMERGENCY SOS SAFETY ALERT',
              description: `Emergency SOS triggered by ${guardName || 'Khushi Rani'} at ${assignedSite || 'Ahmedabad Plant'}.`,
              location: assignedSite || 'Ahmedabad Plant',
              severity: 'Critical',
            });

            Alert.alert('SOS Transmitted', 'Emergency SOS alert transmitted to Control Room.');
          },
        },
      ]
    );
  };

  return (
    <ScreenLayout activeRoute="LoneWorker">
      <PageHeader title="My Lone Worker Safety" showBack />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Main Current Safety Status Card */}
        <Card style={styles.mainSafetyCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Heading level="h3" color="primary">{guardName || 'Khushi Rani'}</Heading>
              <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                {guardId || 'GRD-1024'} • {assignedSite || 'Ahmedabad Plant (Ranucle Zundal)'}
              </AppText>
              <AppText size="xs" weight="semibold" style={{ color: '#475569', marginTop: 2 }}>
                Active Shift: Morning Shift (08:00 AM - 04:00 PM)
              </AppText>
            </View>

            <View style={styles.statusBadge}>
              <AppText size="xs" weight="bold" style={{ color: '#059669' }}>
                ● {loneWorker.status || 'SAFE'}
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Timestamps Row */}
          <View style={styles.timestampsGrid}>
            <View style={styles.timeBox}>
              <AppText size="xs" color="secondary">Last Check-In</AppText>
              <AppText size="md" weight="bold" color="primary" style={{ marginTop: 2 }}>
                {loneWorker.lastCheckIn || '10:00:15 AM'}
              </AppText>
            </View>

            <View style={styles.timeBox}>
              <AppText size="xs" color="secondary">Next Check Due</AppText>
              <AppText size="md" weight="bold" style={{ color: '#D97706', marginTop: 2 }}>
                {loneWorker.nextCheckRequired || '11:00:00 AM'}
              </AppText>
            </View>
          </View>

          {/* Geofence Status Indicator */}
          <View style={styles.gpsBox}>
            <View style={{ marginRight: 6 }}>
              <NavIcon name="patrol" size={16} color="#059669" />
            </View>
            <AppText size="xs" weight="bold" style={{ color: '#065F46' }}>
              GPS Verified — Inside allowed geofence (200m radius)
            </AppText>
          </View>

          {/* Two Glove-Friendly 54px Action Buttons */}
          <View style={styles.actionsBox}>
            {verifyingGps ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <AppText size="sm" weight="bold" style={{ color: '#FFFFFF', marginLeft: 8 }}>
                  Verifying Device GPS...
                </AppText>
              </View>
            ) : (
              <View>
                <Button
                  title={
                    isCheckInDisabled
                      ? `✓ SAFE VERIFIED (${remainingMins}m remaining)`
                      : "I'M SAFE"
                  }
                  variant={isCheckInDisabled ? "secondary" : "primary"}
                  size="large"
                  fullWidth
                  disabled={isCheckInDisabled}
                  onPress={handleSafeCheckIn}
                  style={{
                    backgroundColor: isCheckInDisabled ? '#94A3B8' : '#059669',
                    height: 54,
                  }}
                />

                {isCheckInDisabled && (
                  <AppText size="xs" color="secondary" style={{ textAlign: 'center', marginTop: 6 }}>
                    ✓ Safety verified at {loneWorker.lastCheckIn}. Next check-in re-enables in {remainingMins} mins (at {loneWorker.nextCheckRequired}).
                  </AppText>
                )}
              </View>
            )}

            <Button
              title="REPORT ISSUE / SOS"
              variant="danger"
              size="large"
              fullWidth
              onPress={handleReportSOS}
              style={{ backgroundColor: '#DC2626', height: 54 }}
            />
          </View>
        </Card>

        {/* Safety Check-In History Header */}
        <Heading level="h4" style={styles.historyTitle}>
          Safety Check-In History ({myHistory.length})
        </Heading>

        {Object.keys(groupedHistory).length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <NavIcon name="loneworker" size={32} color="#94A3B8" />
            <AppText size="sm" color="secondary" style={{ marginTop: 10, textAlign: 'center' }}>
              No safety check-ins logged for your account today.
            </AppText>
          </Card>
        ) : (
          Object.keys(groupedHistory).map((dateKey) => (
            <View key={dateKey} style={styles.dateGroupBlock}>
              <AppText size="xs" weight="bold" style={styles.dateGroupHeader}>
                {dateKey.toUpperCase()}
              </AppText>

              {groupedHistory[dateKey].map((item) => {
                const isGpsValid = item.gpsStatus === 'GPS Verified';
                const gpsColors = isGpsValid ? { bg: '#D1FAE5', text: '#059669' } : { bg: '#FEE2E2', text: '#DC2626' };
                const onTimeColors = item.onTimeStatus === 'On Time' ? { bg: '#ECFDF5', text: '#047857' } : { bg: '#FEF3C7', text: '#D97706' };

                return (
                  <Card key={item.id} style={styles.historyCard}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('LoneWorkerDetails', { recordId: item.id })}
                    >
                      <View style={styles.historyHeaderRow}>
                        <View style={{ flex: 1 }}>
                          <Heading level="h4" color="primary">
                            {item.exactTime || '10:00:15 AM'}
                          </Heading>
                          <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                            {item.siteName || 'Ahmedabad Plant'}
                          </AppText>
                        </View>

                        <TouchableOpacity
                          style={styles.viewIconButton}
                          onPress={() => navigation.navigate('LoneWorkerDetails', { recordId: item.id })}
                          activeOpacity={0.7}
                        >
                          <NavIcon name="eye" size={18} color="#4F46E5" />
                        </TouchableOpacity>
                      </View>

                      {/* Status Badges Row */}
                      <View style={styles.historyBadgesRow}>
                        <View style={[styles.historyTag, { backgroundColor: gpsColors.bg }]}>
                          <AppText size="xs" weight="bold" style={{ color: gpsColors.text }}>
                            ● {item.gpsStatus}
                          </AppText>
                        </View>

                        <View style={[styles.historyTag, { backgroundColor: onTimeColors.bg }]}>
                          <AppText size="xs" weight="bold" style={{ color: onTimeColors.text }}>
                            ● {item.onTimeStatus}
                          </AppText>
                        </View>

                        <View style={[styles.historyTag, { backgroundColor: '#F1F5F9' }]}>
                          <AppText size="xs" weight="bold" style={{ color: '#475569' }}>
                            {item.status}
                          </AppText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Card>
                );
              })}
            </View>
          ))
        )}

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  mainSafetyCard: {
    padding: 18,
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  timestampsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  timeBox: {
    alignItems: 'center',
  },
  gpsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  actionsBox: {
    gap: 12,
  },
  loadingButton: {
    height: 54,
    backgroundColor: '#059669',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyTitle: {
    marginBottom: 12,
  },
  dateGroupBlock: {
    marginBottom: 14,
  },
  dateGroupHeader: {
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 2,
  },
  historyCard: {
    padding: 16,
    marginBottom: 10,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  historyTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  viewIconButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
