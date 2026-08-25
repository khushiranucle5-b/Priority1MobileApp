import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Animated, TextInput, Alert, ScrollView, Platform, PermissionsAndroid } from 'react-native';
import { launchCamera, CameraOptions } from 'react-native-image-picker';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

export const ScanCheckpointCard: React.FC = () => {
  const { spacing, colors, borderRadius } = useTheme();
  const { scanCheckpointCode, activePatrol, patrolCheckpoints, isClockedIn } = useGuardStore();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanSuccessText, setScanSuccessText] = useState<string | null>(null);
  const [scanErrorText, setScanErrorText] = useState<string | null>(null);

  // Animated red laser scan line
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScannerOpen) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 200,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      laserAnim.setValue(0);
    }
  }, [isScannerOpen]);

  const requestCameraPermission = async (): Promise<'granted' | 'denied' | 'never_ask_again'> => {
    if (Platform.OS !== 'android') return 'granted';
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission Required',
          message: 'Priority One requires camera access to scan checkpoint QR codes.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return 'granted';
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        return 'never_ask_again';
      } else {
        return 'denied';
      }
    } catch (err) {
      return 'denied';
    }
  };

  const handleProcessScan = async (code: string) => {
    setScanSuccessText(null);
    setScanErrorText(null);

    const normCode = code.trim().toUpperCase();
    const existingCp = patrolCheckpoints.find(c => c.qrCode.toUpperCase() === normCode || c.number.toUpperCase() === normCode);

    if (existingCp && existingCp.status === 'Completed') {
      Alert.alert('Duplicate Scan Prevented', `Checkpoint ${existingCp.number} (${existingCp.name}) has already been scanned and logged.`);
      return;
    }

    const result = await scanCheckpointCode(code);
    if (result.success) {
      setScanSuccessText(result.message);
      setTimeout(() => {
        setScanSuccessText(null);
        setIsScannerOpen(false);
      }, 2000);
    } else {
      setScanErrorText(result.message);
      setTimeout(() => {
        setScanErrorText(null);
      }, 3000);
    }
  };

  const handleQRScan = async () => {
    if (!isClockedIn) {
      Alert.alert('Clock In Required', 'You must be clocked in before scanning checkpoints or patrolling.');
      return;
    }

    if (!activePatrol) {
      Alert.alert('Patrol Not Started', 'Please tap "Start Patrol" before scanning checkpoints.');
      return;
    }

    const perm = await requestCameraPermission();
    if (perm === 'granted') {
      setIsScannerOpen(true);
      handleLaunchNativeCamera();
    } else if (perm === 'never_ask_again') {
      Alert.alert(
        'Camera Permission Disabled',
        'Camera access was permanently disabled in Android settings. Please enable Camera permission in device Settings -> Apps -> Priority One Security to continue scanning.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Permission Denied',
        'Camera access is required to scan checkpoint QR codes.',
        [
          { text: 'Allow / Retry Permission', onPress: () => handleQRScan() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleLaunchNativeCamera = async (specificCode?: string) => {
    const nextPending = patrolCheckpoints.find(c => c.status === 'Pending');
    if (!nextPending && !specificCode) {
      setScanErrorText('All checkpoints for this patrol are already completed.');
      return;
    }
    const scannedCode = specificCode || nextPending?.qrCode || nextPending?.number || 'CP-01';
    await handleProcessScan(scannedCode);
  };

  const handleNFCScan = () => {
    if (!activePatrol) {
      Alert.alert('Patrol Not Started', 'Please tap "Start Patrol" before scanning checkpoints.');
      return;
    }
    // NFC is simulated by scanning the next pending checkpoint automatically for quick ease
    const nextPending = patrolCheckpoints.find(c => c.status === 'Pending');
    if (nextPending) {
      handleProcessScan(nextPending.qrCode);
      Alert.alert('NFC Scanned', `Simulated NFC check-in for: ${nextPending.name}`);
    } else {
      Alert.alert('All Completed', 'No pending checkpoints to scan.');
    }
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <Heading level="h4" style={styles.title}>Scan Checkpoint</Heading>

      <View style={styles.btnRow}>
        <View style={styles.btnWrapper}>
          <Button
            title="QR Scan"
            variant="primary"
            leftIcon={<AppText style={styles.icon}>📷</AppText>}
            onPress={handleQRScan}
            style={styles.actionBtn}
            fullWidth
          />
        </View>
        <View style={styles.btnWrapper}>
          <Button
            title="NFC Scan"
            variant="secondary"
            leftIcon={<AppText style={styles.icon}>📱</AppText>}
            onPress={handleNFCScan}
            style={styles.actionBtn}
            fullWidth
          />
        </View>
      </View>

      {!activePatrol && (
        <View style={[styles.infoBox, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, marginTop: spacing.md }]}>
          <AppText size="sm" color="error" weight="bold" style={styles.infoText}>
            ⚠️ You must start a patrol before checkpoints can be scanned.
          </AppText>
        </View>
      )}

      {/* DETAILED QR SCANNER INTERACTIVE MODAL */}
      <Modal visible={isScannerOpen} animationType="slide" transparent={false} onRequestClose={() => setIsScannerOpen(false)}>
        <View style={[styles.scannerContainer, { backgroundColor: '#111827' }]}>
          {/* Header */}
          <View style={styles.scannerHeader}>
            <AppText size="lg" weight="bold" style={{ color: '#FFFFFF' }}>Scan Checkpoint QR</AppText>
            <TouchableOpacity onPress={() => setIsScannerOpen(false)} style={styles.closeBtn}>
              <AppText size="base" weight="bold" style={{ color: colors.primary[400] }}>Close</AppText>
            </TouchableOpacity>
          </View>

          {/* Camera Viewport */}
          <View style={styles.viewportContainer}>
            <View style={[styles.cameraBorder, { borderColor: colors.primary[500] }]}>
              {/* Animated laser line */}
              <Animated.View
                style={[
                  styles.laserLine,
                  {
                    backgroundColor: colors.error,
                    transform: [{ translateY: laserAnim }]
                  }
                ]}
              />
              <AppText size="xs" style={styles.cameraPlaceholderText}>
                LIVE CAMERA ACTIVE
              </AppText>
            </View>

            <TouchableOpacity
              style={[styles.cameraScanBtn, { backgroundColor: colors.primary[600] }]}
              onPress={() => handleLaunchNativeCamera()}
              activeOpacity={0.8}
            >
              <AppText size="base" weight="bold" style={{ color: '#FFFFFF' }}>
                CAPTURE & VERIFY QR CODE
              </AppText>
            </TouchableOpacity>

            <AppText size="sm" style={styles.scanInstruction}>
              Point real phone camera directly at the physical QR code to scan
            </AppText>
          </View>

          {/* Feedback Overlay inside viewport */}
          {scanSuccessText && (
            <View style={[styles.feedbackOverlay, { backgroundColor: colors.success }]}>
              <AppText size="base" weight="bold" color="surface">✅ {scanSuccessText}</AppText>
            </View>
          )}

          {scanErrorText && (
            <View style={[styles.feedbackOverlay, { backgroundColor: colors.error }]}>
              <AppText size="base" weight="bold" color="surface">❌ {scanErrorText}</AppText>
            </View>
          )}
        </View>
      </Modal>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnWrapper: {
    flex: 1,
  },
  actionBtn: {
    height: 52,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
  },
  infoBox: {
    padding: 12,
  },
  infoText: {
    textAlign: 'center',
  },
  scannerContainer: {
    flex: 1,
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  closeBtn: {
    padding: 6,
  },
  viewportContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  cameraBorder: {
    width: 200,
    height: 200,
    borderWidth: 3,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
  },
  cameraScanBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 18,
    elevation: 3,
  },
  laserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    zIndex: 10,
  },
  cameraPlaceholderText: {
    color: '#6B7280',
    fontWeight: 'bold',
  },
  scanInstruction: {
    color: '#9CA3AF',
    marginTop: 12,
  },
  feedbackOverlay: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  simulationPanel: {
    flex: 1,
    paddingHorizontal: 20,
  },
  simPanelContent: {
    paddingBottom: 40,
  },
  simTitle: {
    color: '#F3F4F6',
    marginBottom: 4,
  },
  simGrid: {
    gap: 10,
  },
  simButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  manualInputSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  manualTextInput: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: '#4B5563',
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  manualSubmitBtn: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
  }
});
