import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Platform, PermissionsAndroid, Modal, AppState, AppStateStatus } from 'react-native';
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
import { LoggerService, PermissionsService } from '../../../services';

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

  const { clockIn, clockOut, guardId, loadGuardData } = useGuardStore();

  useEffect(() => {
    if (!guardId && loadGuardData) {
      loadGuardData('G-1001', 'john@priority-one.io');
    }
  }, [guardId, loadGuardData]);

  // Re-check permissions automatically when returning from Phone App Settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const loc = await PermissionsService.checkLocation();
        const cam = await PermissionsService.checkCamera();
        LoggerService.log(`[SelfieVerificationScreen] App resumed from settings. Location: ${loc}, Camera: ${cam}`);
      }
    });
    return () => subscription.remove();
  }, []);

  const requestLocationFlow = async (): Promise<boolean> => {
    const status = await PermissionsService.checkLocation();
    if (status === 'granted') return true;

    const res = await PermissionsService.requestLocation();
    if (res.status === 'granted') return true;

    if (res.status === 'blocked' || !res.canAskAgain) {
      Alert.alert(
        'Location Permission Required',
        'Location access is required for attendance verification. Please enable Location permission in your phone Settings.',
        [
          { text: 'CANCEL', style: 'cancel' },
          {
            text: 'OPEN SETTINGS',
            onPress: () => PermissionsService.openAppSettings(),
          },
        ]
      );
      return false;
    }

    Alert.alert(
      'Location Permission Required',
      'Location access is required for attendance verification. Please allow location access to proceed.',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'ALLOW LOCATION',
          onPress: () => handleCaptureSelfie(),
        },
      ]
    );
    return false;
  };

  const requestCameraFlow = async (): Promise<boolean> => {
    const status = await PermissionsService.checkCamera();
    if (status === 'granted') return true;

    const res = await PermissionsService.requestCamera();
    if (res.status === 'granted') return true;

    if (res.status === 'blocked' || !res.canAskAgain) {
      Alert.alert(
        'Camera Permission Required',
        'Camera access is required for selfie verification. Please enable Camera permission in your phone Settings.',
        [
          { text: 'CANCEL', style: 'cancel' },
          {
            text: 'OPEN SETTINGS',
            onPress: () => PermissionsService.openAppSettings(),
          },
        ]
      );
      return false;
    }

    Alert.alert(
      'Camera Permission Required',
      'Camera access is required for selfie verification. Please allow camera access to proceed.',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'ALLOW CAMERA',
          onPress: () => handleCaptureSelfie(),
        },
      ]
    );
    return false;
  };

  const handleCaptureSelfie = async () => {
    const hasLoc = await requestLocationFlow();
    if (!hasLoc) return;

    const hasCam = await requestCameraFlow();
    if (!hasCam) return;

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

  const handleConfirm = async () => {
    LoggerService.log(`[SelfieVerificationScreen] Confirming ${actionType}`);
    try {
      if (actionType === 'Clock In') {
        await clockIn();
      } else {
        await clockOut();
      }
      
      setShowSuccess(true);
    } catch (err: any) {
      LoggerService.log(`[SelfieVerificationScreen] ${actionType} failed: ${err?.message || err}`, 'error');
      Alert.alert(
        'Attendance Failed',
        err?.message || 'An unexpected error occurred during attendance verification.'
      );
    }
  };

  const handleFinishSuccess = () => {
    setShowSuccess(false);
    navigation.goBack();
  };

  const { workingHours, clockInTimeStr, clockOutTimeStr, attendanceStatus } = useLiveAttendance();

  React.useEffect(() => {
    LoggerService.log(`[SelfieVerificationScreen] Attendance Info - Status: ${attendanceStatus}, ClockIn: ${clockInTimeStr}, ClockOut: ${clockOutTimeStr}`);
  }, [attendanceStatus, clockInTimeStr, clockOutTimeStr]);

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

      {/* Success Modal Dialogue (Fully Visible & Glove Touch Friendly) */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.successCard, { backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderColor: colors.border }]}>
            <AppText style={styles.successIcon}>✅</AppText>
            <AppText size="xl" weight="bold" color="success" style={styles.successTitle}>
              {actionType} Successful
            </AppText>
            
            <View style={styles.detailBox}>
              <AppText size="base" color="secondary" style={styles.successText}>
                Time: <AppText size="base" weight="bold" color="primary">{actionType === 'Clock In' ? clockInTimeStr : clockOutTimeStr}</AppText>
              </AppText>
              <AppText size="base" color="secondary" style={styles.successText}>
                Status: <AppText size="base" weight="bold" color="primary">{attendanceStatus}</AppText>
              </AppText>
              <AppText size="base" color="secondary" style={styles.successText}>
                Working Hours: <AppText size="base" weight="bold" color="primary">{workingHours}</AppText>
              </AppText>
            </View>

            {/* Prominent Visible 56px Done Action Button */}
            <Button
              title="✓ DONE"
              variant="primary"
              size="large"
              fullWidth
              onPress={handleFinishSuccess}
              style={styles.doneBtn}
            />
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 2000,
  },
  successCard: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  successIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  successTitle: {
    marginBottom: 14,
    textAlign: 'center',
  },
  detailBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    gap: 6,
  },
  successText: {
    fontSize: 15,
  },
  doneBtn: {
    height: 56,
  },
});
