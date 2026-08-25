import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useGuardStore, DBPatrol, isSameDate } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';
import { formatDisplayDate } from '../../../utils/dateUtils';
import { getPatrolAvailability } from '../utils/patrolUtils';

export const PatrolDateLogsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { patrols, startPatrol, ensurePatrolsForDate, isClockedIn } = useGuardStore();

  const selectedDateStr = route.params?.dateStr || new Date().toISOString();
  const displayTitleDate = formatDisplayDate(selectedDateStr);

  useEffect(() => {
    if (ensurePatrolsForDate && selectedDateStr) {
      ensurePatrolsForDate(selectedDateStr);
    }
  }, [selectedDateStr, ensurePatrolsForDate]);

  // Live timer tick every 10 seconds to dynamically update button availability
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter records for selected date only
  const recordsForDate = useMemo(() => {
    return (patrols || []).filter((item) => {
      return isSameDate(item.date, selectedDateStr) ||
        formatDisplayDate(item.date).toLowerCase() === displayTitleDate.toLowerCase();
    });
  }, [patrols, selectedDateStr, displayTitleDate]);

  const handlePatrolAction = async (patrol: DBPatrol) => {
    const avail = getPatrolAvailability(patrol, 15, now);

    if (avail.isCompleted || avail.isInProgress) {
      navigation.navigate('PatrolDetails', { patrolId: patrol.id });
      return;
    }

    if (!isClockedIn) {
      Alert.alert(
        'Clock In Required',
        'Please Clock In before starting patrol.',
        [
          { text: 'Clock In Now', onPress: () => navigation.navigate('Attendance') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    if (!avail.canStart) {
      if (avail.isBeforeBuffer) {
        Alert.alert(
          'Patrol Not Started Yet',
          `This patrol is scheduled for ${patrol.scheduledStartTime || patrol.startTime}. You can start it from ${avail.startWindowStartStr} (15-min buffer window).`,
          [
            { text: 'View Patrol Details', onPress: () => navigation.navigate('PatrolDetails', { patrolId: patrol.id }) },
            { text: 'OK', style: 'cancel' }
          ]
        );
      } else if (avail.isPastDate) {
        Alert.alert('Past Date', 'Past patrols cannot be started or modified.');
      } else if (avail.isFutureDate) {
        Alert.alert(
          'Future Date Patrol',
          `This patrol is scheduled for ${patrol.date} at ${patrol.scheduledStartTime || patrol.startTime}.`,
          [
            { text: 'View Patrol Details', onPress: () => navigation.navigate('PatrolDetails', { patrolId: patrol.id }) },
            { text: 'OK', style: 'cancel' }
          ]
        );
      } else if (avail.isExpired) {
        Alert.alert(
          'Patrol Expired',
          'The scheduled window for this patrol has passed.',
          [
            { text: 'View Patrol Details', onPress: () => navigation.navigate('PatrolDetails', { patrolId: patrol.id }) },
            { text: 'OK', style: 'cancel' }
          ]
        );
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
            const avail = getPatrolAvailability(item, 15, now);
            const badgeStyle = getStatusBadgeStyle(avail.statusLabel);
            const timeDisplay = `${item.scheduledStartTime || item.startTime || '02:00 PM'} - ${item.scheduledEndTime || '03:00 PM'}`;

            return (
              <Card key={item.id} variant="outlined" style={styles.patrolCard}>
                {/* 1. Patrol Information Header */}
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Heading level="h3" color="primary" style={styles.patrolTitle}>
                      {item.title}
                    </Heading>
                  </View>
                </View>

                {/* Status, Checkpoint Progress & Scheduled Time Chips */}
                <View style={styles.badgesRow}>
                  <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
                    <AppText style={[styles.badgeText, { color: badgeStyle.text }]}>
                      ● {avail.statusLabel}
                    </AppText>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9' }]}>
                    <AppText style={[styles.badgeText, { color: '#334155' }]}>
                      {item.scanned}/{item.checkpoints} Checkpoints
                    </AppText>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: '#EEF2FF' }]}>
                    <AppText style={[styles.badgeText, { color: '#4F46E5' }]}>
                      🕒 {timeDisplay}
                    </AppText>
                  </View>
                </View>

                {/* 2. Horizontal Divider Line */}
                <View style={styles.divider} />

                {/* 3. Bottom Action Row: Action Button + Eye Button on Right */}
                <View style={styles.bottomActionRow}>
                  {!avail.isPastDate && (
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Button
                        title={avail.buttonText}
                        variant={avail.canStart ? "primary" : "secondary"}
                        size="medium"
                        fullWidth
                        disabled={false}
                        onPress={() => handlePatrolAction(item)}
                        style={[
                          styles.actionBtn,
                          avail.isInProgress && { backgroundColor: '#0284C7' },
                          avail.isCompleted && { backgroundColor: '#D1FAE5' },
                        ]}
                      />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.eyeIconButton}
                    onPress={() => navigation.navigate('PatrolDetails', { patrolId: item.id })}
                    activeOpacity={0.7}
                    accessibilityLabel="View Patrol Details"
                    accessibilityRole="button"
                  >
                    <NavIcon name="eye" size={22} color="#4F46E5" />
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
    fontSize: 14.5,
    marginTop: 3,
    color: '#64748B',
  },
  patrolCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patrolTitle: {
    fontSize: 18.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
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
  divider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 12,
  },
  bottomActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  eyeIconButton: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    height: 52,
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
