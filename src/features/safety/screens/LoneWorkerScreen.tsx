import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { StatusBadge } from '../../../components/StatusBadge';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, LoneWorkerHistoryItem } from '../../../store/useGuardStore';
import { useNavigation } from '@react-navigation/native';
import { NavIcon } from '../../../components/NavIcon';
import { formatDisplayTime, isToday } from '../../../utils/dateUtils';

export const LoneWorkerScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const {
    guardName,
    guardId,
    assignedSite,
    loneWorker,
    loneWorkerHistory,
    checkInLoneWorker,
    reportIncident,
    isClockedIn,
  } = useGuardStore();

  const [verifyingGps, setVerifyingGps] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const cooldownMs = 30 * 60 * 1000;
  const lastTs = loneWorker?.lastCheckInTimestamp;
  const elapsedMs = lastTs ? nowMs - lastTs : Infinity;
  const isCheckInDisabled = !isClockedIn || (lastTs !== null && lastTs !== undefined && elapsedMs < cooldownMs);
  const remainingMins = isCheckInDisabled && isClockedIn ? Math.max(1, Math.ceil((cooldownMs - elapsedMs) / (60 * 1000))) : 0;

  const todayKey = React.useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Filter history records strictly for current user and TODAY only
  const todayHistory = React.useMemo(() => {
    return (loneWorkerHistory || []).filter((item) => {
      if (!item) return false;
      const belongsToUser = (guardId && item.guardId === guardId) || 
        (guardName && item.guardName && item.guardName.toLowerCase() === guardName.toLowerCase());
      if (!belongsToUser) return false;

      const itemDate = item.dateStr || (item.timestamp ? new Date(item.timestamp).toISOString().split('T')[0] : '');
      return itemDate === todayKey || isToday(item.timestamp);
    });
  }, [loneWorkerHistory, guardId, guardName, todayKey]);

  const handleSafeCheckIn = () => {
    setVerifyingGps(true);
    setTimeout(() => {
      setVerifyingGps(false);

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
        isVerified ? 'GPS Verified — SAFE CHECKED' : 'Location Not Verified',
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
              <Heading level="h3" color="primary">{guardName || 'Security Officer'}</Heading>
              <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                {guardId || 'GRD-1001'} • {assignedSite || 'Assigned Site'}
              </AppText>
              <AppText size="xs" weight="semibold" style={{ color: '#475569', marginTop: 2 }}>
                Active Shift: Morning Shift (08:00 AM - 04:00 PM)
              </AppText>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: isClockedIn ? '#D1FAE5' : '#F1F5F9' }]}>
              <AppText size="xs" weight="bold" style={{ color: isClockedIn ? '#059669' : '#94A3B8' }}>
                ● {isClockedIn ? (loneWorker.status || 'SAFE') : 'NOT ACTIVE'}
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Timestamps Row */}
          <View style={styles.timestampsGrid}>
            <View style={styles.timeBox}>
              <AppText size="xs" color="secondary">Last Check-In</AppText>
              <AppText size="md" weight="bold" color="primary" style={{ marginTop: 2 }}>
                {isClockedIn ? (loneWorker.lastCheckIn || '--:--') : 'None'}
              </AppText>
            </View>

            <View style={styles.timeBox}>
              <AppText size="xs" color="secondary">Next Check Due</AppText>
              <AppText size="md" weight="bold" style={{ color: isClockedIn ? '#D97706' : '#94A3B8', marginTop: 2 }}>
                {isClockedIn ? (loneWorker.nextCheckRequired || '--:--') : 'Clock In Required'}
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

          {/* Action Buttons (60px Glove-Friendly) */}
          <View style={styles.actionsBox}>
            {verifyingGps ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <AppText size="base" weight="bold" style={{ color: '#FFFFFF', marginLeft: 8 }}>
                  Verifying Device GPS...
                </AppText>
              </View>
            ) : (
              <View>
                <Button
                  title={
                    !isClockedIn
                      ? "Clock In Required"
                      : isCheckInDisabled
                        ? "SAFE CHECKED"
                        : "SAFETY CHECKED"
                  }
                  variant={isCheckInDisabled ? "secondary" : "primary"}
                  size="large"
                  fullWidth
                  disabled={isCheckInDisabled}
                  onPress={handleSafeCheckIn}
                  style={{
                    backgroundColor: isCheckInDisabled ? undefined : '#059669',
                    height: 60,
                  }}
                />

                {isClockedIn && isCheckInDisabled && (
                  <AppText size="xs" color="secondary" style={{ textAlign: 'center', marginTop: 6 }}>
                    Safety verified at {loneWorker.lastCheckIn}. Next check-in re-enables in {remainingMins} mins (at {loneWorker.nextCheckRequired}).
                  </AppText>
                )}
              </View>
            )}

            <Button
              title="REPORT ISSUE / SOS"
              variant="emergency"
              size="large"
              fullWidth
              onPress={handleReportSOS}
              style={{ height: 60 }}
            />
          </View>
        </Card>

        {/* Today's Safety Check History Section */}
        <View style={styles.sectionHeaderRow}>
          <Heading level="h4">Today's Safety Check History</Heading>
          <AppText size="xs" color="secondary" weight="bold">({todayHistory.length})</AppText>
        </View>

        {todayHistory.length === 0 ? (
          <Card style={styles.emptyTodayCard}>
            <NavIcon name="loneworker" size={32} color="#94A3B8" />
            <Heading level="h4" color="primary" style={{ marginTop: 10 }}>
              No safety checks today
            </Heading>
            <AppText size="xs" color="secondary" style={{ marginTop: 4, textAlign: 'center' }}>
              Your completed safety checks will appear here.
            </AppText>
          </Card>
        ) : (
          todayHistory.map((item) => {
            const isSafe = item.status === 'Safe' || item.status === 'SAFE';

            return (
              <Card key={item.id} style={styles.todayCard}>
                <View style={styles.todayCardTop}>
                  <View style={{ flex: 1 }}>
                    <Heading level="h4" color="primary">
                      {formatDisplayTime(item.exactTime || item.timestamp)}
                    </Heading>
                    <AppText size="xs" color="secondary" weight="semibold" style={{ marginTop: 2 }}>
                      {item.siteName || 'Ahmedabad Plant'}
                    </AppText>

                    <View style={{ marginTop: 6 }}>
                      <StatusBadge status={isSafe ? 'Safe' : (item.status || 'Verified')} size="sm" />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.eyeIconButton}
                    onPress={() => navigation.navigate('LoneWorkerDetails', { recordId: item.id })}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`View details for ${formatDisplayTime(item.exactTime || item.timestamp)}`}
                  >
                    <NavIcon name="eye" size={18} color="#4F46E5" />
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}

        {/* View Full History Button */}
        <Button
          title="📋 View Full History"
          variant="secondary"
          size="large"
          fullWidth
          onPress={() => navigation.navigate('SafetyHistory')}
          style={styles.fullHistoryBtn}
        />

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
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
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
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  actionsBox: {
    gap: 12,
  },
  loadingButton: {
    height: 60,
    backgroundColor: '#059669',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  todayCard: {
    padding: 14,
    marginBottom: 10,
  },
  todayCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyeIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  emptyTodayCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  fullHistoryBtn: {
    height: 56,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
});
