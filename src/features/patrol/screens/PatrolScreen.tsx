import React, { useState, useEffect, useMemo } from 'react';
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
import { StatusBadge } from '../../../components/StatusBadge';
import { useGuardStore, DBPatrol } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';
import {
  formatDisplayDate,
  formatDateGroupHeader,
} from '../../../utils/dateUtils';
import { getPatrolAvailability } from '../utils/patrolUtils';

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
  { label: 'Assigned / Scheduled', value: 'Assigned' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Expired / Missed', value: 'Missed' },
];

export const PatrolScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    patrols,
    assignedSite,
    startPatrol,
  } = useGuardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Live timer tick every 10 seconds for dynamic button updates
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const allPatrolList: DBPatrol[] = useMemo(() => {
    return patrols || [];
  }, [patrols]);

  // Find active or next eligible patrol for today using live date & time
  const activeOrNextPatrol = useMemo(() => {
    const todayStr = formatDisplayDate(now.toISOString());
    const todayPatrols = allPatrolList.filter(p => formatDisplayDate(p.date) === todayStr);

    const inProgress = todayPatrols.find(p => p.status === 'In Progress' || p.status === 'in_progress');
    if (inProgress) return inProgress;

    // Find next available scheduled patrol for today
    const available = todayPatrols.find(p => {
      const avail = getPatrolAvailability(p, 15, now);
      return avail.canStart;
    });

    if (available) return available;

    return todayPatrols.find(p => p.status !== 'Completed' && p.status !== 'completed') || todayPatrols[0] || allPatrolList[0];
  }, [allPatrolList, now]);

  const activeAvailability = useMemo(() => {
    if (!activeOrNextPatrol) return null;
    return getPatrolAvailability(activeOrNextPatrol, 15, now);
  }, [activeOrNextPatrol, now]);

  // Filter list based on search query & status filter
  const filteredPatrols = useMemo(() => {
    return allPatrolList.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = (item.title || '').toLowerCase().includes(q);
        const matchesCode = (item.patrolCode || item.id || '').toLowerCase().includes(q);
        const matchesSite = (item.site || '').toLowerCase().includes(q);
        const matchesRoute = (item.route || '').toLowerCase().includes(q);
        const matchesDate = (item.date || '').toLowerCase().includes(q);

        if (!matchesTitle && !matchesCode && !matchesSite && !matchesRoute && !matchesDate) {
          return false;
        }
      }

      if (statusFilter !== 'All') {
        const st = (item.status || '').toLowerCase();
        const f = statusFilter.toLowerCase();
        if (f === 'assigned' && st !== 'assigned' && st !== 'scheduled') return false;
        if (f === 'in progress' && st !== 'in progress' && st !== 'in_progress') return false;
        if (f === 'completed' && st !== 'completed') return false;
        if (f === 'missed' && st !== 'missed' && st !== 'expired') return false;
      }

      return true;
    });
  }, [allPatrolList, searchQuery, statusFilter]);

  // Aggregate into Date-wise Summary Cards (ONE CARD PER DATE)
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
      const overallStatus = hasInProgress ? 'In Progress' : (completedCount === totalPatrols ? 'Completed' : 'Scheduled');

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
    if (!activeOrNextPatrol) {
      Alert.alert('No Patrol Available', 'There are no active or scheduled patrols for today.');
      return;
    }

    const avail = activeAvailability;
    if (!avail) return;

    if (avail.isInProgress || avail.isCompleted) {
      navigation.navigate('PatrolDetails', { patrolId: activeOrNextPatrol.id });
      return;
    }

    if (!avail.canStart) {
      if (avail.isBeforeBuffer) {
        Alert.alert(
          'Patrol Not Available Yet',
          `This patrol is scheduled for ${activeOrNextPatrol.scheduledStartTime || activeOrNextPatrol.startTime}. You can start it from ${avail.startWindowStartStr} (15-min buffer window).`
        );
      } else {
        Alert.alert('Patrol Status', avail.buttonText);
      }
      return;
    }

    if (startPatrol) {
      await startPatrol(activeOrNextPatrol.id);
    }
    navigation.navigate('PatrolDetails', { patrolId: activeOrNextPatrol.id });
  };

  return (
    <ScreenLayout activeRoute="Patrol">
      <PageHeader title="Patrol Logs" showBack />

      <View style={styles.headerSubtitleContainer}>
        <AppText size="sm" color="secondary" style={styles.headerSubtitleText}>
          View assigned and completed patrol activities by date for {assignedSite || 'Ahmedabad Plant'}.
        </AppText>
      </View>

      {/* Search & Dropdown Filter Row */}
      <View style={styles.searchFilterRow}>
        <View style={styles.searchInputWrapper}>
          <View style={{ marginRight: 8 }}>
            <NavIcon name="search" size={18} color="#64748B" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by patrol, site, date..."
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

        {/* Dropdown Filter Trigger */}
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setDropdownOpen(!dropdownOpen)}
          activeOpacity={0.8}
        >
          <AppText size="sm" weight="bold" style={{ color: '#475569', marginRight: 4 }}>
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
                  size="sm"
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

      {/* DATE-ONLY SUMMARY LIST */}
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {dateSummaries.length === 0 ? (
            <Card style={styles.emptyCard}>
              <NavIcon name="patrol" size={40} color="#94A3B8" />
              <Heading level="h3" color="primary" style={{ marginTop: 12, fontSize: 18 }}>
                No patrols found
              </Heading>
              <AppText size="sm" color="secondary" style={{ textAlign: 'center', marginTop: 6 }}>
                Try changing your search or filter options.
              </AppText>
            </Card>
          ) : (
            dateSummaries.map((summary) => {
              return (
                <Card key={summary.dateStr} style={styles.dateSummaryCard}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('PatrolDateLogs', { dateStr: summary.dateStr })}
                    style={styles.cardRow}
                  >
                    {/* Left Column: Date & Aggregated Stats */}
                    <View style={{ flex: 1 }}>
                      <Heading level="h3" color="primary" style={styles.dateHeaderTitle}>
                        {summary.displayHeader}
                      </Heading>

                      <AppText style={styles.patrolCountText}>
                        {summary.totalPatrols} Patrol{summary.totalPatrols > 1 ? 's' : ''} Assigned
                      </AppText>

                      <AppText style={styles.patrolSubStatsText}>
                        {summary.inProgressCount > 0 ? `${summary.inProgressCount} In Progress • ` : ''}
                        {summary.completedCount} Completed
                      </AppText>

                      <View style={{ marginTop: 10 }}>
                        <StatusBadge status={summary.overallStatus} size="sm" />
                      </View>
                    </View>

                    {/* Right Eye Icon Button */}
                    <TouchableOpacity
                      style={styles.eyeIconButton}
                      onPress={() => navigation.navigate('PatrolDateLogs', { dateStr: summary.dateStr })}
                      activeOpacity={0.7}
                    >
                      <NavIcon name="eye" size={22} color="#4F46E5" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Card>
              );
            })
          )}
        </ScrollView>

        {/* Fixed Bottom Action Button */}
        <View style={styles.fixedBottomButtonContainer}>
          <Button
            title={activeAvailability ? activeAvailability.buttonText : "START PATROLLING"}
            variant="primary"
            size="large"
            fullWidth
            disabled={activeAvailability ? (!activeAvailability.canStart && !activeAvailability.isInProgress && !activeAvailability.isCompleted) : false}
            onPress={handleStartPatrolAction}
            style={[
              { height: 56, backgroundColor: '#2563EB', borderRadius: 10 },
              activeAvailability?.isInProgress && { backgroundColor: '#0284C7' },
              activeAvailability?.isCompleted && { backgroundColor: '#059669' },
            ]}
          />
        </View>
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
  headerSubtitleText: {
    fontSize: 14.5,
    color: '#64748B',
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
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 0,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 14,
  },
  dropdownMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 6,
    marginHorizontal: 16,
    marginBottom: 14,
    elevation: 4,
  },
  dropdownMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 6,
    minHeight: 46,
    justifyContent: 'center',
  },
  dropdownMenuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 94,
  },
  dateSummaryCard: {
    padding: 18,
    marginBottom: 14,
    borderRadius: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  patrolCountText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#475569',
    marginTop: 4,
  },
  patrolSubStatsText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 3,
  },
  eyeIconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
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
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 8,
  },
});
