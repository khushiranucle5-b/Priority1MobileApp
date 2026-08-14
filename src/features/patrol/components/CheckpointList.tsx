import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { CheckpointCard, CheckpointData } from './CheckpointCard';

const mockCheckpoints: CheckpointData[] = [
  { id: '1', name: 'Main Gate', number: 'CP-01', location: 'Entrance', scheduledTime: '09:15 AM', status: 'Completed' },
  { id: '2', name: 'Reception Lobby', number: 'CP-02', location: 'Tower A', scheduledTime: '09:30 AM', status: 'Completed' },
  { id: '3', name: 'Parking Level 1', number: 'CP-03', location: 'Basement', scheduledTime: '09:45 AM', status: 'Missed' },
  { id: '4', name: 'Server Room', number: 'CP-04', location: 'Tower B', scheduledTime: '10:00 AM', status: 'Pending' },
  { id: '5', name: 'Emergency Exit', number: 'CP-05', location: 'Rear Gate', scheduledTime: '10:15 AM', status: 'Pending' },
];

export const CheckpointList: React.FC = () => {
  const { spacing } = useTheme();

  return (
    <Card variant="flat" style={styles.card}>
      <Heading level="h4" style={styles.title}>Assigned Checkpoints</Heading>
      
      <View style={{ marginTop: spacing.sm }}>
        {mockCheckpoints.map((cp) => (
          <CheckpointCard key={cp.id} data={cp} />
        ))}
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
  }
});
