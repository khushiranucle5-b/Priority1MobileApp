import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation.types';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { StatusBadge } from '../../../components/StatusBadge';
import { NavIcon } from '../../../components/NavIcon';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { soundAlertService } from '../../../services/soundAlert.service';
import { DispatchTimeline } from '../components/DispatchTimeline';
import { getNextDispatchStatus, DispatchStatus } from '../types/dispatch.types';

type Props = NativeStackScreenProps<HomeStackParamList, 'DispatchDetails'>;

export const DispatchDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { dispatchId } = route.params;
  const { colors, spacing, borderRadius } = useTheme();
  const { dispatches, updateDispatchStatus, activeEmergencyDispatch, dismissEmergencyDispatchAlert } = useGuardStore();

  const dispatch = dispatches.find((d) => d.id === dispatchId);

  useEffect(() => {
    soundAlertService.stopSafetyAlert();
    if (activeEmergencyDispatch?.id === dispatchId) {
      dismissEmergencyDispatchAlert(dispatchId);
    }
  }, [activeEmergencyDispatch, dispatchId]);

  const [isLoading, setIsLoading] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  if (!dispatch) {
    return (
      <ScreenLayout>
        <PageHeader title="Dispatch Details" showBack onBack={() => navigation.goBack()} />
        <View style={styles.notFoundCenter}>
          <AppText style={[styles.notFoundText, { color: colors.textSecondary }]}>
            Dispatch record not found.
          </AppText>
          <Button
            title="Go Back"
            variant="outline"
            size="medium"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          />
        </View>
      </ScreenLayout>
    );
  }

  const nextStatus = getNextDispatchStatus(dispatch.status);

  const handleAdvanceStatus = async () => {
    if (!nextStatus) return;

    if (nextStatus === 'Completed') {
      // Open modal to enter completion notes
      setCompleteModalVisible(true);
      return;
    }

    try {
      setIsLoading(true);
      const res = await updateDispatchStatus(dispatch.id, nextStatus);
      if (res.success) {
        Alert.alert('Status Updated', res.message);
      } else {
        Alert.alert('Transition Blocked', res.message);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update dispatch status.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCompletion = async () => {
    if (!completionNotes.trim()) {
      Alert.alert('Required', 'Please enter resolution notes.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await updateDispatchStatus(dispatch.id, 'Completed', completionNotes);
      setCompleteModalVisible(false);
      if (res.success) {
        Alert.alert('Success', 'Dispatch marked as completed.');
      } else {
        Alert.alert('Error', res.message);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to complete dispatch.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallContact = () => {
    if (!dispatch.contact?.phone) return;
    const phoneUrl = `tel:${dispatch.contact.phone}`;
    Linking.canOpenURL(phoneUrl).then((supported) => {
      if (supported) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Authorized Contact', `${dispatch.contact.name}: ${dispatch.contact.phone}`);
      }
    });
  };

  const getPriorityColor = () => {
    switch (dispatch.priority) {
      case 'Critical':
      case 'High':
        return { bg: colors.errorLight, border: colors.errorBorder, text: colors.errorDark };
      case 'Medium':
        return { bg: colors.warningLight, border: colors.warningBorder, text: colors.warningDark };
      case 'Low':
      default:
        return { bg: colors.infoLight, border: colors.infoBorder, text: colors.info };
    }
  };

  const priorityColors = getPriorityColor();

  const getActionButtonTitle = () => {
    switch (dispatch.status) {
      case 'Assigned': return 'Acknowledge Dispatch';
      case 'Acknowledged': return 'Start Travel';
      case 'En Route': return 'Confirm Arrival';
      case 'Arrived': return 'Complete Dispatch';
      default: return null;
    }
  };

  const actionTitle = getActionButtonTitle();

  return (
    <ScreenLayout>
      <PageHeader
        title={dispatch.dispatchReference}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingHorizontal: spacing.base }]}
      >
        {/* Main Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
          <View style={styles.topRow}>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColors.bg, borderColor: priorityColors.border }]}>
              <AppText style={[styles.priorityText, { color: priorityColors.text }]}>
                {dispatch.priority} Priority
              </AppText>
            </View>
            <StatusBadge status={dispatch.status} size="md" />
          </View>

          <Heading level="h3" style={[styles.reasonTitle, { color: colors.text }]}>
            {dispatch.reason}
          </Heading>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Site */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <NavIcon name="sites" size={18} color={colors.textTertiary} />
              <AppText style={[styles.detailLabel, { color: colors.textSecondary }]}>Site</AppText>
            </View>
            <AppText style={[styles.detailValue, { color: colors.text }]}>{dispatch.site}</AppText>
          </View>

          {/* Reporting Time & Expected Duration */}
          <View style={styles.twoColRow}>
            <View style={{ flex: 1 }}>
              <AppText style={[styles.detailLabel, { color: colors.textSecondary }]}>Reporting Time</AppText>
              <AppText style={[styles.detailValue, { color: colors.text }]}>{dispatch.reportingTime}</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={[styles.detailLabel, { color: colors.textSecondary }]}>Expected Duration</AppText>
              <AppText style={[styles.detailValue, { color: colors.text }]}>{dispatch.expectedDuration}</AppText>
            </View>
          </View>
        </View>

        {/* Cancellation Notice if Cancelled */}
        {dispatch.status === 'Cancelled' && (
          <View style={[styles.alertCard, { backgroundColor: colors.errorLight, borderColor: colors.errorBorder, borderRadius: borderRadius.md }]}>
            <AppText style={[styles.alertTitle, { color: colors.errorDark }]}>🚫 Dispatch Cancelled by Supervisor</AppText>
            <AppText style={[styles.alertText, { color: colors.textSecondary }]}>
              {dispatch.cancellationNotice || 'Operations stood down this dispatch.'}
            </AppText>
          </View>
        )}

        {/* Reassignment Notice if Reassigned */}
        {dispatch.reassignmentNotice && (
          <View style={[styles.alertCard, { backgroundColor: colors.warningLight, borderColor: colors.warningBorder, borderRadius: borderRadius.md }]}>
            <AppText style={[styles.alertTitle, { color: colors.warningDark }]}>ℹ️ Reassignment Notice</AppText>
            <AppText style={[styles.alertText, { color: colors.textSecondary }]}>
              {dispatch.reassignmentNotice}
            </AppText>
          </View>
        )}

        {/* Site Contact */}
        {dispatch.contact && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
            <Heading level="h4" style={[styles.sectionHeading, { color: colors.text }]}>
              Site Contact
            </Heading>
            <View style={styles.contactContainer}>
              <View style={{ flex: 1 }}>
                <AppText style={[styles.contactName, { color: colors.text }]}>{dispatch.contact.name}</AppText>
                <AppText style={[styles.contactRole, { color: colors.textTertiary }]}>{dispatch.contact.role}</AppText>
                <AppText style={[styles.contactPhone, { color: colors.primary[600] }]}>{dispatch.contact.phone}</AppText>
              </View>
              <TouchableOpacity
                style={[styles.callBigBtn, { backgroundColor: colors.primary[50], borderColor: colors.primary[400] }]}
                onPress={handleCallContact}
                activeOpacity={0.7}
              >
                <NavIcon name="phone" size={20} color={colors.primary[600]} />
                <AppText style={[styles.callBigBtnText, { color: colors.primary[600] }]}>Call Contact</AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Operational Instructions */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
          <Heading level="h4" style={[styles.sectionHeading, { color: colors.text }]}>
            Instructions & Protocols
          </Heading>
          <AppText style={[styles.instructionsText, { color: colors.textSecondary }]}>
            {dispatch.instructions}
          </AppText>
          {dispatch.supervisorNotes ? (
            <View style={[styles.supervisorNotesBox, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.sm }]}>
              <AppText style={[styles.supervisorNotesLabel, { color: colors.textTertiary }]}>Supervisor Note:</AppText>
              <AppText style={[styles.supervisorNotesContent, { color: colors.text }]}>{dispatch.supervisorNotes}</AppText>
            </View>
          ) : null}
        </View>

        {/* Lifecycle Stage Timeline */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
          <Heading level="h4" style={[styles.sectionHeading, { color: colors.text }]}>
            Dispatch Lifecycle
          </Heading>
          <DispatchTimeline dispatch={dispatch} />
        </View>

        {/* Completion Notes if Completed */}
        {dispatch.completionNotes ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
            <Heading level="h4" style={[styles.sectionHeading, { color: colors.text }]}>
              Resolution Notes
            </Heading>
            <AppText style={[styles.instructionsText, { color: colors.textSecondary }]}>
              {dispatch.completionNotes}
            </AppText>
          </View>
        ) : null}

        {/* Action Button Section */}
        <View style={styles.actionSection}>
          {actionTitle ? (
            <Button
              title={actionTitle}
              variant="primary"
              size="large"
              isLoading={isLoading}
              onPress={handleAdvanceStatus}
              style={styles.fullWidthBtn}
            />
          ) : dispatch.status === 'Completed' ? (
            <View style={[styles.terminalNotice, { backgroundColor: colors.successLight, borderColor: colors.successBorder, borderRadius: borderRadius.md }]}>
              <AppText style={[styles.terminalNoticeText, { color: colors.successDark }]}>
                ✓ Dispatch Resolved & Completed
              </AppText>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Complete Dispatch Modal */}
      <Modal visible={completeModalVisible} transparent animationType="slide" onRequestClose={() => setCompleteModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Heading level="h4" style={{ color: colors.text }}>Complete Dispatch</Heading>
              <TouchableOpacity onPress={() => setCompleteModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <NavIcon name="close" size={24} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <AppText style={[styles.modalLabel, { color: colors.text }]}>
                Resolution Notes *
              </AppText>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.text,
                    borderRadius: borderRadius.md,
                  },
                ]}
                placeholder="Enter resolution notes..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={completionNotes}
                onChangeText={setCompletionNotes}
              />
            </View>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <Button
                title="Cancel"
                variant="outline"
                size="medium"
                onPress={() => setCompleteModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Mark Completed"
                variant="primary"
                size="medium"
                isLoading={isLoading}
                onPress={handleConfirmCompletion}
                style={{ flex: 1.6 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
    paddingTop: 8,
  },
  notFoundCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '800',
  },
  reasonTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
  },
  divider: {
    height: 1.5,
    marginVertical: 14,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  twoColRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  alertCard: {
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '800',
  },
  contactRole: {
    fontSize: 13.5,
    marginTop: 2,
  },
  contactPhone: {
    fontSize: 14.5,
    fontWeight: '700',
    marginTop: 4,
  },
  callBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  callBigBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  instructionsText: {
    fontSize: 15.5,
    lineHeight: 24,
    fontWeight: '500',
  },
  supervisorNotesBox: {
    padding: 10,
    marginTop: 10,
  },
  supervisorNotesLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  supervisorNotesContent: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  actionSection: {
    marginTop: 6,
  },
  fullWidthBtn: {
    alignSelf: 'stretch',
  },
  terminalNotice: {
    padding: 16,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  terminalNoticeText: {
    fontSize: 15.5,
    fontWeight: '800',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1.5,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1.5,
    padding: 12,
    fontSize: 15,
    minHeight: 110,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1.5,
  },
});
