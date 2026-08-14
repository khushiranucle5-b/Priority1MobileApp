import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/Button';

export const AttendanceActionButtons: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleClockIn = () => {
    navigation.navigate('SelfieVerification', { actionType: 'Clock In' });
  };

  const handleClockOut = () => {
    navigation.navigate('SelfieVerification', { actionType: 'Clock Out' });
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Clock In" 
        variant="primary" 
        size="large" 
        fullWidth 
        style={styles.button}
        onPress={handleClockIn}
      />
      <Button 
        title="Clock Out" 
        variant="secondary" 
        size="large" 
        fullWidth 
        style={styles.button}
        onPress={handleClockOut}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 12,
  },
  button: {
    marginVertical: 0,
  }
});
