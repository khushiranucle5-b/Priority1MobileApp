import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';

interface LoneWorkerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LoneWorkerModal: React.FC<LoneWorkerModalProps> = ({ visible, onClose }) => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { loneWorker, loneWorkerHistory, checkInLoneWorker, isClockedIn } = useGuardStore();
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const elapsedMs = loneWorker.lastCheckInTimestamp ? nowMs - loneWorker.lastCheckInTimestamp : 0;
  const isCheckInDisabled = !isClockedIn || (loneWorker.lastCheckInTimestamp !== null && elapsedMs < 30 * 60 * 1000);
  const remainingMins = Math.max(1, Math.ceil((30 * 60 * 1000 - elapsedMs) / 60000));

  const getStatusInfo = () => {
    if (!isClockedIn) {
      return { label: 'NOT ACTIVE', color: '#94A3B8', bg: '#F1F5F9' };
    }
    if (elapsedMs >= 45 * 60 * 1000) {
      return { label: 'OVERDUE', color: '#DC2626', bg: '#FEE2E2' };
    }
    if (elapsedMs >= 30 * 60 * 1000) {
      return { label: 'CHECK REQUIRED', color: '#D97706', bg: '#FEF3C7' };
    }
    return { label: 'SAFE', color: '#059669', bg: '#D1FAE5' };
  };

  const statusInfo = getStatusInfo();

  const handleSafeCheckIn = () => {
    checkInLoneWorker();
  };

  const handleReportIssue = () => {
    onClose();
    navigation.navigate('Incident');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={{ marginRight: 8 }}>
                <NavIcon name="loneworker" size={22} color={statusInfo.color} />
              </View>
              <Heading level="h3" color="primary">Lone Worker Safety</Heading>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                <AppText size="xs" weight="bold" style={{ color: statusInfo.color }}>
                  ● {statusInfo.label}
                </AppText>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <AppText size="lg" color="secondary" weight="bold">✕</AppText>
              </TouchableOpacity>
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
                  {isClockedIn ? (loneWorker.lastCheckIn || '03:58 PM') : 'None'}
                </AppText>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <AppText size="sm" color="secondary">Next Check Due</AppText>
                <AppText size="sm" weight="bold" style={{ color: elapsedMs >= 30 * 60 * 1000 ? '#D97706' : '#4F46E5' }}>
                  {!isClockedIn ? 'Clock In Required' : elapsedMs >= 30 * 60 * 1000 ? 'NOW' : (loneWorker.nextCheckRequired || '04:28 PM')}
                </AppText>
              </View>
            </View>

            {/* Action Buttons (54px Glove-friendly) */}
            <View style={styles.buttonContainer}>
              <Button
                title={!isClockedIn ? "Clock In Required" : isCheckInDisabled ? "✓ SAFE CHECKED" : "✓  I'M SAFE"}
                variant={isCheckInDisabled ? "secondary" : "primary"}
                size="large"
                fullWidth
                disabled={isCheckInDisabled}
                onPress={handleSafeCheckIn}
                style={[
                  styles.actionButton,
                  { height: 54, backgroundColor: isCheckInDisabled ? undefined : '#059669' },
                ]}
              />
              {isClockedIn && isCheckInDisabled && (
                <AppText size="xs" color="secondary" style={styles.helperText}>
                  Next check available in {remainingMins} min
                </AppText>
              )}

              <Button
                title="⚠️ REPORT ISSUE"
                variant="outline"
                size="large"
                fullWidth
                onPress={handleReportIssue}
                style={[styles.actionButton, { height: 54, borderColor: '#DC2626' }]}
              />
            </View>

            {/* Check-in History */}
            <View style={styles.historySection}>
              <AppText size="sm" weight="bold" color="primary" style={{ marginBottom: 8 }}>
                Check-in History
              </AppText>

              {(!loneWorkerHistory || loneWorkerHistory.length === 0) ? (
                <View style={styles.historyItem}>
                  <AppText size="xs" color="secondary">03:58 PM</AppText>
                  <AppText size="xs" weight="bold" style={{ color: '#059669' }}>✓ Safe Check-in</AppText>
                </View>
              ) : (
                loneWorkerHistory.slice(0, 5).map((item) => (
                  <View key={item.id} style={styles.historyItem}>
                    <AppText size="xs" color="secondary">{item.exactTime || '10:00 AM'}</AppText>
                    <AppText size="xs" weight="bold" style={{ color: '#059669' }}>{item.status || '✓ Safe'}</AppText>
                  </View>
                ))
              )}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
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
  closeBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    gap: 16,
    paddingBottom: 24,
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
    gap: 10,
  },
  actionButton: {
    marginVertical: 0,
  },
  helperText: {
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 4,
  },
  historySection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
});
