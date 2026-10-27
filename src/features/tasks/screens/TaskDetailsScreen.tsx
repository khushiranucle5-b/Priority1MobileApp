import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
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
import { TaskStatusModal } from '../components/TaskStatusModal';

type Props = NativeStackScreenProps<HomeStackParamList, 'TaskDetails'>;

export const TaskDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { colors, spacing, borderRadius } = useTheme();

  const {
    tasks,
    acknowledgeTask,
    startTask,
    updateTaskProgress,
    submitTask,
  } = useGuardStore();

  const task = tasks.find((t) => t.id === taskId);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'progress' | 'complete'>('progress');
  const [isActionLoading, setIsActionLoading] = useState(false);

  if (!task) {
    return (
      <ScreenLayout>
        <PageHeader title="Task Details" showBack onBack={() => navigation.goBack()} />
        <View style={styles.notFoundCenter}>
          <AppText style={[styles.notFoundText, { color: colors.textSecondary }]}>
            Task record not found or no longer accessible.
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

  const handleAcknowledge = async () => {
    try {
      setIsActionLoading(true);
      await acknowledgeTask(task.id);
      Alert.alert('Task Acknowledged', 'You have acknowledged this assigned task.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to acknowledge task.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      setIsActionLoading(true);
      await startTask(task.id);
      Alert.alert('Task Started', 'Task status is now In Progress.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to start task.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenProgressModal = () => {
    setModalMode('progress');
    setModalVisible(true);
  };

  const handleOpenCompleteModal = () => {
    setModalMode('complete');
    setModalVisible(true);
  };

  const handleModalSubmit = async (progress: number, notes: string, photos: string[]) => {
    if (modalMode === 'progress') {
      await updateTaskProgress(task.id, progress, notes);
      Alert.alert('Progress Saved', `Task progress updated to ${progress}%.`);
    } else {
      const res = await submitTask(task.id, notes, photos);
      if (res.success) {
        Alert.alert(
          task.requiresSignOff ? 'Submitted for Review' : 'Task Completed',
          res.message
        );
      }
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
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
  const isMultiGuard = task.assignedGuardIds && task.assignedGuardIds.length > 1;

  return (
    <ScreenLayout>
      <PageHeader
        title={task.taskReference}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingHorizontal: spacing.base }]}
      >
        {/* Top Overview Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
          <View style={styles.headerBadgesRow}>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColors.bg, borderColor: priorityColors.border }]}>
              <AppText style={[styles.priorityBadgeText, { color: priorityColors.text }]}>
                {task.priority} Priority
              </AppText>
            </View>
            <StatusBadge status={task.status} size="md" />
          </View>

          <Heading level="h3" style={[styles.title, { color: colors.text }]}>
            {task.title}
          </Heading>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Site */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <NavIcon name="sites" size={18} color={colors.textTertiary} />
              <AppText style={[styles.detailLabel, { color: colors.textSecondary }]}>Site / Location</AppText>
            </View>
            <AppText style={[styles.detailValue, { color: colors.text }]}>{task.site}</AppText>
          </View>

          {/* Due Time */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <NavIcon name="shifts" size={18} color={colors.textTertiary} />
              <AppText style={[styles.detailLabel, { color: colors.textSecondary }]}>Due Date & Time</AppText>
            </View>
            <AppText style={[styles.detailValue, { color: colors.text }]}>
              {task.dueDate} • {task.dueTime}
            </AppText>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <AppText style={[styles.detailLabel, { color: colors.textSecondary }]}>Execution Progress</AppText>
              <AppText style={[styles.progressNumber, { color: colors.primary[600] }]}>{task.progress || 0}%</AppText>
            </View>
            <View style={[styles.progressBarTrack, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(Math.max(task.progress || 0, 0), 100)}%`,
                    backgroundColor: task.status === 'Completed' ? colors.success : colors.primary[600],
                    borderRadius: borderRadius.full,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Supervisor Sign-Off Notification Box */}
        {task.requiresSignOff && (
          <View style={[styles.signOffCard, { backgroundColor: colors.surface, borderColor: colors.warningBorder, borderRadius: borderRadius.md }]}>
            <View style={styles.signOffHeaderRow}>
              <AppText style={{ fontSize: 18 }}>📝</AppText>
              <AppText style={[styles.signOffCardTitle, { color: colors.warningDark }]}>
                Supervisor Sign-Off Required
              </AppText>
            </View>
            <AppText style={[styles.signOffCardText, { color: colors.textSecondary }]}>
              This task cannot be directly marked Completed by guards. Upon submitting completion notes and photos, it is routed to supervisor{' '}
              <AppText style={{ fontWeight: '700' }}>{task.supervisorName || 'Jane Smith'}</AppText> for verification and approval.
            </AppText>
          </View>
        )}

        {/* Supervisor Feedback Banner (if available) */}
        {task.supervisorFeedback ? (
          <View style={[styles.feedbackCard, { backgroundColor: colors.warningLight, borderColor: colors.warningBorder, borderRadius: borderRadius.md }]}>
            <View style={styles.feedbackHeader}>
              <AppText style={{ fontSize: 18 }}>💬</AppText>
              <AppText style={[styles.feedbackTitle, { color: colors.warningDark }]}>
                Supervisor Feedback
              </AppText>
            </View>
            <AppText style={[styles.feedbackContent, { color: colors.text }]}>
              "{task.supervisorFeedback}"
            </AppText>
            {task.supervisorSignOffDate && (
              <AppText style={[styles.feedbackTimestamp, { color: colors.textTertiary }]}>
                Logged on: {task.supervisorSignOffDate}
              </AppText>
            )}
          </View>
        ) : null}

        {/* Multi-Guard Assigned Team */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
          <Heading level="h4" style={[styles.sectionHeading, { color: colors.text }]}>
            Assigned Personnel ({task.assignedGuards?.length || task.assignedGuardIds.length})
          </Heading>
          <View style={styles.guardsList}>
            {(task.assignedGuards || []).map((guard, index) => (
              <View key={guard.id || index} style={[styles.guardItem, { borderColor: colors.border }]}>
                <View style={[styles.guardAvatar, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full }]}>
                  <NavIcon name="profile" size={20} color={colors.primary[600]} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={[styles.guardName, { color: colors.text }]}>{guard.name}</AppText>
                  <AppText style={[styles.guardRole, { color: colors.textTertiary }]}>{guard.role || 'Security Officer'}</AppText>
                </View>
                <View style={[styles.assignedTag, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.sm }]}>
                  <AppText style={[styles.assignedTagText, { color: colors.textSecondary }]}>Assigned</AppText>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Instructions Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
          <Heading level="h4" style={[styles.sectionHeading, { color: colors.text }]}>
            Operational Instructions
          </Heading>
          <AppText style={[styles.instructionsText, { color: colors.textSecondary }]}>
            {task.instructions}
          </AppText>
        </View>

        {/* Timestamps Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
          <Heading level="h4" style={[styles.sectionHeading, { color: colors.text }]}>
            Timeline & Auditing
          </Heading>

          <View style={styles.timelineRow}>
            <AppText style={[styles.timelineLabel, { color: colors.textTertiary }]}>Created</AppText>
            <AppText style={[styles.timelineVal, { color: colors.text }]}>{task.createdAt || 'N/A'}</AppText>
          </View>

          <View style={styles.timelineRow}>
            <AppText style={[styles.timelineLabel, { color: colors.textTertiary }]}>Acknowledged</AppText>
            <AppText style={[styles.timelineVal, { color: colors.text }]}>{task.acknowledgedAt || 'Pending'}</AppText>
          </View>

          <View style={styles.timelineRow}>
            <AppText style={[styles.timelineLabel, { color: colors.textTertiary }]}>Started</AppText>
            <AppText style={[styles.timelineVal, { color: colors.text }]}>{task.startedAt || 'Pending'}</AppText>
          </View>

          {task.requiresSignOff ? (
            <View style={styles.timelineRow}>
              <AppText style={[styles.timelineLabel, { color: colors.textTertiary }]}>Submitted for Review</AppText>
              <AppText style={[styles.timelineVal, { color: colors.text }]}>{task.submittedAt || 'Pending'}</AppText>
            </View>
          ) : null}

          <View style={styles.timelineRow}>
            <AppText style={[styles.timelineLabel, { color: colors.textTertiary }]}>Completed</AppText>
            <AppText style={[styles.timelineVal, { color: colors.text }]}>{task.completedAt || 'Incomplete'}</AppText>
          </View>
        </View>

        {/* Completion Notes & Photos (if present) */}
        {(task.completionNotes || (task.completionPhotos && task.completionPhotos.length > 0)) && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.lg }]}>
            <Heading level="h4" style={[styles.sectionHeading, { color: colors.text }]}>
              Completion Submission
            </Heading>

            {task.completionNotes ? (
              <View style={styles.notesBox}>
                <AppText style={[styles.notesLabel, { color: colors.textTertiary }]}>Guard Notes:</AppText>
                <AppText style={[styles.notesText, { color: colors.text }]}>{task.completionNotes}</AppText>
              </View>
            ) : null}

            {task.completionPhotos && task.completionPhotos.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <AppText style={[styles.notesLabel, { color: colors.textTertiary, marginBottom: 8 }]}>
                  Attached Verification Photos ({task.completionPhotos.length}):
                </AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
                  {task.completionPhotos.map((uri, idx) => (
                    <Image key={idx} source={{ uri }} style={[styles.detailPhoto, { borderRadius: borderRadius.md }]} />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Bottom Actions based on status */}
        <View style={styles.actionsSection}>
          {task.status === 'Pending' && (
            <View style={styles.buttonGroup}>
              {!task.acknowledgedAt && (
                <Button
                  title="Acknowledge Task"
                  variant="outline"
                  size="large"
                  isLoading={isActionLoading}
                  onPress={handleAcknowledge}
                  style={styles.fullWidthBtn}
                />
              )}
              <Button
                title="Start Task"
                variant="primary"
                size="large"
                isLoading={isActionLoading}
                onPress={handleStart}
                style={styles.fullWidthBtn}
              />
            </View>
          )}

          {task.status === 'In Progress' && (
            <View style={styles.buttonGroup}>
              <Button
                title="Update Progress"
                variant="outline"
                size="large"
                onPress={handleOpenProgressModal}
                style={styles.fullWidthBtn}
              />
              <Button
                title={task.requiresSignOff ? 'Submit for Review' : 'Mark Completed'}
                variant="primary"
                size="large"
                onPress={handleOpenCompleteModal}
                style={styles.fullWidthBtn}
              />
            </View>
          )}

          {task.status === 'Under Review' && (
            <View style={[styles.statusNoticeBox, { backgroundColor: colors.warningLight, borderColor: colors.warningBorder, borderRadius: borderRadius.md }]}>
              <AppText style={[styles.statusNoticeTitle, { color: colors.warningDark }]}>
                ⏳ Under Supervisor Review
              </AppText>
              <AppText style={[styles.statusNoticeText, { color: colors.textSecondary }]}>
                This task has been submitted and is pending sign-off from {task.supervisorName || 'supervisor'}. You will receive a notification once approved or if revisions are requested.
              </AppText>
            </View>
          )}

          {task.status === 'Completed' && (
            <View style={[styles.statusNoticeBox, { backgroundColor: colors.successLight, borderColor: colors.successBorder, borderRadius: borderRadius.md }]}>
              <AppText style={[styles.statusNoticeTitle, { color: colors.successDark }]}>
                ✓ Task Completed
              </AppText>
              <AppText style={[styles.statusNoticeText, { color: colors.textSecondary }]}>
                This task was successfully completed and recorded in the audit log.
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Progress & Completion Modal */}
      <TaskStatusModal
        visible={modalVisible}
        task={task}
        mode={modalMode}
        onClose={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
      />
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
  headerBadgesRow: {
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
  priorityBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
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
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressNumber: {
    fontSize: 15,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  signOffCard: {
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  signOffHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  signOffCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  signOffCardText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  feedbackCard: {
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  feedbackContent: {
    fontSize: 14.5,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  feedbackTimestamp: {
    fontSize: 12,
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  guardsList: {
    gap: 10,
  },
  guardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  guardAvatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  guardName: {
    fontSize: 15,
    fontWeight: '700',
  },
  guardRole: {
    fontSize: 12.5,
  },
  assignedTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  assignedTagText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  instructionsText: {
    fontSize: 15.5,
    lineHeight: 24,
    fontWeight: '500',
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineVal: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  notesBox: {
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14.5,
    lineHeight: 22,
  },
  photosScroll: {
    gap: 10,
  },
  detailPhoto: {
    width: 120,
    height: 120,
  },
  actionsSection: {
    marginTop: 8,
  },
  buttonGroup: {
    gap: 12,
  },
  fullWidthBtn: {
    alignSelf: 'stretch',
  },
  statusNoticeBox: {
    padding: 16,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  statusNoticeTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  statusNoticeText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
