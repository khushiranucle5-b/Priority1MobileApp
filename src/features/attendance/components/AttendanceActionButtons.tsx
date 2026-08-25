import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/Button';

import { LoggerService } from '../../../services';

import { useLiveAttendance } from '../../../hooks/useLiveAttendance';

export const AttendanceActionButtons: React.FC = () => {
  const navigation = useNavigation<any>();
  const { attendanceStatus } = useLiveAttendance();
  const isCheckedIn = attendanceStatus === 'Checked In';

  const handleClockIn = () => {
    LoggerService.log('[AttendanceActionButtons] Clock In pressed');
    navigation.navigate('SelfieVerification', { actionType: 'Clock In' });
  };

  const handleClockOut = () => {
    LoggerService.log('[AttendanceActionButtons] Clock Out pressed');
    navigation.navigate('SelfieVerification', { actionType: 'Clock Out' });
  };

  return (
    <View style={styles.container}>
      {!isCheckedIn ? (
        <Button 
          title="Clock In" 
          variant="primary" 
          size="large" 
          fullWidth 
          style={styles.button}
          onPress={handleClockIn}
        />
      ) : (
        <Button 
          title="Clock Out" 
          variant="danger" 
          size="large" 
          fullWidth 
          style={styles.button}
          onPress={handleClockOut}
        />
      )}
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
