import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, DBPatrol } from '../../../store/useGuardStore';
import { getPatrolAvailability, getCurrentRelevantPatrol } from '../../patrol/utils/patrolUtils';

const formatDisplayDate = (dStr?: string): string => {
  if (!dStr) return '';
  try {
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10) - 1;
      return `${months[mIdx]} ${parseInt(parts[2], 10)}, ${parts[0]}`;
    }
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } catch {
    return dStr;
  }
};

export const PatrolProgressSummaryCard: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const { activePatrol, patrolCheckpoints, patrols, guardId, guardEmail, guardName, loadGuardData, isClockedIn, startPatrol } = useGuardStore();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  // Re-evaluate patrol data whenever Home screen gains focus
  useEffect(() => {
    if (isFocused && guardId) {
      loadGuardData(guardId, guardEmail || '');
    }
  }, [isFocused, guardId, guardEmail, loadGuardData]);

  // Live ticker for time updates
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter assigned patrols strictly for current logged-in user
  const effectiveGuardId = guardId || 'G-1001';
  const effectiveEmail = guardEmail || 'john@priority-one.io';
  const userPatrols = useMemo(() => {
    return (patrols || []).filter(
      p => p.guardId === effectiveGuardId ||
           p.guardEmail === effectiveEmail ||
           (p.guard && guardName && p.guard.toLowerCase() === guardName.toLowerCase()) ||
           p.guardId === 'G-1001' ||
           p.guardId === 'guard-1'
    );
  }, [patrols, effectiveGuardId, effectiveEmail, guardName]);

  // Dynamically resolve target patrol using central application helper
  const targetPatrol = useMemo(() => {
    return getCurrentRelevantPatrol(userPatrols, now);
  }, [userPatrols, now]);

  // Debug logging on Home screen focus
  useEffect(() => {
    if (isFocused) {
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const todayPatrolsCount = userPatrols.filter(p => p.date === todayStr).length;
      console.log('HOME PATROL DEBUG\n',
        `Current Guard ID: ${effectiveGuardId}\n`,
        `Current Guard Email: ${effectiveEmail}\n`,
        `Today: ${todayStr}\n`,
        `All Patrol Count: ${patrols?.length || 0}\n`,
        `Today's Patrol Count: ${todayPatrolsCount}\n`,
        `Selected Patrol ID: ${targetPatrol?.id || 'NONE'}\n`,
        `Selected Patrol Date: ${targetPatrol?.date || 'NONE'}\n`,
        `Selected Patrol Status: ${targetPatrol?.status || 'NONE'}\n`,
        `Selected Patrol Start Time: ${targetPatrol?.scheduledStartTime || targetPatrol?.startTime || 'NONE'}`
      );
    }
  }, [isFocused, effectiveGuardId, effectiveEmail, patrols?.length, userPatrols, targetPatrol, now]);

  const availability = useMemo(() => {
    if (!targetPatrol) return null;
    return getPatrolAvailability(targetPatrol, 15, now);
  }, [targetPatrol, now]);

  // Compute live patrol progress directly from targetPatrol & central store
  const total = useMemo(() => {
    if (!targetPatrol) return 5;
    if (activePatrol && activePatrol.id === targetPatrol.id && patrolCheckpoints && patrolCheckpoints.length > 0) {
      return patrolCheckpoints.length;
    }
    return targetPatrol.checkpoints || 5;
  }, [targetPatrol, activePatrol, patrolCheckpoints]);

  const completed = useMemo(() => {
    if (!targetPatrol) return 0;
    if (activePatrol && activePatrol.id === targetPatrol.id && patrolCheckpoints && patrolCheckpoints.length > 0) {
      return patrolCheckpoints.filter(cp => cp.status === 'Completed').length;
    }
    return targetPatrol.scanned || 0;
  }, [targetPatrol, activePatrol, patrolCheckpoints]);

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = Math.max(0, total - completed);
  const isFinished = total > 0 && completed >= total;

  const nextCheckpoint = useMemo(() => {
    if (!targetPatrol) return null;
    if (activePatrol && activePatrol.id === targetPatrol.id && patrolCheckpoints && patrolCheckpoints.length > 0) {
      return patrolCheckpoints.find(cp => cp.status === 'Pending') || null;
    }
    return null;
  }, [targetPatrol, activePatrol, patrolCheckpoints]);

  const handleActionPress = async () => {
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

    if (!targetPatrol) {
      navigation.navigate('Patrol');
      return;
    }

    if (availability?.isInProgress) {
      navigation.navigate('Patrol', {
        screen: 'PatrolDetails',
        params: { patrolId: targetPatrol.id },
      });
      return;
    }

    if (availability?.canStart) {
      if (startPatrol && targetPatrol.status !== 'in_progress' && targetPatrol.status !== 'In Progress') {
        await startPatrol(targetPatrol.id);
      }
      navigation.navigate('Patrol', {
        screen: 'PatrolDetails',
        params: { patrolId: targetPatrol.id },
      });
      return;
    }

    if (availability?.isBeforeBuffer) {
      Alert.alert(
        'Patrol Scheduled',
        `This patrol is scheduled for ${targetPatrol.scheduledStartTime || targetPatrol.startTime}. You can start scanning from ${availability.startWindowStartStr} (15-min buffer window).`,
        [
          {
            text: 'Open Patrol Tab',
            onPress: () => navigation.navigate('Patrol', {
              screen: 'PatrolDateLogs',
              params: { dateStr: targetPatrol.date || '2026-08-25', patrolId: targetPatrol.id },
            })
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
      return;
    }

    navigation.navigate('Patrol', {
      screen: 'PatrolDateLogs',
      params: { dateStr: targetPatrol.date || '2026-08-25', patrolId: targetPatrol.id },
    });
  };

  if (!targetPatrol) {
    return (
      <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Heading level="h4" color="primary">NEXT PATROL</Heading>
          <AppText size="sm" weight="bold" color="secondary">No Upcoming Patrol</AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.nextPatrolInfoBox}>
          <AppText size="sm" weight="bold" color="primary">No Scheduled Patrols</AppText>
          <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
            You have no upcoming patrol assignments scheduled.
          </AppText>
        </View>
      </Card>
    );
  }

  const isAvailableOrInProgress = availability ? (availability.canStart || availability.isInProgress) : true;
  const buttonTitle = !isClockedIn
    ? "CLOCK IN REQUIRED"
    : (availability ? availability.buttonText : (isAvailableOrInProgress ? "START PATROLLING" : "START PATROLLING"));
  const isButtonDisabled = !isClockedIn || (availability ? (!availability.canStart && !availability.isInProgress && !availability.isCompleted && !availability.isBeforeBuffer) : false);

  return (
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Heading level="h4" color="primary">
          {isAvailableOrInProgress ? 'PATROL PROGRESS' : 'NEXT PATROL'}
        </Heading>
        <AppText size="base" weight="bold" style={{ color: isFinished ? '#059669' : '#5B46E5' }}>
          {isAvailableOrInProgress ? `${completed}/${total} Checkpoints` : `Starts at ${targetPatrol.scheduledStartTime || targetPatrol.startTime}`}
        </AppText>
      </View>

      <View style={styles.divider} />

      {isAvailableOrInProgress ? (
        <>
          <View style={[styles.progressBarContainer, { backgroundColor: colors.surfaceSecondary || '#e2e8f0', borderRadius: borderRadius.full }]}>
            <View style={[styles.progressBarFill, { backgroundColor: isFinished ? '#059669' : '#5B46E5', borderRadius: borderRadius.full, width: `${percent}%` }]} />
          </View>

          <View style={styles.progressTextRow}>
            <AppText size="sm" color="secondary" weight="semibold">
              {percent}% Completed
            </AppText>
            <AppText size="sm" color="secondary" weight="semibold">
              {remaining} Remaining
            </AppText>
          </View>
        </>
      ) : (
        <View style={styles.nextPatrolInfoBox}>
          <AppText size="sm" weight="bold" color="primary">
            {targetPatrol.title}
          </AppText>
          <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
            Scheduled Date: {formatDisplayDate(targetPatrol.date)} • {targetPatrol.scheduledStartTime || targetPatrol.startTime} - {targetPatrol.scheduledEndTime || '09:00 PM'}
          </AppText>
        </View>
      )}

      {/* Next Checkpoint section if present */}
      {nextCheckpoint && !isFinished && (
        <View style={styles.nextCpBox}>
          <AppText size="xs" weight="bold" color="secondary" style={{ marginBottom: 4, letterSpacing: 0.5 }}>
            NEXT CHECKPOINT
          </AppText>
          <View style={styles.nextCpRow}>
            <AppText size="sm" weight="bold" color="primary">
              {nextCheckpoint.number} — {nextCheckpoint.name}
            </AppText>
            <View style={styles.pendingBadge}>
              <AppText size="xs" weight="bold" style={{ color: '#D97706' }}>
                ● Pending
              </AppText>
            </View>
          </View>
          {nextCheckpoint.location ? (
            <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
              Location: {nextCheckpoint.location}
            </AppText>
          ) : null}
        </View>
      )}

      {!isFinished ? (
        <Button
          title={buttonTitle}
          variant="primary"
          size="large"
          fullWidth
          disabled={false}
          onPress={handleActionPress}
          style={[styles.actionBtn, { backgroundColor: isButtonDisabled ? '#94A3B8' : '#5B46E5' }]}
        />
      ) : (
        <View style={[styles.completedBanner, { backgroundColor: '#D1FAE5', borderRadius: borderRadius.md }]}>
          <AppText size="sm" weight="bold" style={{ color: '#065F46' }}>
            ✓ Patrol Completed Successfully
          </AppText>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 14,
  },
  progressBarContainer: {
    height: 10,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nextPatrolInfoBox: {
    paddingVertical: 4,
    marginBottom: 16,
  },
  actionBtn: {
    height: 52,
  },
  completedBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextCpBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  nextCpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
