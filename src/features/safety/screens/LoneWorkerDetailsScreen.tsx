import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useGuardStore, LoneWorkerHistoryItem } from '../../../store/useGuardStore';
import { useTheme } from '../../../providers/ThemeProvider';
import { formatDisplayDate, formatDisplayTime } from '../../../utils/dateUtils';

export const LoneWorkerDetailsScreen: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { guardName, guardId, loneWorkerHistory, incidents } = useGuardStore();

  const recordId = route.params?.recordId;
  const historyList = loneWorkerHistory || [];
  const foundRecord = historyList.find((item) => item.id === recordId);
  const record: LoneWorkerHistoryItem = foundRecord || (historyList.length > 0 ? historyList[0] : {
    id: 'lw-101',
    guardId: guardId || 'guard-1',
    guardName: guardName || 'Khushi Rani',
    dateStr: 'Aug 19, 2026',
    exactTime: '10:00:15 AM',
    siteName: 'Ahmedabad Plant',
    latitude: 23.1145,
    longitude: 72.5821,
    distanceMeters: 42,
    radiusMeters: 200,
    gpsStatus: 'GPS Verified',
    onTimeStatus: 'On Time',
    status: 'Safe',
    shiftInfo: 'Morning Shift (08:00 AM - 04:00 PM)',
    timestamp: Date.now(),
  });

  const isGpsValid = record.gpsStatus === 'GPS Verified';
  const isSafe = record.status === 'Safe' || record.status === 'SAFE';
  const isIssue = record.status === 'SOS / Issue Reported' || record.status?.includes('Issue') || record.status?.includes('SOS');

  const gpsColors = isGpsValid ? { bg: '#ECFDF5', text: '#059669' } : { bg: '#FEF2F2', text: '#DC2626' };
  const timingColors = record.onTimeStatus === 'On Time' ? { bg: '#ECFDF5', text: '#047857' } : { bg: '#FEF3C7', text: '#D97706' };
  const statusColors = isSafe ? { bg: '#ECFDF5', text: '#059669' } : isIssue ? { bg: '#FEF2F2', text: '#DC2626' } : { bg: '#F1F5F9', text: '#475569' };

  const formattedDate = formatDisplayDate(record.dateStr || record.timestamp);
  const formattedTime = formatDisplayTime(record.exactTime || record.timestamp);
  const nextCheckTime = record.timestamp
    ? formatDisplayTime(record.timestamp + 30 * 60 * 1000)
    : '--:--';

  // Find linked incident if any
  const linkedIncident = isIssue ? (incidents || [])[0] : null;

  return (
    <ScreenLayout activeRoute="LoneWorker">
      <PageHeader title="Safety Check Detail" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Main Status Banner Card */}
        <Card style={styles.statusBannerCard}>
          <View style={styles.bannerHeader}>
            <View style={{ flex: 1 }}>
              <AppText size="sm" weight="bold" style={styles.sectionLabel}>SAFETY STATUS</AppText>
              <Heading level="h2" style={{ color: statusColors.text, marginTop: 2, fontSize: 26, fontWeight: '700' }}>
                {isSafe ? 'SAFE' : isIssue ? 'ISSUE REPORTED' : record.status}
              </Heading>
              <AppText size="base" color="secondary" style={{ marginTop: 2 }}>
                {formattedDate} at {formattedTime}
              </AppText>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={[styles.pillBadge, { backgroundColor: gpsColors.bg, borderColor: isGpsValid ? '#A7F3D0' : '#FECACA' }]}>
              <AppText size="sm" weight="bold" style={{ color: gpsColors.text }}>
                ● {record.gpsStatus || 'GPS Verified'}
              </AppText>
            </View>

            <View style={[styles.pillBadge, { backgroundColor: timingColors.bg, borderColor: record.onTimeStatus === 'On Time' ? '#A7F3D0' : '#FDE68A' }]}>
              <AppText size="sm" weight="bold" style={{ color: timingColors.text }}>
                ● {record.onTimeStatus || 'On Time'}
              </AppText>
            </View>
          </View>
        </Card>

        {/* ISSUE INFORMATION CARD (Shown only if record contains an issue) */}
        {isIssue && (
          <Card style={[styles.infoCard, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}>
            <AppText size="sm" weight="bold" style={{ color: '#DC2626', letterSpacing: 0.8 }}>
              ISSUE / EMERGENCY DETAILS
            </AppText>
            <View style={[styles.dividerLine, { backgroundColor: '#FCA5A5' }]} />

            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                <View style={styles.gridColFull}>
                  <AppText style={styles.fieldLabelText}>Status</AppText>
                  <AppText size="base" weight="bold" style={{ color: '#DC2626', marginTop: 2 }}>
                    ISSUE REPORTED / SOS TRIGGERED
                  </AppText>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.gridColFull}>
                  <AppText style={styles.fieldLabelText}>Issue Summary</AppText>
                  <AppText size="base" weight="semibold" color="primary" style={{ marginTop: 2 }}>
                    {linkedIncident?.title || 'Emergency SOS Safety Alert triggered during routine 30-min lone worker check-in.'}
                  </AppText>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <AppText style={styles.fieldLabelText}>Reported At</AppText>
                  <AppText size="base" weight="bold" color="primary" style={{ marginTop: 2 }}>
                    {formattedTime}
                  </AppText>
                </View>

                <View style={styles.gridCol}>
                  <AppText style={styles.fieldLabelText}>Action Taken</AppText>
                  <AppText size="base" weight="bold" style={{ color: '#047857', marginTop: 2 }}>
                    Control Room Notified
                  </AppText>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* UNIFIED COMPACT SAFETY & GEOLOCATION CARD */}
        <Card style={styles.infoCard}>
          {/* SECTION 1: SAFETY CHECK INFORMATION */}
          <AppText style={styles.cardSectionHeading}>
            SAFETY CHECK INFORMATION
          </AppText>

          <View style={styles.dividerLine} />

          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabelText}>Date</AppText>
                <AppText style={styles.valText}>
                  {formattedDate}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabelText}>Check-In Time</AppText>
                <AppText style={styles.valText}>
                  {formattedTime}
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabelText}>Site</AppText>
                <AppText style={styles.valText}>
                  {record.siteName || 'Ahmedabad Plant'}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabelText}>Guard</AppText>
                <AppText style={styles.valText}>
                  {record.guardName || guardName || 'Security Officer'}
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabelText}>Shift</AppText>
                <AppText style={styles.valText}>
                  {record.shiftInfo || 'Morning Shift (08:00 AM - 04:00 PM)'}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabelText}>Timing</AppText>
                <AppText style={[styles.valText, { color: timingColors.text }]}>
                  {record.onTimeStatus || 'On Time'}
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabelText}>Check Completed</AppText>
                <AppText style={styles.valText}>
                  {formattedTime}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabelText}>Next Scheduled</AppText>
                <AppText style={[styles.valText, { color: '#D97706' }]}>
                  {nextCheckTime}
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridColFull}>
                <AppText style={styles.fieldLabelText}>Safety Check Result</AppText>
                <View style={[styles.resultBadge, { backgroundColor: statusColors.bg }]}>
                  <AppText style={{ color: statusColors.text, fontSize: 14, fontWeight: '700' }}>
                    {isSafe ? '✓ SAFE — Routine check-in confirmed' : isIssue ? '⚠️ ISSUE REPORTED — SOS alert logged' : record.status}
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          {/* SECTION 2: GEOLOCATION & GEOFENCE VERIFICATION */}
          <View style={styles.sectionGap} />
          
          <AppText style={styles.cardSectionHeading}>
            GEOLOCATION & GEOFENCE VERIFICATION
          </AppText>

          <View style={styles.dividerLine} />

          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabelText}>GPS Verification</AppText>
                <AppText style={[styles.valText, { color: gpsColors.text }]}>
                  {record.gpsStatus || 'GPS Verified'}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabelText}>Geofence Radius</AppText>
                <AppText style={styles.valText}>
                  Inside ({record.radiusMeters || 200}m)
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabelText}>Latitude</AppText>
                <AppText style={styles.valText}>
                  {record.latitude ? `${record.latitude.toFixed(4)}° N` : '23.1145° N'}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabelText}>Longitude</AppText>
                <AppText style={styles.valText}>
                  {record.longitude ? `${record.longitude.toFixed(4)}° E` : '72.5821° E'}
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridColFull}>
                <AppText style={styles.fieldLabelText}>Distance from Site Center</AppText>
                <AppText style={styles.valText}>
                  {record.distanceMeters ?? 42} meters (Max allowed: {record.radiusMeters ?? 200}m)
                </AppText>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    paddingBottom: 32,
    gap: 12,
  },
  statusBannerCard: {
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    color: '#64748B',
    letterSpacing: 0.8,
    fontSize: 13.5,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  infoCard: {
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  cardSectionHeading: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#4F46E5',
    letterSpacing: 0.8,
  },
  dividerLine: {
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  sectionGap: {
    height: 20,
  },
  gridContainer: {
    gap: 12,
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
  fieldLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  valText: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
});
