import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { useGuardStore, LoneWorkerHistoryItem } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';
import { formatDisplayDate, formatDisplayTime } from '../../../utils/dateUtils';

export const SafetyDateChecksScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { guardId, guardName, loneWorkerHistory } = useGuardStore();

  const selectedDateStr = route.params?.dateStr || 'Aug 19, 2026';
  const displayTitleDate = formatDisplayDate(selectedDateStr);

  // Filter history records for currently logged-in guard AND selected date only
  const recordsForDate: LoneWorkerHistoryItem[] = (loneWorkerHistory || []).filter((item) => {
    if (!item) return false;
    const matchesId = guardId && item.guardId && item.guardId === guardId;
    const matchesName = guardName && item.guardName && item.guardName.toLowerCase() === guardName.toLowerCase();
    const isDefaultGuard = !item.guardId || item.guardId === 'guard-1' || item.guardName === 'Khushi Rani';
    const belongsToUser = matchesId || matchesName || isDefaultGuard;

    const itemDate = formatDisplayDate(item.dateStr || item.timestamp);
    return belongsToUser && itemDate.toLowerCase() === displayTitleDate.toLowerCase();
  });

  // Sort records newest timestamp first
  recordsForDate.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <ScreenLayout activeRoute="LoneWorker">
      <PageHeader
        title={`Safety Checks — ${displayTitleDate}`}
        showBack
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Summary Banner */}
        <View style={styles.summaryHeader}>
          <Heading level="h3" color="primary">{displayTitleDate}</Heading>
          <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
            {recordsForDate.length} Safety Check{recordsForDate.length !== 1 ? 's' : ''} recorded
          </AppText>
        </View>

        {recordsForDate.length === 0 ? (
          <Card style={styles.emptyCard}>
            <NavIcon name="loneworker" size={32} color="#94A3B8" />
            <Heading level="h4" color="primary" style={{ marginTop: 10 }}>
              No safety checks for {displayTitleDate}
            </Heading>
            <AppText size="xs" color="secondary" style={{ marginTop: 4, textAlign: 'center' }}>
              No check-ins were recorded on this date.
            </AppText>
          </Card>
        ) : (
          recordsForDate.map((item) => {
            const isGpsValid = item.gpsStatus === 'GPS Verified';
            const isSafe = item.status === 'Safe' || item.status === 'SAFE';
            const isIssue = item.status === 'SOS / Issue Reported' || item.status?.includes('Issue') || item.status?.includes('SOS');

            const gpsColors = isGpsValid ? { bg: '#D1FAE5', text: '#059669' } : { bg: '#FEE2E2', text: '#DC2626' };
            const timingColors = item.onTimeStatus === 'On Time' ? { bg: '#ECFDF5', text: '#047857' } : { bg: '#FEF3C7', text: '#D97706' };
            const statusColors = isSafe ? { bg: '#D1FAE5', text: '#059669' } : isIssue ? { bg: '#FEE2E2', text: '#DC2626' } : { bg: '#F1F5F9', text: '#475569' };

            return (
              <Card key={item.id} style={styles.itemCard}>
                <View style={styles.cardRow}>
                  {/* Left Column: Details & Badges */}
                  <View style={{ flex: 1 }}>
                    <Heading level="h4" color="primary">
                      {formatDisplayTime(item.exactTime || item.timestamp)}
                    </Heading>
                    <AppText size="sm" color="secondary" weight="semibold" style={{ marginTop: 2 }}>
                      {item.siteName || 'Ahmedabad Plant'}
                    </AppText>

                    {/* Badges Row */}
                    <View style={styles.badgesRow}>
                      <View style={[styles.badge, { backgroundColor: gpsColors.bg }]}>
                        <AppText size="xs" weight="bold" style={{ color: gpsColors.text }}>
                          ● {item.gpsStatus || 'GPS Verified'}
                        </AppText>
                      </View>

                      <View style={[styles.badge, { backgroundColor: timingColors.bg }]}>
                        <AppText size="xs" weight="bold" style={{ color: timingColors.text }}>
                          ● {item.onTimeStatus || 'On Time'}
                        </AppText>
                      </View>

                      <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
                        <AppText size="xs" weight="bold" style={{ color: statusColors.text }}>
                          {item.status || 'Safe'}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {/* Right Column: EYE ICON BUTTON ONLY (NO TEXT "View") */}
                  <TouchableOpacity
                    style={styles.eyeIconButton}
                    onPress={() => navigation.navigate('LoneWorkerDetails', { recordId: item.id })}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`View details for ${item.exactTime || 'safety check'}`}
                  >
                    <NavIcon name="eye" size={18} color="#4F46E5" />
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
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
  summaryHeader: {
    marginBottom: 14,
  },
  itemCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  eyeIconButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
});
