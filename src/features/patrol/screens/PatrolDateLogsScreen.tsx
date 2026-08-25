import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { StatusBadge } from '../../../components/StatusBadge';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, DBPatrol } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';
import { formatDisplayDate } from '../../../utils/dateUtils';
import { getPatrolAvailability, useLiveNow } from '../utils/patrolUtils';

export const PatrolDateLogsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { colors, spacing, borderRadius } = useTheme();
  const { patrols, startPatrol, ensurePatrolsForDate, isClockedIn, loadGuardData, guardId, guardEmail } = useGuardStore();

  const selectedDateStr = route.params?.dateStr || new Date().toISOString();
  const displayTitleDate = formatDisplayDate(selectedDateStr);

  useEffect(() => {
    if (isFocused && guardId) {
      loadGuardData(guardId, guardEmail || '');
    }
  }, [isFocused, guardId, guardEmail, loadGuardData]);

  useEffect(() => {
    if (ensurePatrolsForDate && selectedDateStr) {
      ensurePatrolsForDate(selectedDateStr);
    }
  }, [selectedDateStr, ensurePatrolsForDate]);

  // Live timer tick & foreground listener to dynamically update button availability
  const now = useLiveNow(5000);

  // Filter records for selected date only
  const recordsForDate = useMemo(() => {
    return (patrols || []).filter((item) => {
      const itemDateFormatted = formatDisplayDate(item.date);
      return itemDateFormatted.toLowerCase() === displayTitleDate.toLowerCase();
    });
  }, [patrols, displayTitleDate]);

  const handlePatrolAction = async (patrol: DBPatrol) => {
    const avail = getPatrolAvailability(patrol, 0, now);

    if (avail.isCompleted) {
      navigation.navigate('PatrolDetails', { patrolId: patrol.id });
      return;
    }

    if (avail.isInProgress) {
      navigation.navigate('PatrolDetails', { patrolId: patrol.id });
      return;
    }

    if (!isClockedIn) {
      Alert.alert(
        'Clock In Required',
        'You must clock in before starting a patrol. Please clock in first.'
      );
      return;
    }

    if (!avail.canStart) {
      if (avail.isPastDate) {
        Alert.alert('Past Date', 'Past patrols cannot be started or modified.');
      } else if (avail.isBeforeBuffer) {
        Alert.alert(
          'Patrol Not Started Yet',
          `This patrol is scheduled for ${patrol.scheduledStartTime || patrol.startTime}. You can start it from ${avail.startWindowStartStr} (15-min buffer window).`
        );
      } else if (avail.isFutureDate) {
        Alert.alert('Future Date', `This patrol is scheduled for ${patrol.date} at ${patrol.scheduledStartTime || patrol.startTime}.`);
      } else if (avail.isExpired) {
        Alert.alert('Patrol Expired', 'The scheduled window for this patrol has passed.');
      }
      return;
    }

    // Start patrol
    if (startPatrol) {
      await startPatrol(patrol.id);
    }
    navigation.navigate('PatrolDetails', { patrolId: patrol.id });
  };

  const getStatusBadgeStyle = (statusStr?: string) => {
    const s = (statusStr || '').toLowerCase();
    if (s === 'completed') return { bg: '#D1FAE5', text: '#059669' };
    if (s === 'in progress' || s === 'in_progress') return { bg: '#E0F2FE', text: '#0284C7' };
    if (s === 'assigned' || s === 'pending' || s === 'scheduled') return { bg: '#FEF3C7', text: '#D97706' };
    return { bg: '#FEE2E2', text: '#DC2626' };
  };

  return (
    <ScreenLayout activeRoute="Patrol">
      <PageHeader title={`Patrols — ${displayTitleDate}`} showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Summary Banner */}
        <View style={styles.summaryHeader}>
          <Heading level="h2" color="primary" style={styles.headerDateTitle}>
            {displayTitleDate}
          </Heading>
          <AppText size="sm" color="secondary" weight="medium" style={styles.headerSubtitle}>
            {recordsForDate.length} Patrol{recordsForDate.length !== 1 ? 's' : ''} assigned for this date
          </AppText>
        </View>

        {recordsForDate.length === 0 ? (
          <Card style={styles.emptyCard}>
            <NavIcon name="patrol" size={40} color="#94A3B8" />
            <Heading level="h3" color="primary" style={{ marginTop: 12, fontSize: 18 }}>
              No Patrols Scheduled
            </Heading>
            <AppText size="sm" color="secondary" style={{ marginTop: 4, textAlign: 'center' }}>
              There are no patrols assigned for {displayTitleDate}.
            </AppText>
          </Card>
        ) : (
          recordsForDate.map((item) => {
            const avail = getPatrolAvailability(item, 0, now);
            const timeDisplay = `${item.scheduledStartTime || item.startTime || '08:00 AM'} - ${item.scheduledEndTime || '09:00 AM'}`;

            return (
              <Card key={item.id} variant="outlined" style={styles.card}>
                <View style={styles.headerRow}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <AppText size="lg" weight="bold" color="primary" style={styles.cardHeaderTitle}>
                      {item.title || 'Patrol'}
                    </AppText>
                  </View>
                  <StatusBadge status={avail.statusLabel} size="md" />
                </View>

                <View style={[styles.detailRow, { marginTop: spacing.sm || 10 }]}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <AppText size="xs" color="secondary" weight="semibold" style={styles.metaLabelText}>
                      CHECKPOINTS
                    </AppText>
                    <AppText size="base" weight="bold" color="primary" style={styles.metaValueText}>
                      {item.scanned}/{item.checkpoints} Scanned
                    </AppText>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <AppText size="xs" color="secondary" weight="semibold" style={styles.metaLabelText}>
                      SCHEDULED TIME
                    </AppText>
                    <AppText size="base" weight="bold" style={[styles.metaValueText, { color: colors.primary[600] || '#2563EB' }]}>
                      {timeDisplay}
                    </AppText>
                  </View>
                </View>

                <View style={{ marginTop: 10 }}>
                  <AppText size="xs" color="secondary" weight="semibold" style={styles.metaLabelText}>
                    SITE / ROUTE
                  </AppText>
                  <AppText size="base" color="text" weight="bold" style={styles.metaValueText}>
                    {item.site || item.route || 'Unassigned Site'}
                  </AppText>
                </View>

                <View style={[styles.actionsRow, { borderTopColor: colors.border || '#E2E8F0' }]}>
                  {!avail.isPastDate && (
                    <Button
                      title={avail.buttonText}
                      variant={avail.canStart ? "primary" : "secondary"}
                      disabled={avail.isExpired || (!avail.canStart && !avail.isCompleted && !avail.isInProgress)}
                      onPress={() => handlePatrolAction(item)}
                      style={[
                        styles.inlineActionBtn,
                        avail.isInProgress && { backgroundColor: '#0284C7' },
                        avail.isCompleted && { backgroundColor: '#D1FAE5' },
                      ]}
                    />
                  )}

                  <TouchableOpacity
                    style={styles.iconActionBtnView}
                    onPress={() => navigation.navigate('PatrolDetails', { patrolId: item.id })}
                    activeOpacity={0.7}
                    accessibilityLabel="View patrol details"
                    accessibilityRole="button"
                  >
                    <NavIcon name="eye" size={24} color="#4F46E5" />
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
    marginBottom: 16,
  },
  headerDateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 15,
    marginTop: 3,
    color: '#64748B',
  },
  card: {
    marginBottom: 12,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    color: '#0F172A',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  metaLabelText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metaValueText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 3,
    lineHeight: 22,
    color: '#0F172A',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  inlineActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
  },
  iconActionBtnView: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  actionBtn: {
    height: 54,
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 16.5,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
});
