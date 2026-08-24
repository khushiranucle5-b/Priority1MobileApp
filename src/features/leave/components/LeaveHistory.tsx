import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { StatusBadge } from '../../../components/StatusBadge';
import { NavIcon } from '../../../components/NavIcon';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, LeaveRequest } from '../../../store/useGuardStore';

interface LeaveHistoryProps {
  onEditLeave: (leave: LeaveRequest) => void;
  searchQuery?: string;
  statusFilter?: string;
}

export const LeaveHistory: React.FC<LeaveHistoryProps> = ({ onEditLeave, searchQuery = '', statusFilter = 'All' }) => {
  const { colors, spacing, borderRadius } = useTheme();
  const leaves = useGuardStore((state) => state.leaves);
  const cancelLeave = useGuardStore((state) => state.cancelLeave);

  const [leaveToCancel, setLeaveToCancel] = useState<LeaveRequest | null>(null);
  const [showToast, setShowToast] = useState(false);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesType = (leave.type || '').toLowerCase().includes(q);
        const matchesReason = (leave.reason || '').toLowerCase().includes(q);
        const matchesFrom = (leave.fromDate || '').toLowerCase().includes(q);
        const matchesTo = (leave.toDate || '').toLowerCase().includes(q);
        const matchesStatus = (leave.status || '').toLowerCase().includes(q);
        if (!matchesType && !matchesReason && !matchesFrom && !matchesTo && !matchesStatus) {
          return false;
        }
      }

      if (statusFilter && statusFilter !== 'All') {
        if (leave.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [leaves, searchQuery, statusFilter]);

  const getStatusColors = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved') {
      return {
        bg: colors.successLight || '#dcfce7',
        text: colors.success ? colors.success[700] || '#15803d' : '#15803d',
      };
    } else if (s === 'rejected') {
      return {
        bg: colors.errorLight || '#fee2e2',
        text: colors.error ? colors.error[700] || '#b91c1c' : '#b91c1c',
      };
    } else if (s === 'cancelled') {
      return {
        bg: colors.surfaceSecondary || '#e2e8f0',
        text: colors.textSecondary || '#64748b',
      };
    }
    return {
      bg: colors.warningLight || '#ffedd5',
      text: colors.warning ? colors.warning[700] || '#c2410c' : '#c2410c',
    };
  };

  const [isCancelling, setIsCancelling] = useState(false);

  const handleConfirmCancel = async () => {
    if (!leaveToCancel || isCancelling) return;
    const targetId = leaveToCancel.id;
    setIsCancelling(true);

    try {
      await cancelLeave(targetId);
      setLeaveToCancel(null);
      setIsCancelling(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      setIsCancelling(false);
      console.error('[LeaveHistory] Cancel leave error:', err);
      Alert.alert('Error', 'Unable to cancel leave application. Please try again.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      {filteredLeaves.map((leave) => {
        const statusColors = getStatusColors(leave.status);
        const statusLower = leave.status.toLowerCase();

        // Business rules for actions:
        // Pending: Edit allowed (if not past), Cancel allowed
        // Approved: Cancel allowed if future start date, Edit disabled
        // Rejected/Cancelled: Actions disabled
        const canEdit = statusLower === 'pending' && leave.toDate >= todayStr;
        const canCancel = statusLower === 'pending' || (statusLower === 'approved' && leave.fromDate > todayStr);

        return (
          <Card key={leave.id} variant="outlined" style={styles.card}>
            <View style={styles.headerRow}>
              <AppText size="lg" weight="bold" color="primary">{leave.type.toUpperCase()}</AppText>
              <StatusBadge status={leave.status} size="md" />
            </View>
            
            <View style={[styles.detailRow, { marginTop: spacing.sm }]}>
              <View>
                <AppText size="xs" color="secondary" weight="semibold">DATE RANGE</AppText>
                <AppText size="base" weight="bold" color="primary" style={{ marginTop: 2 }}>
                  {leave.fromDate} – {leave.toDate}
                </AppText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <AppText size="xs" color="secondary" weight="semibold">DURATION</AppText>
                <AppText size="base" weight="bold" style={{ color: colors.primary[600] || '#2563eb', marginTop: 2 }}>
                  {leave.days} Day(s)
                </AppText>
              </View>
            </View>

            <View style={{ marginTop: 10 }}>
              <AppText size="xs" color="secondary" weight="semibold">REASON</AppText>
              <AppText size="base" color="text" weight="medium" style={{ marginTop: 2 }}>
                {leave.reason}
              </AppText>
            </View>

            {leave.attachment && (
              <View style={[styles.attachmentBadge, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.sm, marginTop: 10 }]}>
                <AppText size="xs" color="primary" weight="bold">{leave.attachment.name}</AppText>
                <AppText size="xs" color="secondary">{(leave.attachment.size / 1024).toFixed(1)} KB</AppText>
              </View>
            )}

            {(canEdit || canCancel) && (
              <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
                {canEdit && (
                  <TouchableOpacity
                    style={styles.iconActionBtnEdit}
                    onPress={() => onEditLeave(leave)}
                    activeOpacity={0.7}
                    accessibilityLabel="Edit leave"
                    accessibilityRole="button"
                  >
                    <NavIcon name="edit" size={24} color="#4F46E5" />
                  </TouchableOpacity>
                )}

                {canCancel && (
                  <TouchableOpacity
                    style={styles.iconActionBtnCancel}
                    onPress={() => setLeaveToCancel(leave)}
                    activeOpacity={0.7}
                    accessibilityLabel="Cancel leave"
                    accessibilityRole="button"
                  >
                    <NavIcon name="close" size={24} color="#DC2626" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Card>
        );
      })}

      {leaves.length === 0 && (
        <AppText size="base" color="secondary" style={styles.empty}>
          No leave history found.
        </AppText>
      )}

      {/* Confirmation Dialog for Cancel Leave */}
      <Modal visible={!!leaveToCancel} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => !isCancelling && setLeaveToCancel(null)}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }]} onStartShouldSetResponder={() => true}>
            <AppText size="lg" weight="bold" color="primary" style={{ marginBottom: 8 }}>
              CONFIRM CANCEL LEAVE?
            </AppText>
            <AppText size="base" color="secondary" style={{ marginBottom: 20 }}>
              Are you sure you want to cancel this leave application ({leaveToCancel?.type} from {leaveToCancel?.fromDate} to {leaveToCancel?.toDate})?
            </AppText>

            <View style={styles.modalActions}>
              <TouchableOpacity
                disabled={isCancelling}
                style={[styles.modalBtn, { borderColor: colors.border, borderRadius: borderRadius.md }, isCancelling && { opacity: 0.5 }]}
                onPress={() => setLeaveToCancel(null)}
              >
                <AppText size="base" weight="bold" color="primary">KEEP LEAVE</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isCancelling}
                style={[styles.modalBtn, { backgroundColor: colors.error || '#dc2626', borderRadius: borderRadius.md }, isCancelling && { opacity: 0.6 }]}
                onPress={handleConfirmCancel}
              >
                <AppText size="base" weight="bold" style={{ color: '#FFFFFF' }}>
                  {isCancelling ? 'CANCELLING...' : 'CANCEL LEAVE'}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {showToast && (
        <View style={[styles.snackbar, { backgroundColor: colors.success || '#16a34a' }]}>
          <AppText color="surface" weight="semibold" size="base">
            Leave application cancelled successfully.
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
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
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
  },
  attachmentBadge: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  iconActionBtnEdit: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActionBtnCancel: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1.5,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 8,
  },
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 1000,
  },
});
