import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';
import { soundAlertService } from '../../../services/soundAlert.service';

interface LoneWorkerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LoneWorkerModal: React.FC<LoneWorkerModalProps> = ({ visible, onClose }) => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { loneWorker, checkInLoneWorker, isClockedIn, closeLoneWorkerModal } = useGuardStore();
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const elapsedMs = loneWorker.lastCheckInTimestamp ? nowMs - loneWorker.lastCheckInTimestamp : 0;

  const getStatusInfo = () => {
    if (!isClockedIn) {
      return { label: 'NOT ACTIVE', color: '#94A3B8', bg: '#F1F5F9' };
    }
    if (elapsedMs >= 45 * 60 * 1000 || loneWorker.status === 'OVERDUE') {
      return { label: 'OVERDUE', color: '#DC2626', bg: '#FEE2E2' };
    }
    if (elapsedMs >= 30 * 60 * 1000 || loneWorker.status === 'CHECK REQUIRED' || loneWorker.isModalOpen) {
      return { label: 'CHECK REQUIRED', color: '#D97706', bg: '#FEF3C7' };
    }
    return { label: 'SAFE', color: '#059669', bg: '#D1FAE5' };
  };

  const statusInfo = getStatusInfo();

  // SAFE CHECKED action
  const handleSafeCheckIn = () => {
    soundAlertService.stopSafetyAlert();
    checkInLoneWorker({ status: 'Safe' });
    closeLoneWorkerModal();
    onClose();
  };

  // REPORT ISSUE / SOS action
  const handleReportIssue = () => {
    soundAlertService.stopSafetyAlert();
    checkInLoneWorker({ status: 'SOS / Issue Reported' });
    closeLoneWorkerModal();
    onClose();
    navigation.navigate('Incident');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => {
        // Mandatory non-dismissible popup: do nothing on back press
      }}
    >
      <View style={styles.overlay}>
        {/* Non-interactive backdrop: Tapping outside will NOT dismiss */}
        <View style={styles.backdrop} />

        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Header (No X / Close Button) */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={{ marginRight: 8 }}>
                <NavIcon name="loneworker" size={22} color={statusInfo.color} />
              </View>
              <Heading level="h3" color="primary">Lone Worker Safety</Heading>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <AppText size="xs" weight="bold" style={{ color: statusInfo.color }}>
                ● {statusInfo.label}
              </AppText>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Status Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: '#F8FAFC', borderRadius: borderRadius.md }]}>
              <View style={styles.summaryRow}>
                <AppText size="sm" color="secondary">Status</AppText>
                <AppText size="sm" weight="bold" style={{ color: statusInfo.color }}>
                  {statusInfo.label}
                </AppText>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <AppText size="sm" color="secondary">Last Check-in</AppText>
                <AppText size="sm" weight="bold" color="primary">
                  {isClockedIn ? (loneWorker.lastCheckIn || '3:39 PM') : 'None'}
                </AppText>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <AppText size="sm" color="secondary">Next Check Due</AppText>
                <AppText size="sm" weight="bold" style={{ color: '#D97706' }}>
                  {!isClockedIn ? 'Clock In Required' : 'NOW'}
                </AppText>
              </View>
            </View>

            {/* Action Buttons (54px Glove-friendly, Mandatory Options ONLY) */}
            <View style={styles.buttonContainer}>
              <Button
                title="SAFE CHECKED"
                variant="primary"
                size="large"
                fullWidth
                onPress={handleSafeCheckIn}
                style={[
                  styles.actionButton,
                  { height: 54, backgroundColor: '#059669' },
                ]}
              />

              <Button
                title="⚠ REPORT ISSUE"
                variant="outline"
                size="large"
                fullWidth
                onPress={handleReportIssue}
                style={[
                  styles.actionButton,
                  { height: 54, borderColor: '#DC2626' },
                ]}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  content: {
    gap: 16,
  },
  summaryCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    marginVertical: 0,
  },
});
