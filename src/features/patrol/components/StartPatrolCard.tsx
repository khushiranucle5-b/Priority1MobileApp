import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../../components/Button';

export const StartPatrolCard: React.FC = () => {
  const handleStartPatrol = () => {
    // Placeholder function
    console.log('handleStartPatrol called');
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Start Patrol" 
        variant="primary" 
        size="large" 
        fullWidth 
        onPress={handleStartPatrol}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
});
