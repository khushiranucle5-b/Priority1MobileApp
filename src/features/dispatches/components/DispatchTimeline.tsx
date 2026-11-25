import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DispatchRecord, DispatchStatus } from '../types/dispatch.types';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

interface DispatchTimelineProps {
  dispatch: DispatchRecord;
}

const STEPS: { status: DispatchStatus; label: string }[] = [
  { status: 'Assigned', label: 'Assigned' },
  { status: 'Acknowledged', label: 'Acknowledged' },
  { status: 'En Route', label: 'En Route' },
  { status: 'Arrived', label: 'Arrived' },
  { status: 'Completed', label: 'Completed' },
];

export const DispatchTimeline: React.FC<DispatchTimelineProps> = ({ dispatch }) => {
  const { colors, borderRadius } = useTheme();

  const getStatusIndex = (st: DispatchStatus): number => {
    switch (st) {
      case 'Assigned': return 0;
      case 'Acknowledged': return 1;
      case 'En Route': return 2;
      case 'Arrived': return 3;
      case 'Completed': return 4;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex(dispatch.status);

  const getTimestamp = (st: DispatchStatus): string | undefined => {
    switch (st) {
      case 'Assigned': return dispatch.assignedAt;
      case 'Acknowledged': return dispatch.acknowledgedAt;
      case 'En Route': return dispatch.enRouteAt;
      case 'Arrived': return dispatch.arrivedAt;
      case 'Completed': return dispatch.completedAt;
      default: return undefined;
    }
  };

  if (dispatch.status === 'Cancelled') {
    return (
      <View style={[styles.cancelledContainer, { backgroundColor: colors.errorLight, borderColor: colors.errorBorder, borderRadius: borderRadius.md }]}>
        <AppText style={[styles.cancelledTitle, { color: colors.errorDark }]}>🚫 Dispatch Cancelled</AppText>
        <AppText style={[styles.cancelledNotice, { color: colors.textSecondary }]}>
          {dispatch.cancellationNotice || 'This dispatch was cancelled by operations control.'}
        </AppText>
        {dispatch.cancelledAt && (
          <AppText style={[styles.cancelledTime, { color: colors.textTertiary }]}>Cancelled at: {dispatch.cancelledAt}</AppText>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {STEPS.map((step, idx) => {
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isFuture = idx > currentIndex;
        const timestamp = getTimestamp(step.status);

        let dotBg = colors.surfaceSecondary;
        let dotBorder = colors.border;
        let textColor = colors.textTertiary;
        let dotSymbol = `${idx + 1}`;

        if (isPast) {
          dotBg = colors.success;
          dotBorder = colors.success;
          textColor = colors.text;
          dotSymbol = '✓';
        } else if (isCurrent) {
          dotBg = colors.primary[600];
          dotBorder = colors.primary[600];
          textColor = colors.primary[600];
          dotSymbol = '●';
        }

        return (
          <View key={step.status} style={styles.stepRow}>
            {/* Left timeline line and dot */}
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: dotBg,
                    borderColor: dotBorder,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <AppText style={[styles.dotText, { color: isFuture ? colors.textTertiary : colors.textInverse }]}>
                  {dotSymbol}
                </AppText>
              </View>
              {idx < STEPS.length - 1 && (
                <View
                  style={[
                    styles.connectorLine,
                    {
                      backgroundColor: isPast ? colors.success : colors.border,
                    },
                  ]}
                />
              )}
            </View>

            {/* Right text details */}
            <View style={styles.stepContent}>
              <View style={styles.stepHeaderRow}>
                <AppText
                  style={[
                    styles.stepLabel,
                    {
                      color: textColor,
                      fontWeight: isCurrent ? '800' : isPast ? '700' : '500',
                    },
                  ]}
                >
                  {step.label}
                </AppText>
                {isCurrent && (
                  <View style={[styles.currentPill, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }]}>
                    <AppText style={[styles.currentPillText, { color: colors.primary[600] }]}>Current Stage</AppText>
                  </View>
                )}
              </View>

              {timestamp ? (
                <AppText style={[styles.stepTimestamp, { color: colors.textSecondary }]}>
                  {timestamp}
                </AppText>
              ) : isFuture ? (
                <AppText style={[styles.stepPending, { color: colors.textTertiary }]}>
                  Pending
                </AppText>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  dot: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dotText: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 16,
    justifyContent: 'flex-start',
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  stepLabel: {
    fontSize: 15.5,
  },
  currentPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: 6,
  },
  currentPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepTimestamp: {
    fontSize: 13,
    fontWeight: '600',
  },
  stepPending: {
    fontSize: 12.5,
    fontStyle: 'italic',
  },
  cancelledContainer: {
    padding: 16,
    borderWidth: 1.5,
  },
  cancelledTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  cancelledNotice: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  cancelledTime: {
    fontSize: 12,
  },
});
