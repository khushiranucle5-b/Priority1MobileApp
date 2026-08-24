import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useGuardStore, DBPatrol } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';
import { formatDisplayDate } from '../../../utils/dateUtils';
import { getPatrolAvailability } from '../utils/patrolUtils';

export const PatrolDateLogsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { patrols, startPatrol, ensurePatrolsForDate } = useGuardStore();

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
      const itemDateFormatted = formatDisplayDate(item.date);
      return itemDateFormatted.toLowerCase() === displayTitleDate.toLowerCase();
    });
  }, [patrols, displayTitleDate]);

  const handlePatrolAction = async (patrol: DBPatrol) => {
    const avail = getPatrolAvailability(patrol, 15, now);

    if (avail.isCompleted) {
      navigation.navigate('PatrolDetails', { patrolId: patrol.id });
      return;
    }

    if (avail.isInProgress) {
      navigation.navigate('PatrolDetails', { patrolId: patrol.id });
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
            const avail = getPatrolAvailability(item, 15, now);
            const badgeStyle = getStatusBadgeStyle(avail.statusLabel);
            const timeDisplay = `${item.scheduledStartTime || item.startTime || '08:00 AM'} - ${item.scheduledEndTime || '09:00 AM'}`;

            return (
              <Card key={item.id} style={styles.patrolCard}>
                <View style={styles.cardHeaderRow}>
                  {/* Left Column: Enlarged Patrol Title */}
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Heading level="h3" color="primary" style={styles.patrolTitle}>
                      {item.title}
                    </Heading>
                  </View>

                  {/* Right Action: Eye Icon Button */}
                  <TouchableOpacity
                    style={styles.eyeIconButton}
                    onPress={() => navigation.navigate('PatrolDetails', { patrolId: item.id })}
                    activeOpacity={0.7}
                  >
                    <NavIcon name="eye" size={22} color="#4F46E5" />
                  </TouchableOpacity>
                </View>

                {/* Enlarged Status, Checkpoint Progress & Scheduled Time Chips */}
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

                {/* Enlarged Dynamic Action Button */}
                {!avail.isPastDate && (
                  <Button
                    title={avail.buttonText}
                    variant={avail.canStart ? "primary" : "secondary"}
                    size="large"
                    fullWidth
                    disabled={!avail.canStart && !avail.isCompleted && !avail.isInProgress}
                    onPress={() => handlePatrolAction(item)}
                    style={[
                      styles.actionBtn,
                      avail.isInProgress && { backgroundColor: '#0284C7' },
                      avail.isCompleted && { backgroundColor: '#D1FAE5' },
                    ]}
                  />
                )}
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
    padding: 18,
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
  eyeIconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
    marginBottom: 16,
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
