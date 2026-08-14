import React, { useState } from 'react';
import { StyleSheet, View, Alert, Platform, PermissionsAndroid } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { launchCamera, CameraOptions } from 'react-native-image-picker';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { AttendanceHeader } from '../components/AttendanceHeader';
import { Button } from '../../../components/Button';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { CameraPlaceholder, CapturedImagePreview, InstructionCard } from '../components/selfie';
import { useGuardStore } from '../../../store/useGuardStore';
import { useLiveAttendance } from '../../../hooks/useLiveAttendance';

type ParamList = {
  SelfieVerification: {
    actionType: 'Clock In' | 'Clock Out';
  };
};

export const SelfieVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'SelfieVerification'>>();
  const actionType = route.params?.actionType || 'Clock In';

  const [hasCaptured, setHasCaptured] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageUri, setImageUri] = useState<string | undefined>();
  const { colors, spacing, borderRadius } = useTheme();

  const { clockIn, clockOut } = useGuardStore();

  const handleCaptureSelfie = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera access to record attendance selfies.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied', 
            'Camera access is required for attendance verification. Please grant permission in your device settings.',
            [{ text: 'Retry', onPress: () => handleCaptureSelfie() }, { text: 'Cancel', style: 'cancel' }]
          );
          return;
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to request camera permission');
        return;
      }
    }

    const options: CameraOptions = {
      mediaType: 'photo',
      saveToPhotos: false,
      cameraType: 'front',
      quality: 0.8,
    };

    try {
      const result = await launchCamera(options);
      
      if (result.didCancel) {
        return; // User cancelled, normal flow
      }
      
      if (result.errorCode) {
        if (result.errorCode === 'camera_unavailable') {
          Alert.alert('Camera Not Available', 'A physical device or camera-enabled emulator is required to use this feature.');
        } else if (result.errorCode === 'permission') {
          Alert.alert('Permission Denied', 'Camera access was denied. Please grant permission in your device settings.');
        } else {
          Alert.alert('Camera Error', result.errorMessage || 'An unexpected error occurred.');
        }
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setHasCaptured(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera. An unexpected exception occurred.');
    }
  };

  const handleRetake = () => {
    setHasCaptured(false);
    setImageUri(undefined);
    handleCaptureSelfie();
  };

  const handleConfirm = () => {
    if (actionType === 'Clock In') {
      clockIn();
    } else {
      clockOut();
    }
    
    setShowSuccess(true);
    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };

  const { workingHours, clockInTimeStr, clockOutTimeStr, attendanceStatus } = useLiveAttendance();

  return (
    <ScreenLayout>
      <AttendanceHeader />
      
      <View style={styles.container}>
        <AppText size="xl" weight="bold" style={styles.title}>Selfie Verification</AppText>
        
        {!hasCaptured ? (
          <>
            <InstructionCard message="Take a clear selfie to verify your identity before recording attendance." />
            <CameraPlaceholder />
            
            <View style={styles.actionContainer}>
              <Button 
                title="Capture Selfie" 
                variant="primary" 
                size="large" 
                fullWidth 
                onPress={handleCaptureSelfie}
                leftIcon={<AppText style={{fontSize: 18}}>📸</AppText>}
              />
              <AppText size="sm" color="error" style={styles.helperText}>
                Selfie verification is required before attendance can be recorded.
              </AppText>
            </View>
          </>
        ) : (
          <>
            <InstructionCard message="Please review your selfie. Ensure your face is clearly visible." />
            <CapturedImagePreview imageUri={imageUri} />
            
            <View style={styles.actionContainer}>
              <Button 
                title="Retake" 
                variant="outline" 
                size="large" 
                fullWidth 
                onPress={handleRetake}
                style={styles.btn}
              />
              <Button 
                title="Confirm & Submit" 
                variant="primary" 
                size="large" 
                fullWidth 
                onPress={handleConfirm}
                style={styles.btn}
              />
            </View>
          </>
        )}
      </View>

      {/* Success Bottom Sheet Overlay */}
      {showSuccess && (
        <View style={[styles.successOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.successSheet, { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.xl }]}>
            <AppText style={styles.successIcon}>✅</AppText>
            <AppText size="xl" weight="bold" color="success" style={styles.successTitle}>
              {actionType} Successful
            </AppText>
            <AppText size="base" color="secondary" style={styles.successText}>Time: {actionType === 'Clock In' ? clockInTimeStr : clockOutTimeStr}</AppText>
            <AppText size="base" color="secondary" style={styles.successText}>Status: {attendanceStatus}</AppText>
            <AppText size="base" color="secondary" style={styles.successText}>Working Hours: {workingHours}</AppText>
          </View>
        </View>
      )}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginTop: 'auto',
    marginBottom: 32,
    gap: 12,
  },
  helperText: {
    textAlign: 'center',
    marginTop: 8,
  },
  btn: {
    marginVertical: 0,
  },
  successOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  successSheet: {
    alignItems: 'center',
    paddingBottom: 48,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    marginBottom: 16,
  },
  successText: {
    marginBottom: 4,
  }
});
