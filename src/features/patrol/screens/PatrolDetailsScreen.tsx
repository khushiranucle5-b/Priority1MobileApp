import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  TextInput,
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
import { NavIcon } from '../../../components/NavIcon';

export interface PatrolCheckpointItem {
  id: string;
  number: string;
  name: string;
  location: string;
  scheduledTime: string;
  status: 'Completed' | 'Pending' | 'Missed';
  scanTime?: string;
  verificationStatus?: string;
  qrCode: string;
}

export const PatrolDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { patrols, guardName, guardId, assignedSite } = useGuardStore();

  const patrolId = route.params?.patrolId || 'PT-2026-001';

  // Resolve target patrol
  const patrol: DBPatrol = useMemo(() => {
    const found = (patrols || []).find(
      (p: any) => p.id === patrolId || p.patrolCode === patrolId
    );
    if (found) {
      return {
        id: found.id,
        patrolCode: (found as any).patrolCode || found.id,
        title: (found as any).title || (found as any).patrolName || 'Night Perimeter Patrol',
        companyId: found.companyId || 'c-1',
        site: found.site || assignedSite || 'Ahmedabad Plant',
        route: (found as any).route || 'Night Perimeter Patrol Route',
        guard: found.guard || guardName || 'John Smith',
        guardId: found.guardId || guardId || 'G-1001',
        date: found.date || 'Aug 19, 2026',
        startTime: found.startTime || '10:05 PM',
        endTime: found.endTime,
        status: found.status === 'in_progress' ? 'In Progress' : found.status === 'completed' ? 'Completed' : found.status || 'In Progress',
        checkpoints: found.checkpoints || 5,
        scanned: found.scanned || 4,
        missed: found.missed || 0,
        incidents: found.incidents || 0,
        lastCheckpoint: (found as any).lastCheckpoint || 'Warehouse Entrance',
      };
    }

    return {
      id: patrolId,
      patrolCode: patrolId,
      title: 'Night Perimeter Patrol',
      companyId: 'c-1',
      site: assignedSite || 'Ahmedabad Plant',
      route: 'Night Perimeter Patrol Route',
      guard: guardName || 'John Smith',
      guardId: guardId || 'G-1001',
      date: 'Aug 19, 2026',
      startTime: '10:05 PM',
      endTime: undefined,
      status: 'In Progress',
      checkpoints: 5,
      scanned: 4,
      missed: 0,
      incidents: 0,
      lastCheckpoint: 'Warehouse Entrance',
    };
  }, [patrols, patrolId, assignedSite, guardName, guardId]);

  // Initial checkpoints list
  const [checkpointsList, setCheckpointsList] = useState<PatrolCheckpointItem[]>([
    {
      id: 'cp-01',
      number: 'CP-01',
      name: 'CP-01 — Main Gate',
      location: 'Entrance',
      scheduledTime: '09:15 AM',
      status: 'Completed',
      scanTime: '09:15 AM',
      verificationStatus: 'QR Code Verified — Entrance Gate',
      qrCode: 'CP-01',
    },
    {
      id: 'cp-02',
      number: 'CP-02',
      name: 'CP-02 — Reception Lobby',
      location: 'Tower A',
      scheduledTime: '09:30 AM',
      status: 'Completed',
      scanTime: '09:30 AM',
      verificationStatus: 'QR Code Verified — Lobby Desk',
      qrCode: 'CP-02',
    },
    {
      id: 'cp-03',
      number: 'CP-03',
      name: 'CP-03 — Parking Level 1',
      location: 'Basement',
      scheduledTime: '09:45 AM',
      status: 'Completed',
      scanTime: '09:45 AM',
      verificationStatus: 'NFC Verified — Basement Gate',
      qrCode: 'CP-03',
    },
    {
      id: 'cp-04',
      number: 'CP-04',
      name: 'CP-04 — Warehouse Entrance',
      location: 'South Yard',
      scheduledTime: '10:05 PM',
      status: 'Completed',
      scanTime: '10:05 PM',
      verificationStatus: 'GPS Verified — Inside Radius',
      qrCode: 'CP-04',
    },
    {
      id: 'cp-05',
      number: 'CP-05',
      name: 'CP-05 — Emergency Exit B',
      location: 'Rear Gate',
      scheduledTime: '10:15 PM',
      status: patrol.status === 'Completed' ? 'Completed' : 'Pending',
      scanTime: patrol.status === 'Completed' ? '10:15 PM' : undefined,
      verificationStatus: patrol.status === 'Completed' ? 'QR Code Verified — Exit B' : 'Pending Scan',
      qrCode: 'CP-05',
    },
  ]);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanSuccessText, setScanSuccessText] = useState<string | null>(null);
  const [selectedCpId, setSelectedCpId] = useState<string | null>(null);

  // Animated laser scan line for camera view
  const laserAnim = useRef(new Animated.Value(0)).current;

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

  const completedCount = useMemo(() => {
    return checkpointsList.filter((c) => c.status === 'Completed').length;
  }, [checkpointsList]);

  const remainingCount = useMemo(() => {
    return checkpointsList.filter((c) => c.status === 'Pending').length;
  }, [checkpointsList]);

  const nextPendingCp = useMemo(() => {
    return checkpointsList.find((c) => c.status === 'Pending') || null;
  }, [checkpointsList]);

  const handleOpenScanner = (cpId?: string) => {
    setSelectedCpId(cpId || nextPendingCp?.id || null);
    setIsScannerOpen(true);
  };

  const handleProcessScan = (codeToVerify: string) => {
    const code = codeToVerify.trim().toUpperCase();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Match by specific selected CP or next pending CP or code string
    let targetCp = checkpointsList.find((c) => c.id === selectedCpId);
    if (!targetCp) {
      targetCp = checkpointsList.find((c) => c.qrCode.toUpperCase() === code || c.number.toUpperCase() === code);
    }
    if (!targetCp) {
      targetCp = nextPendingCp || checkpointsList[checkpointsList.length - 1];
    }

    if (targetCp) {
      setCheckpointsList((prev) =>
        prev.map((c) =>
          c.id === targetCp!.id
            ? {
                ...c,
                status: 'Completed',
                scanTime: nowTime,
                verificationStatus: `QR Code Verified — ${c.location}`,
              }
            : c
        )
      );

      setScanSuccessText(`✓ Scanned & Verified: ${targetCp.name}`);
      setTimeout(() => {
        setScanSuccessText(null);
        setIsScannerOpen(false);
        setManualCode('');
        Alert.alert(
          'Checkpoint Verified',
          `QR Code scanned successfully!\n${targetCp!.name}\nLocation: ${targetCp!.location}\nTime: ${nowTime}`
        );
      }, 1200);
    }
  };

  const getStatusBadgeStyle = (st?: string) => {
    const s = (st || '').toLowerCase();
    if (s === 'completed') return { bg: '#D1FAE5', text: '#059669' };
    if (s === 'in progress' || s === 'in_progress') return { bg: '#E0F2FE', text: '#0284C7' };
    if (s === 'assigned' || s === 'pending') return { bg: '#FEF3C7', text: '#D97706' };
    return { bg: '#FEE2E2', text: '#DC2626' };
  };

  const mainBadge = getStatusBadgeStyle(completedCount === checkpointsList.length ? 'Completed' : patrol.status);

  return (
    <ScreenLayout activeRoute="Patrol">
      <PageHeader title="Patrol Details" showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Main Patrol Banner Card */}
        <Card style={styles.bannerCard}>
          <View style={styles.bannerTopRow}>
            <View style={{ flex: 1 }}>
              <AppText size="xs" color="secondary" weight="semibold">PATROL DETAILS</AppText>
              <Heading level="h2" color="primary" style={{ marginTop: 2 }}>
                {patrol.title}
              </Heading>
              <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                ID: {patrol.patrolCode || patrol.id} • {patrol.site}
              </AppText>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: mainBadge.bg }]}>
              <AppText size="xs" weight="bold" style={{ color: mainBadge.text }}>
                ● {completedCount === checkpointsList.length ? 'Completed' : patrol.status}
              </AppText>
            </View>
          </View>

          {/* Action to Launch QR Scanner if Checkpoints Pending */}
          {remainingCount > 0 && (
            <Button
              title="📷 SCAN CHECKPOINT QR CODE"
              variant="primary"
              size="large"
              fullWidth
              onPress={() => handleOpenScanner()}
              style={{ marginTop: 14, backgroundColor: '#4F46E5', height: 50 }}
            />
          )}
        </Card>

        {/* Detailed Grid Card */}
        <Card style={styles.detailsCard}>
          <AppText size="xs" weight="bold" style={styles.sectionTitle}>
            PATROL INFORMATION
          </AppText>
          <View style={styles.dividerLine} />

          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Patrol Name</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                  {patrol.title}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Patrol ID</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                  {patrol.patrolCode || patrol.id}
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Site</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                  {patrol.site}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Route</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                  {patrol.route || 'Perimeter Route'}
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Started</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                  {patrol.startTime}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Progress</AppText>
                <AppText size="sm" weight="bold" style={{ color: '#0284C7', marginTop: 2 }}>
                  {completedCount} / {checkpointsList.length} Checkpoints
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Completed Checkpoints</AppText>
                <AppText size="sm" weight="bold" style={{ color: '#059669', marginTop: 2 }}>
                  {completedCount}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Remaining Checkpoints</AppText>
                <AppText size="sm" weight="bold" style={{ color: '#D97706', marginTop: 2 }}>
                  {remainingCount}
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridColFull}>
                <AppText size="xs" color="secondary">Last Checkpoint Scanned</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                  {checkpointsList.filter((c) => c.status === 'Completed').pop()?.name || patrol.lastCheckpoint || 'Main Gate'}
                </AppText>
              </View>
            </View>
          </View>
        </Card>

        {/* Checkpoints Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Heading level="h4">Assigned Checkpoints</Heading>
          <AppText size="xs" color="secondary" weight="bold">
            ({completedCount}/{checkpointsList.length})
          </AppText>
        </View>

        {/* Checkpoints List */}
        {checkpointsList.map((cp) => {
          const isDone = cp.status === 'Completed';
          const isPending = cp.status === 'Pending';
          const badgeBg = isDone ? '#D1FAE5' : isPending ? '#FEF3C7' : '#FEE2E2';
          const badgeText = isDone ? '#059669' : isPending ? '#D97706' : '#DC2626';

          return (
            <Card key={cp.id} style={styles.checkpointCard}>
              <View style={styles.cpHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Heading level="h4" color="primary">
                    {cp.name}
                  </Heading>
                  <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                    Location: {cp.location}
                  </AppText>
                </View>

                <View style={[styles.cpBadge, { backgroundColor: badgeBg }]}>
                  <AppText size="xs" weight="bold" style={{ color: badgeText }}>
                    {cp.status}
                  </AppText>
                </View>
              </View>

              <View style={styles.cpDetailsRow}>
                <AppText size="xs" color="secondary">
                  Scheduled: {cp.scheduledTime}
                  {cp.scanTime ? ` • Scanned: ${cp.scanTime}` : ''}
                </AppText>

                {cp.verificationStatus ? (
                  <AppText size="xs" weight="semibold" style={{ color: isDone ? '#059669' : '#64748B', marginTop: 4 }}>
                    {cp.verificationStatus}
                  </AppText>
                ) : null}
              </View>

              {isPending && (
                <Button
                  title="📷 Scan QR Code for Checkpoint"
                  variant="primary"
                  size="small"
                  fullWidth
                  onPress={() => handleOpenScanner(cp.id)}
                  style={{ marginTop: 10, backgroundColor: '#0284C7' }}
                />
              )}
            </Card>
          );
        })}

        {/* Back Button */}
        <Button
          title="← Back to Patrol Logs"
          variant="outline"
          size="large"
          fullWidth
          onPress={() => navigation.goBack()}
          style={{ height: 50, marginTop: 8, borderColor: '#CBD5E1' }}
        />
      </ScrollView>

      {/* QR CODE CAMERA SCANNER MODAL */}
      <Modal
        visible={isScannerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsScannerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.scannerModalContent}>
            <Heading level="h3" color="primary" style={{ textAlign: 'center' }}>
              Scan Checkpoint QR Code
            </Heading>

            <AppText size="xs" color="secondary" style={{ textAlign: 'center', marginTop: 4, marginBottom: 16 }}>
              Align the physical QR code inside the frame to verify checkpoint scan
            </AppText>

            {/* Camera Viewport Simulation Frame with Red Scanning Laser */}
            <View style={styles.cameraViewport}>
              <View style={[styles.cornerBorder, styles.topLeft]} />
              <View style={[styles.cornerBorder, styles.topRight]} />
              <View style={[styles.cornerBorder, styles.bottomLeft]} />
              <View style={[styles.cornerBorder, styles.bottomRight]} />

              <Animated.View
                style={[
                  styles.laserLine,
                  {
                    transform: [{ translateY: laserAnim }],
                  },
                ]}
              />

              <AppText size="xs" weight="semibold" style={{ color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                📷 Camera Active
              </AppText>
            </View>

            {/* Scan Success Overlay Text */}
            {scanSuccessText ? (
              <View style={styles.successBox}>
                <AppText size="sm" weight="bold" style={{ color: '#059669', textAlign: 'center' }}>
                  {scanSuccessText}
                </AppText>
              </View>
            ) : null}

            {/* Manual QR Code Input Fallback */}
            <View style={{ width: '100%', marginTop: 14 }}>
              <AppText size="xs" color="secondary" style={{ marginBottom: 4 }}>
                Or enter QR code manually:
              </AppText>
              <View style={styles.manualCodeRow}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="e.g. CP-05 or CP-01"
                  placeholderTextColor="#94A3B8"
                  value={manualCode}
                  onChangeText={setManualCode}
                  autoCapitalize="characters"
                />
                <Button
                  title="Verify Code"
                  variant="primary"
                  size="small"
                  onPress={() => handleProcessScan(manualCode || nextPendingCp?.qrCode || 'CP-05')}
                  style={{ backgroundColor: '#4F46E5' }}
                />
              </View>
            </View>

            {/* Quick Simulate Scan Buttons */}
            <View style={{ width: '100%', gap: 8, marginTop: 14 }}>
              <Button
                title={`Simulate QR Scan (${nextPendingCp?.name || 'Next CP'})`}
                variant="primary"
                size="large"
                fullWidth
                onPress={() => handleProcessScan(nextPendingCp?.qrCode || 'CP-05')}
                style={{ backgroundColor: '#059669' }}
              />

              <Button
                title="Cancel / Close Scanner"
                variant="outline"
                size="large"
                fullWidth
                onPress={() => setIsScannerOpen(false)}
                style={{ borderColor: '#CBD5E1' }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  bannerCard: {
    padding: 18,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailsCard: {
    padding: 18,
  },
  sectionTitle: {
    color: '#64748B',
    letterSpacing: 0.5,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  gridContainer: {
    gap: 12,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  checkpointCard: {
    padding: 14,
  },
  cpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cpDetailsRow: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scannerModalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  cameraViewport: {
    width: 220,
    height: 200,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  laserLine: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  cornerBorder: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#4F46E5',
  },
  topLeft: {
    top: 10,
    left: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 10,
    right: 10,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  manualCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  successBox: {
    marginTop: 12,
    backgroundColor: '#D1FAE5',
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
});
