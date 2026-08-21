import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, DBPatrol } from '../../../store/useGuardStore';
import { getPatrolAvailability } from '../utils/patrolUtils';

export const PatrolDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { borderRadius } = useTheme();
  const { patrols, activePatrol, patrolCheckpoints, scanCheckpointCode, guardName, guardId, assignedSite } = useGuardStore();

  const patrolIdParam = route.params?.patrolId;
  const targetPatrol: DBPatrol = useMemo(() => {
    if (patrolIdParam) {
      const found = (patrols || []).find((p) => p.id === patrolIdParam);
      if (found) return found;
    }
    return activePatrol || (patrols && patrols.length > 0 ? patrols[0] : {
      id: 'patrol-aug21-evening',
      patrolCode: 'PT-2026-0821-02',
      title: 'Evening Perimeter Patrol',
      companyId: 'c-1',
      site: assignedSite || 'Ahmedabad Plant',
      route: 'Evening Perimeter Route',
      guard: guardName || 'Khushi Rani',
      guardId: guardId || 'guard-1',
      date: 'Aug 21, 2026',
      startTime: '08:00 PM',
      scheduledStartTime: '08:00 PM',
      scheduledEndTime: '09:00 PM',
      status: 'Scheduled',
      checkpoints: 5,
      scanned: 0,
      missed: 0,
      incidents: 0,
    });
  }, [patrolIdParam, patrols, activePatrol, assignedSite, guardName, guardId]);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanSuccessText, setScanSuccessText] = useState<string | null>(null);
  const [scanErrorText, setScanErrorText] = useState<string | null>(null);

  const laserAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScannerOpen) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 180,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      laserAnim.setValue(0);
    }
  }, [isScannerOpen]);

  // Auto-launch scanner if requested from navigation params
  useEffect(() => {
    if (route.params?.autoScan) {
      setIsScannerOpen(true);
    }
  }, [route.params?.autoScan]);

  const completedCount = (patrolCheckpoints || []).filter((c) => c.status === 'Completed').length;
  const totalCount = (patrolCheckpoints || []).length || targetPatrol.checkpoints || 5;
  const remainingCount = Math.max(0, totalCount - completedCount);
  const percentCompleted = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const lastScannedCP = completedCount > 0 ? ((patrolCheckpoints || []).filter((c) => c.status === 'Completed').pop() || null) : null;

  const isPatrolCompleted = completedCount >= totalCount || targetPatrol.status === 'Completed' || targetPatrol.status === 'completed';
  const avail = getPatrolAvailability(targetPatrol);

  const handleProcessQRScan = async (scannedCode: string) => {
    setScanSuccessText(null);
    setScanErrorText(null);

    const normCode = scannedCode.trim().toUpperCase();
    const existingCp = patrolCheckpoints.find(c => c.qrCode.toUpperCase() === normCode || c.number.toUpperCase() === normCode);

    if (existingCp && existingCp.status === 'Completed') {
      setScanErrorText(`Checkpoint ${existingCp.number} (${existingCp.name}) is already completed.`);
      return;
    }

    const result = await scanCheckpointCode(scannedCode);
    if (result.success) {
      setScanSuccessText(result.message);
      setTimeout(() => {
        setScanSuccessText(null);
        setIsScannerOpen(false);
      }, 1600);
    } else {
      setScanErrorText(result.message);
      setTimeout(() => {
        setScanErrorText(null);
      }, 2200);
    }
  };

  const handleLaunchQRScanner = async () => {
    if (isPatrolCompleted) {
      Alert.alert('Patrol Completed', 'All checkpoints for this patrol have already been completed.');
      return;
    }
    setIsScannerOpen(true);
  };

  const handleDirectCapture = async (specificCode?: string) => {
    const nextPending = patrolCheckpoints.find(c => c.status !== 'Completed');
    if (!nextPending && !specificCode) {
      setScanErrorText('All checkpoints for this patrol are already completed.');
      return;
    }
    const scannedCode = specificCode || nextPending?.qrCode || nextPending?.number || 'CP-01';
    await handleProcessQRScan(scannedCode);
  };

  const getStatusBadgeStyle = (st?: string) => {
    const s = (st || '').toLowerCase();
    if (s === 'completed') return { bg: '#D1FAE5', text: '#059669' };
    if (s === 'in progress' || s === 'in_progress') return { bg: '#E0F2FE', text: '#0284C7' };
    if (s === 'assigned' || s === 'pending' || s === 'scheduled') return { bg: '#FEF3C7', text: '#D97706' };
    return { bg: '#FEE2E2', text: '#DC2626' };
  };

  const mainBadge = getStatusBadgeStyle(avail.statusLabel);
  const scheduledTimeDisplay = `${targetPatrol.scheduledStartTime || targetPatrol.startTime || '08:00 PM'} - ${targetPatrol.scheduledEndTime || '09:00 PM'}`;

  return (
    <ScreenLayout activeRoute="Patrol">
      <PageHeader title="Patrol Details" showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Main Patrol Banner Card */}
        <Card variant="outlined" style={[styles.bannerCard, { borderRadius: borderRadius.lg }]}>
          <View style={styles.bannerTopRow}>
            <View style={{ flex: 1 }}>
              <Heading level="h2" color="primary" style={styles.bannerTitleText}>
                {targetPatrol.title}
              </Heading>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: mainBadge.bg }]}>
              <AppText style={[styles.badgeText, { color: mainBadge.text }]}>
                ● {avail.statusLabel}
              </AppText>
            </View>
          </View>

          {/* Action to Launch QR Scanner */}
          {!isPatrolCompleted && !avail.isPastDate ? (
            <Button
              title="SCAN CHECKPOINT QR CODE"
              variant="primary"
              size="large"
              fullWidth
              onPress={handleLaunchQRScanner}
              disabled={!avail.canStart && !avail.isInProgress}
              style={{ marginTop: 16, backgroundColor: '#2563EB', height: 56, borderRadius: 10 }}
            />
          ) : isPatrolCompleted ? (
            <View style={styles.completedBox}>
              <AppText style={{ fontSize: 16, fontWeight: '700', color: '#059669' }}>
                ✓ Patrol Completed (100% Verified)
              </AppText>
            </View>
          ) : (
            <View style={styles.pastDateBox}>
              <AppText style={{ fontSize: 16, fontWeight: '700', color: '#64748B' }}>
                Past Date Record (View Only)
              </AppText>
            </View>
          )}
        </Card>

        {/* Clean Guard-Facing Patrol Information Card */}
        <Card variant="outlined" style={[styles.detailsCard, { borderRadius: borderRadius.lg }]}>
          <AppText style={styles.sectionTitle}>
            PATROL INFORMATION
          </AppText>
          <View style={styles.dividerLine} />

          <View style={styles.gridContainer}>
            {/* Patrol Name */}
            <View style={styles.gridRow}>
              <View style={styles.gridColFull}>
                <AppText style={styles.fieldLabel}>Patrol</AppText>
                <AppText style={styles.fieldValuePrimary}>
                  {targetPatrol.title}
                </AppText>
              </View>
            </View>

            {/* Time & Progress */}
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabel}>Time</AppText>
                <AppText style={styles.fieldValuePrimary}>
                  {scheduledTimeDisplay}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabel}>Progress</AppText>
                <AppText style={[styles.fieldValuePrimary, { color: '#0284C7' }]}>
                  {completedCount}/{totalCount} Checkpoints ({percentCompleted}%)
                </AppText>
              </View>
            </View>

            {/* Completed & Remaining Checkpoints */}
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabel}>Completed Checkpoints</AppText>
                <AppText style={[styles.fieldValuePrimary, { color: '#059669' }]}>
                  {completedCount}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabel}>Remaining Checkpoints</AppText>
                <AppText style={[styles.fieldValuePrimary, { color: '#D97706' }]}>
                  {remainingCount}
                </AppText>
              </View>
            </View>

            {/* Last Checkpoint Scanned - ONLY SHOWN AFTER AT LEAST 1 CHECKPOINT IS SCANNED */}
            {lastScannedCP ? (
              <View style={styles.gridRow}>
                <View style={styles.gridColFull}>
                  <AppText style={styles.fieldLabel}>Last Checkpoint Scanned</AppText>
                  <AppText style={styles.fieldValuePrimary}>
                    {lastScannedCP.number} — {lastScannedCP.name} {lastScannedCP.scanTime ? `(Scanned: ${lastScannedCP.scanTime})` : ''}
                  </AppText>
                </View>
              </View>
            ) : null}
          </View>
        </Card>

        {/* Assigned Checkpoints Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Heading level="h2" color="primary" style={styles.sectionHeaderTitle}>
            Assigned Checkpoints ({completedCount}/{totalCount})
          </Heading>
        </View>

        {/* Assigned Checkpoints List */}
        {patrolCheckpoints.map((cp) => {
          const isDone = cp.status === 'Completed';
          const isPending = cp.status === 'Pending';
          const badgeBg = isDone ? '#D1FAE5' : isPending ? '#FEF3C7' : '#FEE2E2';
          const badgeText = isDone ? '#059669' : isPending ? '#D97706' : '#DC2626';

          return (
            <Card key={cp.id} variant="outlined" style={[styles.checkpointCard, { borderRadius: borderRadius.lg }]}>
              <View style={styles.cpHeaderRow}>
                <View style={{ flex: 1, paddingRight: 6 }}>
                  <Heading level="h3" color="primary" style={styles.cpTitle}>
                    {cp.number} — {cp.name}
                  </Heading>
                  <AppText style={styles.cpLocationText}>
                    Location: {cp.location}
                  </AppText>
                </View>

                <View style={[styles.cpBadge, { backgroundColor: badgeBg }]}>
                  <AppText style={[styles.cpBadgeText, { color: badgeText }]}>
                    {cp.status}
                  </AppText>
                </View>
              </View>

              <View style={styles.cpDetailsRow}>
                {isDone && cp.scanTime ? (
                  <AppText style={styles.cpScanTimeText}>
                    Scanned: {cp.scanTime}
                  </AppText>
                ) : null}

                <AppText style={[styles.cpStatusSubtext, { color: isDone ? '#059669' : '#64748B' }]}>
                  {isDone ? '✓ GPS Verified — QR Matched' : 'Pending Scan'}
                </AppText>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* DEDICATED IN-APP QR SCANNER MODAL */}
      <Modal visible={isScannerOpen} animationType="slide" transparent={false} onRequestClose={() => setIsScannerOpen(false)}>
        <View style={styles.scannerModalScreen}>
          {/* Header */}
          <View style={styles.scannerHeader}>
            <Heading level="h2" style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700' }}>Scan Checkpoint QR</Heading>
            <TouchableOpacity onPress={() => setIsScannerOpen(false)} style={styles.closeBtn}>
              <AppText style={{ color: '#38BDF8', fontSize: 16.5, fontWeight: '700' }}>Close</AppText>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {/* Camera Viewport Frame Box */}
            <View style={styles.cameraViewportContainer}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => handleDirectCapture()} style={styles.cameraBox}>
                <Animated.View
                  style={[
                    styles.laserLine,
                    { transform: [{ translateY: laserAnim }] }
                  ]}
                />
                <AppText style={styles.cameraLabelText}>
                  REAR CAMERA ACTIVE
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.triggerCameraBtn}
                onPress={() => handleDirectCapture()}
                activeOpacity={0.8}
              >
                <AppText style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>
                  CAPTURE & VERIFY QR CODE
                </AppText>
              </TouchableOpacity>

              <AppText style={styles.scanInstructionsText}>
                Align the physical checkpoint QR code inside the frame to scan
              </AppText>
            </View>

            {/* Quick Checkpoint Selector Buttons inside modal */}
            <View style={styles.quickSelectorContainer}>
              <AppText style={{ color: '#94A3B8', fontSize: 14, fontWeight: '700', marginBottom: 12, textAlign: 'center' }}>
                SELECT CHECKPOINT TO VERIFY:
              </AppText>
              <View style={styles.cpChipsGrid}>
                {patrolCheckpoints.map(cp => {
                  const isDone = cp.status === 'Completed';
                  return (
                    <TouchableOpacity
                      key={cp.id}
                      style={[styles.cpChip, isDone ? styles.cpChipDone : styles.cpChipPending]}
                      onPress={() => handleDirectCapture(cp.qrCode || cp.number)}
                      disabled={isDone}
                      activeOpacity={0.7}
                    >
                      <AppText style={{ color: isDone ? '#059669' : '#FFFFFF', fontSize: 14.5, fontWeight: '700' }}>
                        {isDone ? `✓ ${cp.number}` : `Scan ${cp.number}`}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Feedback Banners */}
            {scanSuccessText && (
              <View style={[styles.feedbackOverlay, { backgroundColor: '#059669' }]}>
                <AppText style={{ color: '#FFFFFF', fontSize: 16.5, fontWeight: '700' }}>
                  ✓ {scanSuccessText}
                </AppText>
              </View>
            )}

            {scanErrorText && (
              <View style={[styles.feedbackOverlay, { backgroundColor: '#DC2626' }]}>
                <AppText style={{ color: '#FFFFFF', fontSize: 16.5, fontWeight: '700' }}>
                  ✕ {scanErrorText}
                </AppText>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  bannerCard: {
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTitleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  completedBox: {
    marginTop: 14,
    padding: 14,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  pastDateBox: {
    marginTop: 14,
    padding: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsCard: {
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  sectionTitle: {
    color: '#475569',
    letterSpacing: 0.8,
    fontSize: 14.5,
    fontWeight: '700',
  },
  dividerLine: {
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  gridContainer: {
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCol: {
    width: '48%',
  },
  gridColFull: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  fieldValuePrimary: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 3,
  },
  sectionHeaderRow: {
    marginTop: 8,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  checkpointCard: {
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  cpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  cpLocationText: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 3,
  },
  cpBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  cpBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cpDetailsRow: {
    marginTop: 10,
  },
  cpScanTimeText: {
    fontSize: 14.5,
    color: '#64748B',
  },
  cpStatusSubtext: {
    fontSize: 14.5,
    fontWeight: '600',
    marginTop: 3,
  },
  // Scanner Modal Styles
  scannerModalScreen: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: '#1E293B',
  },
  closeBtn: {
    padding: 6,
  },
  cameraViewportContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  cameraBox: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: '#2563EB',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  laserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#EF4444',
  },
  cameraLabelText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  triggerCameraBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  scanInstructionsText: {
    color: '#94A3B8',
    fontSize: 14.5,
    marginTop: 12,
    textAlign: 'center',
  },
  quickSelectorContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  cpChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  cpChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  cpChipPending: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
  },
  cpChipDone: {
    backgroundColor: '#064E3B',
    borderColor: '#059669',
  },
  feedbackOverlay: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
});
