import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button } from '../../../components/Button';
import { useGuardStore } from '../../../store/useGuardStore';

export const StartPatrolCard: React.FC = () => {
  const { startPatrol, activePatrol, isClockedIn } = useGuardStore();

  const handleStartPatrol = async () => {
    if (!isClockedIn) {
      Alert.alert('Clock In Required', 'You must be clocked in before starting a patrol.');
      return;
    }
    await startPatrol();
  };

  if (activePatrol && activePatrol.status === 'in_progress') {
    return null; // Don't show start button if patrol is already active
  }

  return (
    <View style={styles.container}>
      <Button 
        title="Start Patrol" 
        variant="primary" 
        size="large" 
        fullWidth 
        onPress={handleStartPatrol}
        style={styles.btn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  btn: {
    height: 52,
    justifyContent: 'center',
  }
});
