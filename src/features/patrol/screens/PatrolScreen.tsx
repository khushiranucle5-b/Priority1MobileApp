import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { useGuardStore } from '../../../store/useGuardStore';
import {
  PatrolOverviewCard,
  PatrolProgressCard,
  StartPatrolCard,
  CheckpointList,
  ScanCheckpointCard,
  PatrolHistoryCard,
  PatrolInformationCard,
  EmptyPatrolState
} from '../components';

export const PatrolScreen: React.FC = () => {
  const { patrols } = useGuardStore();
  const hasPatrol = patrols.length > 0;

  return (
    <ScreenLayout>
      <PageHeader title="Patrol Checkpoints" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hasPatrol ? (
          <>
            <PatrolOverviewCard />
            <PatrolProgressCard />
            <StartPatrolCard />
            <CheckpointList />
            <ScanCheckpointCard />
            <PatrolHistoryCard />
            <PatrolInformationCard />
          </>
        ) : (
          <EmptyPatrolState />
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
});
