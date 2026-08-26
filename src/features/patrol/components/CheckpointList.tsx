import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { Heading } from '../../../components/typography/Heading';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { CheckpointCard } from './CheckpointCard';

export const CheckpointList: React.FC = () => {
  const { spacing } = useTheme();
  const { patrolCheckpointsMap, activePatrol } = useGuardStore();

  const patrolCheckpoints = React.useMemo(() => {
    if (!activePatrol?.id) return [];
    return patrolCheckpointsMap[activePatrol.id] || [];
  }, [patrolCheckpointsMap, activePatrol?.id]);

  return (
    <Card variant="flat" style={styles.card}>
      <Heading level="h4" style={styles.title}>Assigned Checkpoints</Heading>
      
      <View style={{ marginTop: spacing.sm }}>
        {activePatrol && (activePatrol.status === 'in_progress' || activePatrol.status === 'In Progress') ? (
          patrolCheckpoints.map((cp) => (
            <CheckpointCard key={cp.id} data={cp} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <AppText size="sm" color="secondary">
              Start a patrol to see assigned checkpoints.
            </AppText>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    marginBottom: 4,
  },
  emptyContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  }
});
