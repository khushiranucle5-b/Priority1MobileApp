import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { TaskRecord } from '../types/task.types';
import { AppText } from '../../../components/typography/Text';
import { StatusBadge } from '../../../components/StatusBadge';
import { useTheme } from '../../../providers/ThemeProvider';
import { NavIcon } from '../../../components/NavIcon';

interface TaskCardProps {
  task: TaskRecord;
  onPress: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const { colors, borderRadius } = useTheme();

  const getPriorityColors = () => {
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

  const priorityColors = getPriorityColors();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: borderRadius.lg,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Top Header Row: Reference & Badges */}
      <View style={styles.topRow}>
        <View style={styles.referenceContainer}>
          <AppText style={[styles.referenceText, { color: colors.primary[600] }]}>
            {task.taskReference}
          </AppText>
          {task.requiresSignOff && (
            <View style={[styles.signOffBadge, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <AppText style={[styles.signOffText, { color: colors.textSecondary }]}>Sign-Off Req.</AppText>
            </View>
          )}
        </View>

        <View style={styles.badgesRight}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors.bg, borderColor: priorityColors.border }]}>
            <AppText style={[styles.priorityText, { color: priorityColors.text }]}>{task.priority}</AppText>
          </View>
          <StatusBadge status={task.status} size="sm" />
        </View>
      </View>

      {/* Task Title */}
      <AppText style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {task.title}
      </AppText>

      {/* Due Date & Time */}
      <View style={styles.infoRow}>
        <NavIcon name="shifts" size={16} color={colors.textTertiary} />
        <AppText style={[styles.infoText, { color: colors.textSecondary }]}>
          Due: {task.dueDate} • {task.dueTime}
        </AppText>
      </View>

      {/* Supervisor Feedback Teaser */}
      {task.supervisorFeedback ? (
        <View style={[styles.feedbackBox, { backgroundColor: colors.warningLight, borderColor: colors.warningBorder, borderRadius: borderRadius.sm }]}>
          <AppText style={[styles.feedbackLabel, { color: colors.warningDark }]}>Supervisor Feedback:</AppText>
          <AppText style={[styles.feedbackText, { color: colors.textSecondary }]} numberOfLines={1}>
            "{task.supervisorFeedback}"
          </AppText>
        </View>
      ) : null}

      {/* Progress Bar (if in progress or completed) */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <AppText style={[styles.progressLabel, { color: colors.textTertiary }]}>Progress</AppText>
          <AppText style={[styles.progressValue, { color: colors.primary[600] }]}>{task.progress || 0}%</AppText>
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

      {/* Bottom Action Row with Patrol-style Eye View Icon Button */}
      <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.iconActionBtnView,
            {
              borderColor: colors.border,
              backgroundColor: colors.surfaceSecondary,
            },
          ]}
          onPress={onPress}
          activeOpacity={0.7}
          accessibilityLabel="View task details"
          accessibilityRole="button"
        >
          <NavIcon name="eye" size={26} color={colors.primary[600]} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  referenceText: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  signOffBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: 6,
  },
  signOffText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgesRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14.5,
    fontWeight: '500',
    flex: 1,
  },
  multiGuardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6,
    marginBottom: 6,
    gap: 6,
  },
  multiGuardIcon: {
    fontSize: 14,
  },
  multiGuardText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  feedbackBox: {
    padding: 8,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 6,
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  feedbackText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 7,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 10,
    borderTopWidth: 1,
  },
  iconActionBtnView: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
