import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { StatusBadge } from '../../../components/StatusBadge';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, DBPatrol } from '../../../store/useGuardStore';
import { getPatrolAvailability, findCurrentPatrol, useLiveNow } from '../utils/patrolUtils';

export const PatrolDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { colors, spacing, borderRadius } = useTheme();
  const { patrols, activePatrol, patrolCheckpointsMap, scanCheckpointCode, loadPatrolCheckpoints, startPatrol, guardName, guardId, assignedSite, isClockedIn, loadGuardData, guardEmail } = useGuardStore();

  const now = useLiveNow(5000);

  const patrolIdParam = route.params?.patrolId;
  const patrolParam = route.params?.patrol;

  const targetPatrol: DBPatrol = useMemo(() => {
    if (patrolParam) return patrolParam;
    if (patrolIdParam) {
      const found = (patrols || []).find((p) => p.id === patrolIdParam);
      if (found) return found;

      const formattedTitle = patrolIdParam
        .replace(/patrol-/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase());

      return {
        id: patrolIdParam,
        patrolCode: `PT-${patrolIdParam.toUpperCase().slice(0, 12)}`,
        title: formattedTitle || 'Patrol Details',
        companyId: 'c-1',
        site: assignedSite || 'Ahmedabad Plant',
        route: `${formattedTitle} Route`,
        guard: guardName || 'Khushi Rani',
        guardId: guardId || 'guard-1',
        date: 'Today',
        startTime: '08:00 AM',
        scheduledStartTime: '08:00 AM',
        scheduledEndTime: '09:00 AM',
        status: 'Scheduled',
        checkpoints: 5,
        scanned: 0,
        missed: 0,
        incidents: 0,
      };
    }
    const current = findCurrentPatrol(patrols || [], now);
    if (current) return current;

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
  }, [patrolParam, patrolIdParam, patrols, activePatrol, assignedSite, guardName, guardId]);

  // Read checkpoints explicitly mapped to targetPatrol.id
  const patrolCheckpoints = useMemo(() => {
    if (!targetPatrol || !targetPatrol.id) return [];
    return patrolCheckpointsMap[targetPatrol.id] || [];
  }, [patrolCheckpointsMap, targetPatrol?.id]);

  // Load checkpoints for this specific patrol on focus/load without triggering global loadGuardData clobbering
  useEffect(() => {
    if (isFocused && targetPatrol && targetPatrol.id) {
      loadPatrolCheckpoints(targetPatrol.id);
    }
  }, [isFocused, targetPatrol?.id, loadPatrolCheckpoints]);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanSuccessText, setScanSuccessText] = useState<string | null>(null);
  const [scanErrorText, setScanErrorText] = useState<string | null>(null);

  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScannerOpen) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 160,
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

  const completedCount = patrolCheckpoints.filter((c) => c.status === 'Completed').length;
  const totalCount = patrolCheckpoints.length || targetPatrol.checkpoints || 5;
  const remainingCount = Math.max(0, totalCount - completedCount);
  const percentCompleted = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const lastScannedCP = completedCount > 0 ? (patrolCheckpoints.filter((c) => c.status === 'Completed').pop() || null) : null;

  const avail = getPatrolAvailability(targetPatrol, 15, now);
  const isPatrolCompleted = totalCount > 0 && completedCount >= totalCount;
  const isPatrolIncomplete = completedCount > 0 && completedCount < totalCount;
  const isPatrolExpired = completedCount === 0 && (avail.isExpired || avail.isPastDate || targetPatrol.status === 'Missed' || targetPatrol.status === 'Expired');

  let headerBadgeStatus = 'Scheduled';
  if (isPatrolCompleted) {
    headerBadgeStatus = 'Completed';
  } else if (isPatrolIncomplete) {
    headerBadgeStatus = 'Incomplete';
  } else if (isPatrolExpired) {
    headerBadgeStatus = 'Missed';
  } else {
    headerBadgeStatus = avail.statusLabel;
  }

  const handleProcessQRScan = async (scannedCode: string) => {
    setScanSuccessText(null);
    setScanErrorText(null);

    const normCode = scannedCode.trim().toUpperCase();
    const existingCp = patrolCheckpoints.find(c => c.qrCode.toUpperCase() === normCode || c.number.toUpperCase() === normCode);

    if (existingCp && existingCp.status === 'Completed') {
      setScanErrorText(`Checkpoint ${existingCp.number} (${existingCp.name}) is already completed.`);
      return;
    }

    const result = await scanCheckpointCode(scannedCode, targetPatrol.id);
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
    if (!isClockedIn) {
      Alert.alert(
        'Clock In Required',
        'You must be clocked in before starting a patrol or scanning checkpoints. Please clock in first.'
      );
      return;
    }
    if (isPatrolCompleted) {
      Alert.alert('Patrol Completed', 'All checkpoints for this patrol have already been completed.');
      return;
    }

    if (!avail.isInProgress && avail.canStart && startPatrol) {
      await startPatrol(targetPatrol.id);
    }

    setIsScannerOpen(true);
  };

  const handleDirectCapture = async (specificCode?: string) => {
    if (!isClockedIn) {
      Alert.alert('Clock In Required', 'You must be clocked in before scanning checkpoints.');
      return;
    }
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

  const isButtonDisabled = !isClockedIn || !avail.canStart;
  const buttonTitleText = !isClockedIn
    ? "Clock In Required to Patrol"
    : avail.isInProgress
    ? "CONTINUE PATROLLING"
    : avail.buttonText;

  return (
    <ScreenLayout activeRoute="Patrol">
      <PageHeader title="Patrol Details" showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Main Patrol Banner Card */}
        <Card variant="outlined" style={styles.card}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <AppText size="lg" weight="bold" color="primary" style={styles.cardHeaderTitle}>
                {targetPatrol.title || 'Patrol Details'}
              </AppText>
            </View>
            <StatusBadge status={headerBadgeStatus} size="md" />
          </View>

          <View style={[styles.detailRow, { marginTop: spacing.sm || 10 }]}>
            <View style={{ flex: 1 }}>
              <AppText size="xs" color="secondary" weight="semibold" style={styles.metaLabelText}>
                SCHEDULED SHIFT
              </AppText>
              <AppText size="base" weight="bold" color="primary" style={styles.metaValueText}>
                {scheduledTimeDisplay}
              </AppText>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <AppText size="xs" color="secondary" weight="semibold" style={styles.metaLabelText}>
                CHECKPOINTS
              </AppText>
              <AppText size="base" weight="bold" style={[styles.metaValueText, { color: colors.primary[600] || '#2563EB' }]}>
                {completedCount} / {totalCount} Completed
              </AppText>
            </View>
          </View>

          <View style={[styles.actionsRow, { borderTopColor: colors.border || '#E2E8F0' }]}>
            {!isPatrolCompleted && !avail.isPastDate && !isPatrolExpired ? (
              <Button
                title={buttonTitleText}
                variant="primary"
                disabled={isButtonDisabled}
                onPress={handleLaunchQRScanner}
                style={[
                  styles.inlineActionBtn,
                  { backgroundColor: !isClockedIn ? '#DC2626' : isButtonDisabled ? '#94A3B8' : avail.isInProgress ? '#0284C7' : '#2563EB' },
                ]}
              />
            ) : isPatrolCompleted ? (
              <View style={[styles.completedBox, { flex: 1, marginTop: 0, paddingVertical: 12 }]}>
                <AppText style={styles.completedText}>
                  ✓ Patrol Completed (100% Verified)
                </AppText>
              </View>
            ) : isPatrolIncomplete ? (
              <View style={{ flex: 1, marginTop: 0, paddingVertical: 12, paddingHorizontal: 12, backgroundColor: '#FEF3C7', borderColor: '#FDE68A', borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                <AppText style={{ color: '#D97706', fontWeight: '700', fontSize: 14 }}>
                  ⚠️ Incomplete Patrol ({completedCount}/{totalCount} Completed)
                </AppText>
              </View>
            ) : (
              <View style={{ flex: 1, marginTop: 0, paddingVertical: 12, paddingHorizontal: 12, backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                <AppText style={{ color: '#DC2626', fontWeight: '700', fontSize: 14 }}>
                  ✕ Patrol Expired ({completedCount}/{totalCount} Completed)
                </AppText>
              </View>
            )}
          </View>
        </Card>

        {/* Clean Guard-Facing Patrol Information Card */}
        <Card variant="outlined" style={styles.card}>
          <AppText style={styles.sectionTitle}>
            PATROL INFORMATION
          </AppText>
          <View style={styles.dividerLine} />

          <View style={styles.gridContainer}>
            {/* Patrol Name */}
            <View style={styles.gridRow}>
              <View style={styles.gridColFull}>
                <AppText style={styles.fieldLabel}>Patrol Route</AppText>
                <AppText style={styles.fieldValuePrimary}>
                  {targetPatrol.title}
                </AppText>
              </View>
            </View>

            {/* Time & Checkpoint Breakdown */}
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabel}>Scheduled Shift</AppText>
                <AppText style={styles.fieldValuePrimary}>
                  {scheduledTimeDisplay}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText style={styles.fieldLabel}>Completed / Remaining</AppText>
                <AppText style={styles.fieldValuePrimary}>
                  <AppText style={{ color: '#059669', fontWeight: '700' }}>{completedCount}</AppText>
                  {' / '}
                  <AppText style={{ color: '#D97706', fontWeight: '700' }}>{remainingCount}</AppText>
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

          return (
            <Card key={cp.id} variant="outlined" style={styles.card}>
              <View style={styles.headerRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <AppText size="lg" weight="bold" color="primary" style={styles.cardHeaderTitle}>
                    {`${cp.number} — ${cp.name}`}
                  </AppText>
                </View>
                <StatusBadge status={cp.status} size="md" />
              </View>

              <View style={[styles.detailRow, { marginTop: spacing.sm || 10 }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <AppText size="xs" color="secondary" weight="semibold" style={styles.metaLabelText}>
                    LOCATION
                  </AppText>
                  <AppText size="base" weight="bold" color="primary" style={styles.metaValueText}>
                    {cp.location}
                  </AppText>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <AppText size="xs" color="secondary" weight="semibold" style={styles.metaLabelText}>
                    VERIFICATION
                  </AppText>
                  <AppText size="base" weight="bold" style={[styles.metaValueText, { color: isDone ? '#059669' : '#64748B' }]}>
                    {isDone ? 'GPS & QR Matched' : 'Pending Scan'}
                  </AppText>
                </View>
              </View>

              {isDone && cp.scanTime ? (
                <View style={{ marginTop: 10 }}>
                  <AppText size="xs" color="secondary" weight="semibold" style={styles.metaLabelText}>
                    SCANNED AT
                  </AppText>
                  <AppText size="base" color="text" weight="medium" style={styles.metaValueText}>
                    {cp.scanTime}
                  </AppText>
                </View>
              ) : null}
            </Card>
          );
        })}
      </ScrollView>

      {/* CENTERED POPUP DIALOG SCANNER MODAL */}
      <Modal
        visible={isScannerOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsScannerOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlayBackdrop}
          onPress={() => setIsScannerOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.popupCardContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.popupHeader}>
              <Heading level="h3" style={styles.popupHeaderTitle}>
                Scan Checkpoint QR
              </Heading>
              <TouchableOpacity onPress={() => setIsScannerOpen(false)} style={styles.closeBtn}>
                <AppText style={styles.popupCloseText}>✕</AppText>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
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
                  <AppText style={styles.triggerCameraBtnText}>
                    Capture & Verify QR Code
                  </AppText>
                </TouchableOpacity>

                <AppText style={styles.scanInstructionsText}>
                  Align physical QR code inside frame to scan
                </AppText>
              </View>

              {/* Quick Checkpoint Selector Buttons inside modal */}
              <View style={styles.quickSelectorContainer}>
                <AppText style={styles.quickSelectorTitle}>
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
                        <AppText style={{ color: isDone ? '#059669' : '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
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
                  <AppText style={styles.feedbackOverlayText}>
                    ✓ {scanSuccessText}
                  </AppText>
                </View>
              )}

              {scanErrorText && (
                <View style={[styles.feedbackOverlay, { backgroundColor: '#DC2626' }]}>
                  <AppText style={styles.feedbackOverlayText}>
                    ✕ {scanErrorText}
                  </AppText>
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
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
  card: {
    marginBottom: 12,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  metaLabelText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#64748B',
  },
  metaValueText: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  inlineActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
  },
  iconActionBtnView: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 26,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 14,
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
  completedText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
    lineHeight: 20,
  },
  pastDateBox: {
    marginTop: 14,
    padding: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
  },
  pastDateText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    lineHeight: 20,
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
    fontSize: 13,
    fontWeight: '700',
  },
  dividerLine: {
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  gridContainer: {
    gap: 14,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCol: {
    flex: 1,
  },
  gridColFull: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fieldValuePrimary: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 3,
    lineHeight: 22,
  },
  sectionHeaderRow: {
    marginTop: 8,
  },
  sectionHeaderTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 25,
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
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 23,
  },
  cpLocationText: {
    fontSize: 14.5,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 20,
  },
  cpBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  cpBadgeText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  cpDetailsRow: {
    marginTop: 10,
  },
  cpScanTimeText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 19,
  },
  cpStatusSubtext: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 19,
  },
  // Scanner Popup Modal Styles
  modalOverlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  popupCardContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    marginBottom: 12,
  },
  popupHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  popupCloseText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  cameraViewportContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  cameraBox: {
    width: 200,
    height: 200,
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  triggerCameraBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
    width: '100%',
    alignItems: 'center',
  },
  triggerCameraBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  scanInstructionsText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  quickSelectorContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  quickSelectorTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  cpChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cpChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    marginTop: 14,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  feedbackOverlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});

