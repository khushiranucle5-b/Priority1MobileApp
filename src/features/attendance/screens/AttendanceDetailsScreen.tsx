import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AttendanceStackParamList } from '../../../types/navigation.types';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { useGuardStore } from '../../../store/useGuardStore';
import { useTheme } from '../../../providers/ThemeProvider';
import { Card } from '../../../components/Card';
import { AttendanceStatusBadge } from '../components';

type Props = NativeStackScreenProps<AttendanceStackParamList, 'AttendanceDetails'>;

export const AttendanceDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, spacing, borderRadius } = useTheme();
  const { recordId } = route.params;
  const history = useGuardStore(state => state.attendanceHistory);
  const record = history.find(r => r.id === recordId);

  if (!record) {
    return (
      <ScreenLayout>
        <PageHeader title="Attendance Details" showBack onBack={() => navigation.goBack()} />
        <View style={styles.emptyState}>
          <Text style={{ color: colors.textSecondary }}>Record not found.</Text>
        </View>
      </ScreenLayout>
    );
  }

  const clockIn = record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const clockOut = record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

  return (
    <ScreenLayout>
      <PageHeader title="Attendance Details" showBack onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.dateText, { color: colors.text }]}>{record.date}</Text>
              <Text style={[styles.dayText, { color: colors.textSecondary }]}>{record.day}</Text>
            </View>
            <AttendanceStatusBadge status={record.status} />
          </View>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Site Name</Text>
              <Text style={[styles.value, { color: colors.text }]}>{record.siteName}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Shift Name</Text>
              <Text style={[styles.value, { color: colors.text }]}>{record.shiftName}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Total Hours</Text>
              <Text style={[styles.value, { color: colors.text }]}>{record.workingHours ? record.workingHours.toFixed(1) + 'h' : '-'}</Text>
            </View>
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Timeline</Text>
        <Card style={styles.timelineCard}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: colors.success }]} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTime, { color: colors.text }]}>{clockIn}</Text>
              <Text style={[styles.timelineAction, { color: colors.textSecondary }]}>Clock In</Text>
            </View>
          </View>
          
          <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: record.clockOut ? colors.primary[600] : colors.disabledBorder }]} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTime, { color: colors.text }]}>{clockOut}</Text>
              <Text style={[styles.timelineAction, { color: colors.textSecondary }]}>Clock Out</Text>
            </View>
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Verification & Location</Text>
        <Card style={styles.card}>
          <View style={styles.placeholderBox}>
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md }]}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Selfie Image</Text>
            </View>
            <View style={[styles.mapPlaceholder, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md }]}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>GPS Map</Text>
            </View>
          </View>
        </Card>

        {record.notes ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
            <Card style={styles.card}>
              <Text style={{ color: colors.text }}>{record.notes}</Text>
            </Card>
          </>
        ) : null}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Fallback, would ideally use colors.border
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
  },
  dayText: {
    fontSize: 14,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    minWidth: '45%',
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
  },
  timelineCard: {
    padding: 16,
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 15,
    fontWeight: '700',
  },
  timelineAction: {
    fontSize: 13,
    marginTop: 2,
  },
  timelineLine: {
    width: 2,
    height: 24,
    marginLeft: 5,
    marginVertical: 4,
  },
  placeholderBox: {
    flexDirection: 'row',
    gap: 12,
  },
  imagePlaceholder: {
    flex: 1,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    flex: 2,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
