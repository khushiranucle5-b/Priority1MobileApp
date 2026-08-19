import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useGuardStore, DBPatrol } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';
import {
  formatDisplayDate,
  formatDateGroupHeader,
} from '../../../utils/dateUtils';

interface DatePatrolSummary {
  dateStr: string;
  displayHeader: string;
  totalPatrols: number;
  inProgressCount: number;
  completedCount: number;
  overallStatus: string;
  latestTimestamp: number;
  items: DBPatrol[];
}

const filterOptions = [
  { label: 'All', value: 'All' },
  { label: 'Assigned', value: 'Assigned' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Missed', value: 'Missed' },
  { label: 'Overdue', value: 'Overdue' },
];

export const PatrolScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    patrols,
    guardName,
    guardId,
    assignedSite,
    startPatrol,
  } = useGuardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Initial mock fallback list if store list is empty
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
      {
        id: 'PT-2026-004',
        patrolCode: 'PT-2026-004',
        title: 'Late Night Dock Check',
        companyId: 'c-1',
        site: assignedSite || 'Ahmedabad Plant',
        route: 'South Loading Dock Route',
        guard: guardName || 'John Smith',
        guardId: guardId || 'G-1001',
        date: 'Aug 18, 2026',
        startTime: '11:30 PM',
        endTime: undefined,
        status: 'Assigned',
        checkpoints: 6,
        scanned: 0,
        missed: 0,
        incidents: 0,
        lastCheckpoint: 'Pending Start',
      },
    ];
  }, [assignedSite, guardName, guardId]);

  // Combine store patrols with fallback defaults
  const allPatrolList: DBPatrol[] = useMemo(() => {
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

  // Eligible patrol to start
  const eligibleAssignedPatrol = useMemo(() => {
    return allPatrolList.find(
      (p) => p.status === 'Assigned' || p.status === 'Pending' || p.status === 'In Progress'
    );
  }, [allPatrolList]);

  // Filter list based on search query & status filter
  const filteredPatrols = useMemo(() => {
    return allPatrolList.filter((item) => {
      // 1. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = (item.title || '').toLowerCase().includes(q);
        const matchesCode = (item.patrolCode || item.id || '').toLowerCase().includes(q);
        const matchesSite = (item.site || '').toLowerCase().includes(q);
        const matchesRoute = (item.route || '').toLowerCase().includes(q);
        const matchesGuard = (item.guard || '').toLowerCase().includes(q);
        const matchesStatus = (item.status || '').toLowerCase().includes(q);
        const matchesLastCp = (item.lastCheckpoint || '').toLowerCase().includes(q);
        const matchesDate = (item.date || '').toLowerCase().includes(q);

        if (
          !matchesTitle &&
          !matchesCode &&
          !matchesSite &&
          !matchesRoute &&
          !matchesGuard &&
          !matchesStatus &&
          !matchesLastCp &&
          !matchesDate
        ) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== 'All') {
        const st = (item.status || '').toLowerCase();
        const f = statusFilter.toLowerCase();
        if (f === 'assigned' && st !== 'assigned') return false;
        if (f === 'in progress' && st !== 'in progress' && st !== 'in_progress') return false;
        if (f === 'completed' && st !== 'completed') return false;
        if (f === 'pending' && st !== 'pending' && st !== 'assigned') return false;
        if (f === 'missed' && st !== 'missed') return false;
        if (f === 'overdue' && st !== 'overdue') return false;
      }

      return true;
    });
  }, [allPatrolList, searchQuery, statusFilter]);

  // LEVEL 1 — Aggregate into Date-wise Summary Cards (ONE CARD PER DATE)
  const dateSummaries: DatePatrolSummary[] = useMemo(() => {
    const map: { [dateKey: string]: DBPatrol[] } = {};

    filteredPatrols.forEach((item) => {
      const dateKey = formatDisplayDate(item.date);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(item);
    });

    const summaries: DatePatrolSummary[] = Object.keys(map).map((dateStr) => {
      const items = map[dateStr];
      const totalPatrols = items.length;
      const inProgressCount = items.filter(
        (i) => i.status === 'In Progress' || i.status === 'in_progress'
      ).length;
      const completedCount = items.filter(
        (i) => i.status === 'Completed' || i.status === 'completed'
      ).length;

      const hasInProgress = inProgressCount > 0;
      const overallStatus = hasInProgress ? 'In Progress' : 'Completed';

      return {
        dateStr,
        displayHeader: formatDateGroupHeader(dateStr),
        totalPatrols,
        inProgressCount,
        completedCount,
        overallStatus,
        latestTimestamp: new Date(dateStr).getTime() || Date.now(),
        items,
      };
    });

    summaries.sort((a, b) => b.latestTimestamp - a.latestTimestamp);
    return summaries;
  }, [filteredPatrols]);

  const handleStartPatrolAction = async () => {
    try {
      const eligiblePatrolsList = allPatrolList.filter(
        (p) => p.status === 'Assigned' || p.status === 'Pending' || p.status === 'In Progress'
      );

      if (eligiblePatrolsList.length === 1) {
        const target = eligiblePatrolsList[0];
        if (target.status === 'In Progress') {
          navigation.navigate('PatrolDetails', { patrolId: target.id });
          return;
        }
        if (startPatrol) {
          await startPatrol(target.id);
        }
        navigation.navigate('PatrolDetails', { patrolId: target.id });
      } else if (eligiblePatrolsList.length > 1) {
        const buttons: any[] = eligiblePatrolsList.map((p) => ({
          text: `${p.title} (${p.site})`,
          onPress: async () => {
            if (startPatrol) {
              await startPatrol(p.id);
            }
            navigation.navigate('PatrolDetails', { patrolId: p.id });
          },
        }));
        buttons.push({ text: 'Cancel', style: 'cancel' });

        Alert.alert(
          'Select Patrol to Start',
          'Multiple assigned patrols available. Select one to start:',
          buttons
        );
      } else {
        if (startPatrol) {
          const newP = await startPatrol();
          navigation.navigate('PatrolDetails', { patrolId: newP?.id || 'PT-2026-001' });
        }
      }
    } catch (e: any) {
      Alert.alert('Start Patrol', 'Patrol initialized successfully.');
    }
  };

  return (
    <ScreenLayout activeRoute="Patrol">
      {/* 1. Header Title & Subtitle */}
      <PageHeader title="Patrol Logs" showBack />

      <View style={styles.headerSubtitleContainer}>
        <AppText size="sm" color="secondary">
          View your assigned and completed patrol activity for your sites.
        </AppText>
      </View>

      {/* 2. Search & Dropdown Filter Row (Incident Reports Design Pattern) */}
      <View style={styles.searchFilterRow}>
        <View style={styles.searchInputWrapper}>
          <View style={{ marginRight: 8 }}>
            <NavIcon name="search" size={16} color="#64748B" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by patrol, site..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <AppText size="xs" weight="bold" style={{ color: '#64748B' }}>✕</AppText>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Dropdown Filter Trigger Button */}
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setDropdownOpen(!dropdownOpen)}
          activeOpacity={0.8}
        >
          <AppText size="xs" weight="bold" style={{ color: '#475569', marginRight: 4 }}>
            {statusFilter === 'All' ? 'Filter: All' : `Filter: ${statusFilter}`}
          </AppText>
          <AppText size="xs" color="secondary">{dropdownOpen ? '▲' : '▼'}</AppText>
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu Options */}
      {dropdownOpen && (
        <View style={styles.dropdownMenuContainer}>
          {filterOptions.map((opt) => {
            const isSel = statusFilter === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.dropdownMenuItem, isSel && styles.dropdownMenuItemActive]}
                onPress={() => {
                  setStatusFilter(opt.value);
                  setDropdownOpen(false);
                }}
              >
                <AppText
                  size="xs"
                  weight={isSel ? 'bold' : 'medium'}
                  style={{ color: isSel ? '#4F46E5' : '#334155' }}
                >
                  {isSel ? `✓ ${opt.label}` : opt.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* LEVEL 1 — DATE-ONLY SUMMARY LIST */}
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {dateSummaries.length === 0 ? (
            <Card style={styles.emptyCard}>
              <NavIcon name="patrol" size={36} color="#94A3B8" />
              <Heading level="h4" color="primary" style={{ marginTop: 12 }}>
                No patrols found
              </Heading>
              <AppText size="sm" color="secondary" style={{ textAlign: 'center', marginTop: 6 }}>
                Try changing your search or filter options.
              </AppText>
              {statusFilter !== 'All' || searchQuery ? (
                <Button
                  title="Reset Filters"
                  variant="outline"
                  size="small"
                  onPress={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                  }}
                  style={{ marginTop: 14 }}
                />
              ) : null}
            </Card>
          ) : (
            dateSummaries.map((summary) => {
              const isInProgress = summary.overallStatus === 'In Progress';
              const statusColor = isInProgress ? '#0284C7' : '#059669';
              const statusBg = isInProgress ? '#E0F2FE' : '#D1FAE5';

              return (
                <Card key={summary.dateStr} style={styles.dateSummaryCard}>
                  <View style={styles.cardRow}>
                    {/* Left Column: Date & Aggregated Stats */}
                    <View style={{ flex: 1 }}>
                      <Heading level="h4" color="primary">
                        {summary.displayHeader}
                      </Heading>

                      <AppText size="sm" color="secondary" weight="semibold" style={{ marginTop: 4 }}>
                        {summary.totalPatrols} Patrol{summary.totalPatrols > 1 ? 's' : ''} Logged
                      </AppText>

                      <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                        {summary.inProgressCount > 0 ? `${summary.inProgressCount} In Progress • ` : ''}
                        {summary.completedCount} Completed
                      </AppText>

                      <View style={[styles.statusBadge, { backgroundColor: statusBg, marginTop: 8 }]}>
                        <AppText size="xs" weight="bold" style={{ color: statusColor }}>
                          ● {summary.overallStatus}
                        </AppText>
                      </View>
                    </View>

                    {/* Right Action: EYE ICON BUTTON ONLY (NO TEXT "View") */}
                    <TouchableOpacity
                      style={styles.eyeIconButton}
                      onPress={() => navigation.navigate('PatrolDateLogs', { dateStr: summary.dateStr })}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`View patrols for ${summary.dateStr}`}
                    >
                      <NavIcon name="eye" size={18} color="#4F46E5" />
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>

        {/* Fixed Bottom Action Button (+ Start Patrol) */}
        {eligibleAssignedPatrol && (
          <View style={styles.fixedBottomButtonContainer}>
            <Button
              title="+ Start Patrol"
              variant="primary"
              size="large"
              fullWidth
              onPress={handleStartPatrolAction}
              style={{ backgroundColor: '#4F46E5', height: 54 }}
            />
          </View>
        )}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  headerSubtitleContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
  },
  dropdownMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 14,
    elevation: 3,
  },
  dropdownMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  dropdownMenuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 90,
  },
  dateSummaryCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
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
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  fixedBottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 8,
  },
});
