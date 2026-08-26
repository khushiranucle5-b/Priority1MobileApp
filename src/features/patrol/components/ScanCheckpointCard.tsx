import React, { useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

export const ScanCheckpointCard: React.FC = () => {
  const navigation = useNavigation<any>();
  const { spacing, colors, borderRadius } = useTheme();
  const { scanCheckpointCode, activePatrol, patrolCheckpointsMap, isClockedIn } = useGuardStore();

  const patrolCheckpoints = useMemo(() => {
    if (!activePatrol?.id) return [];
    return patrolCheckpointsMap[activePatrol.id] || [];
  }, [patrolCheckpointsMap, activePatrol?.id]);

  const handleProcessScan = async (code: string) => {
    const normCode = code.trim().toUpperCase();
    const existingCp = patrolCheckpoints.find(c => c.qrCode.toUpperCase() === normCode || c.number.toUpperCase() === normCode);

    if (existingCp && existingCp.status === 'Completed') {
      Alert.alert('Duplicate Scan Prevented', `Checkpoint ${existingCp.number} (${existingCp.name}) has already been scanned and logged.`);
      return;
    }

    const result = await scanCheckpointCode(code, activePatrol?.id);
    if (result.success) {
      Alert.alert('✓ Checkpoint Verified', result.message || 'Checkpoint scanned successfully.');
    } else {
      Alert.alert('Scan Result', result.message || 'Could not verify checkpoint.');
    }
  };

  const handleQRScan = () => {
    if (!isClockedIn) {
      Alert.alert('Clock In Required', 'You must be clocked in before scanning checkpoints or patrolling.');
      return;
    }

    if (!activePatrol) {
      Alert.alert('Patrol Not Started', 'Please tap "Start Patrol" before scanning checkpoints.');
      return;
    }

    navigation.navigate('PatrolDetails', { patrol: activePatrol, autoScan: true });
  };

  const handleNFCScan = () => {
    if (!activePatrol) {
      Alert.alert('Patrol Not Started', 'Please tap "Start Patrol" before scanning checkpoints.');
      return;
    }
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
