import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, DBPatrol } from '../../../store/useGuardStore';
import { getPatrolAvailability, findCurrentPatrol, useLiveNow } from '../../patrol/utils/patrolUtils';

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

const parseScheduleTs = (p: DBPatrol): number => {
  try {
    const dStr = p.date || new Date().toISOString().split('T')[0];
    const timeStr = p.scheduledStartTime || p.startTime || '08:00 AM';
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return new Date(dStr).getTime();
    let hrs = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;
    if (ampm === 'PM' && hrs < 12) hrs += 12;
    if (ampm === 'AM' && hrs === 12) hrs = 0;
    const base = new Date(dStr);
    base.setHours(hrs, mins, 0, 0);
    return base.getTime();
  } catch {
    return 0;
  }
};

export const PatrolProgressSummaryCard: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const { activePatrol, patrolCheckpointsMap, patrols, guardId, guardEmail, guardName, loadGuardData } = useGuardStore();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  // Re-evaluate patrol data whenever Home screen gains focus
  useEffect(() => {
    if (isFocused && guardId) {
      loadGuardData(guardId, guardEmail || '');
    }
  }, [isFocused, guardId, guardEmail, loadGuardData]);

  // Live ticker & foreground listener for time updates
  const now = useLiveNow(5000);

  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Filter assigned patrols for current logged-in user
  const userPatrols = useMemo(() => {
    const list = patrols || [];
    const filtered = list.filter(
      p => p.guardId === guardId || p.guardEmail === guardEmail || p.guard === guardName || p.guardId === 'G-1001' || p.guardId === 'guard-1'
    );
    return filtered.length > 0 ? filtered : list;
  }, [patrols, guardId, guardEmail, guardName]);

  // Dynamically resolve target patrol using strict priority rules
  const targetPatrol = useMemo(() => {
    return findCurrentPatrol(userPatrols, now);
  }, [userPatrols, now]);

  const availability = useMemo(() => {
    if (!targetPatrol) return null;
    return getPatrolAvailability(targetPatrol, 15, now);
  }, [targetPatrol, now]);

  const targetPatrolCheckpoints = useMemo(() => {
    if (!targetPatrol?.id) return [];
    return patrolCheckpointsMap[targetPatrol.id] || [];
  }, [patrolCheckpointsMap, targetPatrol?.id]);

  const total = targetPatrolCheckpoints.length > 0
    ? targetPatrolCheckpoints.length
    : (targetPatrol?.checkpoints ?? 5);

  const completed = targetPatrolCheckpoints.length > 0
    ? targetPatrolCheckpoints.filter(cp => cp.status === 'Completed').length
    : (targetPatrol?.scanned ?? 0);

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = Math.max(0, total - completed);
  const isFinished = total > 0 && completed >= total;

  const handleActionPress = () => {
    if (!targetPatrol) {
      navigation.navigate('Patrol');
      return;
    }

    if (availability) {
      if (availability.canStart || availability.isInProgress || availability.isCompleted) {
        navigation.navigate('Home', {
          screen: 'PatrolDetails',
          params: { patrolId: targetPatrol.id },
        });
        return;
      }

      if (availability.isBeforeBuffer) {
        Alert.alert(
          'Patrol Not Available Yet',
          `This patrol is scheduled for ${targetPatrol.scheduledStartTime || targetPatrol.startTime}. You can start it from ${availability.startWindowStartStr} (15-min buffer window).`,
          [
            { text: 'OK' },
            { text: 'View Patrols', onPress: () => navigation.navigate('Patrol') }
          ]
        );
        return;
      }
    }

    navigation.navigate('Home', {
      screen: 'PatrolDetails',
      params: { patrolId: targetPatrol.id },
    });
  };

  if (!targetPatrol) {
    return (
      <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Heading level="h3" color="primary">NEXT PATROL</Heading>
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
  const buttonTitle = availability ? availability.buttonText : (isAvailableOrInProgress ? "SCAN CHECKPOINT" : "START PATROLLING");
  const isButtonDisabled = availability
    ? (availability.isExpired || (!availability.canStart && !availability.isInProgress && !availability.isCompleted && !availability.isBeforeBuffer))
    : false;

  return (
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Heading level="h3" color="primary">
          {isAvailableOrInProgress ? 'PATROL PROGRESS' : 'NEXT PATROL'}
        </Heading>
        <AppText size="base" weight="bold" style={{ color: isFinished ? '#059669' : '#5B46E5', marginTop: 4 }}>
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
              {percent}% Completed ({completed}/{total})
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

      {!isFinished ? (
        <Button
          title={buttonTitle}
          variant="primary"
          size="large"
          fullWidth
          disabled={isButtonDisabled}
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
    flexDirection: 'column',
    alignItems: 'flex-start',
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
});
