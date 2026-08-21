import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { getPatrolAvailability } from '../../patrol/utils/patrolUtils';

export const PatrolProgressSummaryCard: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const { activePatrol, patrolCheckpoints, patrols } = useGuardStore();
  const navigation = useNavigation<any>();

  // Live ticker for time updates
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const targetPatrol = activePatrol || (patrols && patrols.length > 0 ? patrols[0] : null);

  const availability = useMemo(() => {
    if (!targetPatrol) return null;
    return getPatrolAvailability(targetPatrol, 15, now);
  }, [targetPatrol, now]);

  // Compute live patrol progress directly from central store
  const total = patrolCheckpoints && patrolCheckpoints.length > 0
    ? patrolCheckpoints.length
    : (targetPatrol?.checkpoints ?? 5);

  const completed = patrolCheckpoints && patrolCheckpoints.length > 0
    ? patrolCheckpoints.filter(cp => cp.status === 'Completed').length
    : (targetPatrol?.scanned ?? 0);

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = Math.max(0, total - completed);
  const isFinished = total > 0 && completed >= total;

  const handleScanPress = () => {
    if (targetPatrol?.id) {
      navigation.navigate('Home', {
        screen: 'PatrolDetails',
        params: { patrolId: targetPatrol.id, autoScan: true },
      });
    } else {
      navigation.navigate('Patrol');
    }
  };

  if (!targetPatrol) return null;

  const isAvailableOrInProgress = availability ? (availability.canStart || availability.isInProgress) : true;

  return (
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Heading level="h4" color="primary">
          {isAvailableOrInProgress ? 'PATROL PROGRESS' : 'NEXT PATROL'}
        </Heading>
        <AppText size="base" weight="bold" style={{ color: isFinished ? '#059669' : '#2563EB' }}>
          {isAvailableOrInProgress ? `${completed}/${total} Checkpoints` : `Starts at ${targetPatrol.scheduledStartTime || targetPatrol.startTime}`}
        </AppText>
      </View>

      <View style={styles.divider} />

      {isAvailableOrInProgress ? (
        <>
          <View style={[styles.progressBarContainer, { backgroundColor: colors.surfaceSecondary || '#e2e8f0', borderRadius: borderRadius.full }]}>
            <View style={[styles.progressBarFill, { backgroundColor: isFinished ? '#059669' : '#2563EB', borderRadius: borderRadius.full, width: `${percent}%` }]} />
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
            Scheduled Date: {targetPatrol.date} • {targetPatrol.scheduledStartTime || targetPatrol.startTime} - {targetPatrol.scheduledEndTime || '07:00 PM'}
          </AppText>
        </View>
      )}

      {!isFinished ? (
        <Button
          title={isAvailableOrInProgress ? "SCAN CHECKPOINT" : (availability?.buttonText || "START PATROLLING")}
          variant={isAvailableOrInProgress ? "primary" : "secondary"}
          size="large"
          fullWidth
          disabled={!isAvailableOrInProgress}
          onPress={handleScanPress}
          style={[styles.actionBtn, isAvailableOrInProgress && { backgroundColor: '#2563EB' }]}
        />
      ) : (
        <View style={[styles.completedBanner, { backgroundColor: '#D1FAE5', borderRadius: borderRadius.md }]}>
          <AppText size="sm" weight="bold" style={{ color: '#059669', textAlign: 'center' }}>
            ✓ Patrol Completed (100%)
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
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#cbd5e1',
    marginVertical: 12,
  },
  progressBarContainer: {
    height: 16,
    width: '100%',
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  nextPatrolInfoBox: {
    marginBottom: 14,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  actionBtn: {
    height: 56,
  },
  completedBanner: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
});
