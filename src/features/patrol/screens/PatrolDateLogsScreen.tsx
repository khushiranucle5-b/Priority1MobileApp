import React, { useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { useGuardStore, DBPatrol } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';
import { formatDisplayDate } from '../../../utils/dateUtils';

export const PatrolDateLogsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { patrols, guardId, guardName, assignedSite } = useGuardStore();

  const selectedDateStr = route.params?.dateStr || 'Aug 19, 2026';
  const displayTitleDate = formatDisplayDate(selectedDateStr);

  const defaultPatrolList: DBPatrol[] = useMemo(() => {
    return [
      {
        id: 'PT-2026-001',
        patrolCode: 'PT-2026-001',
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
      },
      {
        id: 'PT-2026-002',
        patrolCode: 'PT-2026-002',
        title: 'Morning Perimeter Patrol',
        companyId: 'c-1',
        site: assignedSite || 'Ahmedabad Plant',
        route: 'Morning Perimeter Patrol Route',
        guard: guardName || 'John Smith',
        guardId: guardId || 'G-1001',
        date: 'Aug 19, 2026',
        startTime: '08:00 AM',
        endTime: '08:42 AM',
        status: 'Completed',
        checkpoints: 5,
        scanned: 5,
        missed: 0,
        incidents: 0,
        lastCheckpoint: 'Emergency Exit B',
      },
      {
        id: 'PT-2026-003',
        patrolCode: 'PT-2026-003',
        title: 'Chemical Storage Area Inspection',
        companyId: 'c-1',
        site: assignedSite || 'Ahmedabad Plant',
        route: 'Chemical Bay Route',
        guard: guardName || 'John Smith',
        guardId: guardId || 'G-1001',
        date: 'Aug 18, 2026',
        startTime: '02:00 PM',
        endTime: '02:35 PM',
        status: 'Completed',
        checkpoints: 4,
        scanned: 4,
        missed: 0,
        incidents: 1,
        lastCheckpoint: 'Chemical Storage Tank 2',
      },
    ];
  }, [assignedSite, guardName, guardId]);

  const allPatrolsList: DBPatrol[] = useMemo(() => {
    if (!patrols || patrols.length === 0) return defaultPatrolList;
    return patrols.map((p: any, idx: number) => ({
      id: p.id || `PT-2026-00${idx + 1}`,
      patrolCode: p.patrolCode || p.id || `PT-2026-00${idx + 1}`,
      title: p.title || p.patrolName || 'Perimeter Security Patrol',
      companyId: p.companyId || 'c-1',
      site: p.site || assignedSite || 'Ahmedabad Plant',
      route: p.route || 'Perimeter Route',
      guard: p.guard || guardName || 'John Smith',
      guardId: p.guardId || guardId || 'G-1001',
      date: p.date || 'Aug 19, 2026',
      startTime: p.startTime || '08:00 AM',
      endTime: p.endTime,
      status: p.status === 'in_progress' ? 'In Progress' : p.status === 'completed' ? 'Completed' : p.status || 'Assigned',
      checkpoints: p.checkpoints || 5,
      scanned: p.scanned || 0,
      missed: p.missed || 0,
      incidents: p.incidents || 0,
      lastCheckpoint: p.lastCheckpoint || 'Main Gate A',
    }));
  }, [patrols, defaultPatrolList, assignedSite, guardName, guardId]);

  // Filter records for selected date only
  const recordsForDate = useMemo(() => {
    return allPatrolsList.filter((item) => {
      const itemDateFormatted = formatDisplayDate(item.date);
      return itemDateFormatted.toLowerCase() === displayTitleDate.toLowerCase();
    });
  }, [allPatrolsList, displayTitleDate]);

  const getStatusBadgeStyle = (statusStr?: string) => {
    const s = (statusStr || '').toLowerCase();
    if (s === 'completed') return { bg: '#D1FAE5', text: '#059669' };
    if (s === 'in progress' || s === 'in_progress') return { bg: '#E0F2FE', text: '#0284C7' };
    if (s === 'assigned' || s === 'pending') return { bg: '#FEF3C7', text: '#D97706' };
    return { bg: '#FEE2E2', text: '#DC2626' };
  };

  return (
    <ScreenLayout activeRoute="Patrol">
      <PageHeader title={`Patrols — ${displayTitleDate}`} showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Summary Banner */}
        <View style={styles.summaryHeader}>
          <Heading level="h3" color="primary">{displayTitleDate}</Heading>
          <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
            {recordsForDate.length} Patrol{recordsForDate.length !== 1 ? 's' : ''} logged for this date
          </AppText>
        </View>

        {recordsForDate.length === 0 ? (
          <Card style={styles.emptyCard}>
            <NavIcon name="patrol" size={32} color="#94A3B8" />
            <Heading level="h4" color="primary" style={{ marginTop: 10 }}>
              No patrols for {displayTitleDate}
            </Heading>
            <AppText size="xs" color="secondary" style={{ marginTop: 4, textAlign: 'center' }}>
              No patrol activity recorded on this date.
            </AppText>
          </Card>
        ) : (
          recordsForDate.map((item) => {
            const badgeStyle = getStatusBadgeStyle(item.status);
            const isCompleted = item.status === 'Completed';

            return (
              <Card key={item.id} style={styles.patrolCard}>
                <View style={styles.cardHeaderRow}>
                  {/* Left Column */}
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Heading level="h4" color="primary">
                      {item.title}
                    </Heading>
                    <AppText size="xs" color="secondary" weight="medium" style={{ marginTop: 2 }}>
                      ID: {item.patrolCode || item.id} • {item.site}
                    </AppText>
                  </View>

                  {/* Right Action: EYE ICON BUTTON ONLY (NO TEXT "View") */}
                  <TouchableOpacity
                    style={styles.eyeIconButton}
                    onPress={() => navigation.navigate('PatrolDetails', { patrolId: item.id })}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`View patrol details for ${item.title}`}
                  >
                    <NavIcon name="eye" size={18} color="#4F46E5" />
                  </TouchableOpacity>
                </View>

                {/* Status & Checkpoints Badges */}
                <View style={styles.badgesRow}>
                  <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
                    <AppText size="xs" weight="bold" style={{ color: badgeStyle.text }}>
                      ● {item.status}
                    </AppText>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9' }]}>
                    <AppText size="xs" weight="bold" style={{ color: '#475569' }}>
                      ● {item.scanned}/{item.checkpoints} Checkpoints
                    </AppText>
                  </View>
                </View>

                {/* Details Grid */}
                <View style={styles.detailsGrid}>
                  {item.route ? (
                    <View style={styles.detailItemRow}>
                      <AppText size="xs" color="secondary">Route:</AppText>
                      <AppText size="xs" weight="semibold" color="primary" style={{ marginLeft: 4 }}>
                        {item.route}
                      </AppText>
                    </View>
                  ) : null}

                  <View style={styles.detailItemRow}>
                    <AppText size="xs" color="secondary">Started:</AppText>
                    <AppText size="xs" weight="semibold" color="primary" style={{ marginLeft: 4 }}>
                      {item.startTime}
                    </AppText>
                  </View>

                  {isCompleted && item.endTime ? (
                    <View style={styles.detailItemRow}>
                      <AppText size="xs" color="secondary">Completed:</AppText>
                      <AppText size="xs" weight="semibold" style={{ color: '#059669', marginLeft: 4 }}>
                        {item.endTime}
                      </AppText>
                    </View>
                  ) : (
                    <View style={styles.detailItemRow}>
                      <AppText size="xs" color="secondary">Last Checkpoint:</AppText>
                      <AppText size="xs" weight="semibold" color="primary" style={{ marginLeft: 4 }}>
                        {item.lastCheckpoint || 'Main Gate'}
                      </AppText>
                    </View>
                  )}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryHeader: {
    marginBottom: 14,
  },
  patrolCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eyeIconButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  detailsGrid: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 4,
  },
  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
});
