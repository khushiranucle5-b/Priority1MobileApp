import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { DispatchRecord } from '../types/dispatch.types';
import { AppText } from '../../../components/typography/Text';
import { StatusBadge } from '../../../components/StatusBadge';
import { NavIcon } from '../../../components/NavIcon';
import { useTheme } from '../../../providers/ThemeProvider';

interface DispatchCardProps {
  dispatch: DispatchRecord;
  onPress: () => void;
}

export const DispatchCard: React.FC<DispatchCardProps> = ({ dispatch, onPress }) => {
  const { colors, borderRadius } = useTheme();

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
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.refContainer}>
          <NavIcon name="truck" size={18} color={colors.primary[600]} />
          <AppText style={[styles.referenceText, { color: colors.primary[600] }]}>
            {dispatch.dispatchReference}
          </AppText>
        </View>

        <View style={styles.badgesRight}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors.bg, borderColor: priorityColors.border }]}>
            <AppText style={[styles.priorityText, { color: priorityColors.text }]}>{dispatch.priority}</AppText>
          </View>
          <StatusBadge status={dispatch.status} size="sm" />
        </View>
      </View>

      {/* Reason Header */}
      <AppText style={[styles.reasonText, { color: colors.text }]} numberOfLines={2}>
        {dispatch.reason}
      </AppText>

      {/* Reporting Time & Duration */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <NavIcon name="shifts" size={15} color={colors.textTertiary} />
          <AppText style={[styles.metaText, { color: colors.textSecondary }]}>
            Report: {dispatch.reportingTime}
          </AppText>
        </View>
        <AppText style={[styles.metaDivider, { color: colors.border }]}>•</AppText>
        <View style={styles.metaItem}>
          <AppText style={[styles.metaText, { color: colors.textSecondary }]}>
            Est: {dispatch.expectedDuration}
          </AppText>
        </View>
      </View>

      {/* Cancellation Notice if Cancelled */}
      {dispatch.status === 'Cancelled' ? (
        <View style={[styles.noticeBanner, { backgroundColor: colors.errorLight, borderColor: colors.errorBorder, borderRadius: borderRadius.sm }]}>
          <AppText style={[styles.noticeBannerText, { color: colors.errorDark }]}>
            ⚠️ Cancelled: {dispatch.cancellationNotice || 'Dispatch stood down by control room.'}
          </AppText>
        </View>
      ) : null}

      {/* Reassignment Notice if Reassigned */}
      {dispatch.reassignmentNotice ? (
        <View style={[styles.noticeBanner, { backgroundColor: colors.warningLight, borderColor: colors.warningBorder, borderRadius: borderRadius.sm }]}>
          <AppText style={[styles.noticeBannerText, { color: colors.warningDark }]}>
            ℹ️ Reassignment: {dispatch.reassignmentNotice}
          </AppText>
        </View>
      ) : null}

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
          accessibilityLabel="View dispatch details"
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
  },
  refContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  referenceText: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  reasonText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  metaDivider: {
    fontSize: 14,
  },
  noticeBanner: {
    padding: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  noticeBannerText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
    paddingTop: 10,
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
