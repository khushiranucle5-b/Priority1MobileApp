import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useGuardStore, LoneWorkerHistoryItem } from '../../../store/useGuardStore';
import { useTheme } from '../../../providers/ThemeProvider';
import { NavIcon } from '../../../components/NavIcon';

export const LoneWorkerDetailsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { guardName, guardId, loneWorkerHistory } = useGuardStore();

  const recordId = route.params?.recordId;
  const record: LoneWorkerHistoryItem =
    (loneWorkerHistory || []).find((item) => item.id === recordId) ||
    loneWorkerHistory[0] ||
    {
      id: 'lw-101',
      guardId: guardId || 'guard-1',
      guardName: guardName || 'Khushi Rani',
      dateStr: 'Aug 18, 2026',
      exactTime: '10:00:15 AM',
      siteName: 'Ahmedabad Plant (Ranucle Zundal)',
      latitude: 23.1145,
      longitude: 72.5821,
      distanceMeters: 42,
      radiusMeters: 200,
      gpsStatus: 'GPS Verified',
      onTimeStatus: 'On Time',
      status: 'Safe',
      shiftInfo: 'Morning Shift (08:00 AM - 04:00 PM)',
      timestamp: Date.now(),
    };

  const isGpsValid = record.gpsStatus === 'GPS Verified';
  const gpsColors = isGpsValid ? { bg: '#D1FAE5', text: '#059669' } : { bg: '#FEE2E2', text: '#DC2626' };
  const onTimeColors = record.onTimeStatus === 'On Time' ? { bg: '#ECFDF5', text: '#047857' } : { bg: '#FEF3C7', text: '#D97706' };

  return (
    <ScreenLayout activeRoute="LoneWorker">
      <PageHeader title="Safety Check Detail" showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Title Block */}
        <View style={styles.headerBlock}>
          <Heading level="h2" color="primary">Safety Check Detail</Heading>
          <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
            View complete GPS verification, time, and shift details for this safety check.
          </AppText>
        </View>

        {/* Main Status Banner Card */}
        <Card style={styles.statusBannerCard}>
          <View style={styles.bannerHeader}>
            <View style={{ flex: 1 }}>
              <Heading level="h3" color="primary">Check-In Status: {record.status}</Heading>
              <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                {record.dateStr} at {record.exactTime || record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : '10:00 AM'}
              </AppText>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: gpsColors.bg }]}>
              <AppText size="xs" weight="bold" style={{ color: gpsColors.text }}>
                ● {record.gpsStatus}
              </AppText>
            </View>

            <View style={[styles.badge, { backgroundColor: onTimeColors.bg }]}>
              <AppText size="xs" weight="bold" style={{ color: onTimeColors.text }}>
                ● {record.onTimeStatus}
              </AppText>
            </View>
          </View>
        </Card>

        {/* GEOLOCATION & GEOFENCE VERIFICATION CARD */}
        <Card style={styles.infoCard}>
          <AppText size="xs" weight="bold" style={styles.cardSectionHeading}>
            GEOLOCATION & GEOFENCE VERIFICATION
          </AppText>

          <View style={styles.dividerLine} />

          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">GPS Latitude</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {record.latitude ? `${record.latitude.toFixed(4)}° N` : '23.1145° N'}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">GPS Longitude</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {record.longitude ? `${record.longitude.toFixed(4)}° E` : '72.5821° E'}
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Distance from Site</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {record.distanceMeters ?? 42} meters
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Allowed Geofence Radius</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {record.radiusMeters ?? 200} meters
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridColFull}>
                <AppText size="xs" color="secondary">Verification Result</AppText>
                <View style={[styles.badge, { backgroundColor: gpsColors.bg, marginTop: 4 }]}>
                  <AppText size="xs" weight="bold" style={{ color: gpsColors.text }}>
                    {isGpsValid
                      ? '✓ GPS Verified — Inside allowed site geofence radius'
                      : '⚠️ Location Not Verified — Outside allowed radius or unavailable'}
                  </AppText>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* SHIFT & GUARD DETAILS CARD */}
        <Card style={styles.infoCard}>
          <AppText size="xs" weight="bold" style={styles.cardSectionHeading}>
            SHIFT & GUARD INFORMATION
          </AppText>

          <View style={styles.dividerLine} />

          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Guard Name</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {record.guardName || guardName || 'Khushi Rani'}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Guard ID</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {record.guardId || guardId || 'GRD-1024'}
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Assigned Site</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {record.siteName || 'Ahmedabad Plant (Ranucle Zundal)'}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Active Shift</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {record.shiftInfo || 'Morning Shift (08:00 AM - 04:00 PM)'}
                </AppText>
              </View>
            </View>
          </View>
        </Card>

        {/* Back Button */}
        <Button
          title="← Back to Safety Check-Ins"
          variant="primary"
          size="large"
          fullWidth
          onPress={() => navigation.goBack()}
          style={{ height: 52, backgroundColor: '#4F46E5', marginTop: 4 }}
        />

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  headerBlock: {
    marginBottom: 4,
  },
  statusBannerCard: {
    padding: 18,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  infoCard: {
    padding: 20,
  },
  cardSectionHeading: {
    color: '#64748B',
    letterSpacing: 0.5,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  gridContainer: {
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCol: {
    width: '48%',
  },
  gridColFull: {
    width: '100%',
  },
});
