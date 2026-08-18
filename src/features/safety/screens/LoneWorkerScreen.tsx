import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, LoneWorkerHistoryItem } from '../../../store/useGuardStore';
import { useNavigation } from '@react-navigation/native';

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

  const [nowMs, setNowMs] = React.useState(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const isCheckInDisabled = loneWorker.lastCheckInTimestamp
    ? nowMs - loneWorker.lastCheckInTimestamp < 30 * 60 * 1000
    : false;

  const handleSafeCheckIn = () => {
    checkInLoneWorker();
    Alert.alert('Safety Verified', 'Your safety check-in has been confirmed and logged with GPS verification.');
  };

  const handleReportSOS = () => {
    Alert.alert(
      'Emergency SOS Alert',
      'Are you sure you want to send an emergency SOS alert to the Security Control Room?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS Alert',
          style: 'destructive',
          onPress: async () => {
            await reportIncident({
              type: 'Emergency SOS',
              title: 'EMERGENCY SOS ALERT',
              description: `Emergency SOS triggered by ${guardName || 'Security Officer'} at ${assignedSite || 'Main Site'}.`,
              location: assignedSite || 'Main Site',
              severity: 'Critical',
            });
            Alert.alert('SOS Transmitted', 'Emergency alert sent to Control Room and Supervisor.');
          },
        },
      ]
    );
  };

  return (
    <ScreenLayout activeRoute="LoneWorker">
      <PageHeader title="My Lone Worker Safety" showBack />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Main Guard Safety Card */}
        <Card style={styles.mainSafetyCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Heading level="h3" color="primary">{guardName || 'John Smith'}</Heading>
              <AppText size="sm" color="secondary" style={{ marginTop: 2 }}>
                {assignedSite || 'Ahmedabad Plant'} • Active Shift
              </AppText>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: colors.successLight, borderRadius: borderRadius.full }]}>
              <AppText size="xs" weight="bold" style={{ color: colors.success[700] }}>
                ● {loneWorker.status || 'SAFE'}
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Timestamps Grid */}
          <View style={styles.timestampsGrid}>
            <View style={styles.timeBox}>
              <AppText size="xs" color="secondary">Last Check-In</AppText>
              <AppText size="md" weight="bold" color="primary">{loneWorker.lastCheckIn || '03:58 PM'}</AppText>
            </View>

            <View style={styles.timeBox}>
              <AppText size="xs" color="secondary">Next Check Due</AppText>
              <AppText size="md" weight="bold" style={{ color: '#D97706' }}>
                {loneWorker.nextCheckRequired || '04:58 PM'}
              </AppText>
            </View>
          </View>

          {/* GPS Verification Badge */}
          <View style={[styles.gpsBox, { backgroundColor: colors.primary[50], borderRadius: borderRadius.sm }]}>
            <AppText size="xs" weight="bold" color="primary">
              🌐 GPS Verified: Inside 50m Site Radius
            </AppText>
          </View>

          {/* Two Primary Glove-Friendly Safety Action Buttons */}
          <View style={styles.actionsBox}>
            <Button
              title={isCheckInDisabled ? "✓ SAFE CHECKED (Next in 30m)" : "✓  I'M SAFE"}
              variant={isCheckInDisabled ? "secondary" : "primary"}
              size="large"
              fullWidth
              disabled={isCheckInDisabled}
              onPress={handleSafeCheckIn}
              style={{ backgroundColor: isCheckInDisabled ? undefined : '#059669', minHeight: 54 }}
            />

            {isCheckInDisabled && (
              <AppText size="xs" color="secondary" style={{ textAlign: 'center', marginTop: 2 }}>
                ✓ Safety verified at {loneWorker.lastCheckIn}. Re-enables in 30 mins at {loneWorker.nextCheckRequired}.
              </AppText>
            )}

            <Button
              title="🚨  REPORT ISSUE / SOS"
              variant="danger"
              size="large"
              fullWidth
              onPress={handleReportSOS}
              style={{ minHeight: 54 }}
            />
          </View>
        </Card>

        {/* Current Shift Info Card */}
        <Card style={styles.shiftCard}>
          <Heading level="h4" color="primary" style={{ marginBottom: 10 }}>Current Shift Information</Heading>
          
          <View style={styles.infoRow}>
            <AppText size="sm" color="secondary">Assigned Site</AppText>
            <AppText size="sm" weight="bold" color="primary">{assignedSite || 'Ahmedabad Plant'}</AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText size="sm" color="secondary">Shift Schedule</AppText>
            <AppText size="sm" weight="bold" color="primary">Morning Shift (08:00 AM – 04:00 PM)</AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText size="sm" color="secondary">Supervisor</AppText>
            <AppText size="sm" weight="bold" color="primary">{supervisor || 'Jane Smith'}</AppText>
          </View>
        </Card>

        {/* My Safety Check-In History Section */}
        <Heading level="h4" style={styles.historyTitle}>My Safety Check-In History</Heading>

        {(!loneWorkerHistory || loneWorkerHistory.length === 0) ? (
          <AppText size="sm" color="secondary" style={{ textAlign: 'center', marginTop: 12 }}>
            No check-in history logged today.
          </AppText>
        ) : (
          loneWorkerHistory.map((item: LoneWorkerHistoryItem) => (
            <Card key={item.id} style={styles.historyCard}>
              <View style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <AppText size="md" weight="bold" color="primary">{item.time}</AppText>
                  <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>{item.siteName}</AppText>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={[styles.historyTag, { backgroundColor: '#ECFDF5' }]}>
                    <AppText size="xs" weight="bold" style={{ color: '#059669' }}>
                      {item.gpsStatus}
                    </AppText>
                  </View>
                  <AppText size="xs" weight="bold" style={{ color: '#10B981' }}>
                    {item.status}
                  </AppText>
                </View>
              </View>
            </Card>
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
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    padding: 10,
    alignItems: 'center',
    marginBottom: 18,
  },
  actionsBox: {
    gap: 12,
  },
  shiftCard: {
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyTitle: {
    marginBottom: 12,
  },
  historyCard: {
    padding: 14,
    marginBottom: 10,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
});
