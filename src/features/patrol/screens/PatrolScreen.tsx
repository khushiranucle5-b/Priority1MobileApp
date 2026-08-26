import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { StatusBadge } from '../../../components/StatusBadge';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, DBPatrol } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';
import {
  formatDisplayDate,
  formatDateGroupHeader,
} from '../../../utils/dateUtils';
import { getPatrolAvailability, findCurrentPatrol, useLiveNow } from '../utils/patrolUtils';

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

const parseDateToTimestamp = (dateVal: string | number | null | undefined): number => {
  if (!dateVal) return 0;
  if (typeof dateVal === 'number') return dateVal;

  const str = String(dateVal).trim();

  const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(year, month, day).getTime();
  }

  const months: { [key: string]: number } = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };

  const parts = str.replace(/,/g, '').split(/\s+/);
  if (parts.length >= 3) {
    const mIdx = months[parts[0].toLowerCase().slice(0, 3)];
    if (mIdx !== undefined) {
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(year)) {
        return new Date(year, mIdx, day).getTime();
      }
    }
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

const filterOptions = [
  { label: 'All', value: 'All' },
  { label: 'Assigned / Scheduled', value: 'Assigned' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Expired / Missed', value: 'Missed' },
];

export const PatrolScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { colors, spacing, borderRadius } = useTheme();
  const {
    patrols,
    assignedSite,
    startPatrol,
    ensurePatrolsForDate,
    isClockedIn,
    loadGuardData,
    guardId,
    guardEmail,
  } = useGuardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isFocused && guardId) {
      loadGuardData(guardId, guardEmail || '');
    }
  }, [isFocused, guardId, guardEmail, loadGuardData]);

  // Live timer tick & foreground listener for dynamic button updates
  const now = useLiveNow(5000);
  useEffect(() => {
    if (ensurePatrolsForDate) {
      ensurePatrolsForDate(now);
    }
  }, [now, ensurePatrolsForDate]);

  const allPatrolList: DBPatrol[] = useMemo(() => {
    return patrols || [];
  }, [patrols]);

  // Find active or next eligible patrol for today using live date & time
  const activeOrNextPatrol = useMemo(() => {
    return findCurrentPatrol(allPatrolList, now);
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

  // Aggregate into Date-wise Summary Cards (ONE CARD PER DATE - NEWEST ON TOP)
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

      const rawDate = items[0]?.date || dateStr;
      const ts = parseDateToTimestamp(rawDate) || parseDateToTimestamp(dateStr);

      const todayStartMs = new Date().setHours(0, 0, 0, 0);
      const isPastDate = ts < todayStartMs;

      const hasInProgress = inProgressCount > 0;
      let overallStatus = 'Scheduled';
      if (hasInProgress) {
        overallStatus = 'In Progress';
      } else if (completedCount === totalPatrols && totalPatrols > 0) {
        overallStatus = 'Completed';
      } else if (isPastDate) {
        overallStatus = completedCount > 0 ? 'Completed' : 'Missed';
      } else {
        overallStatus = 'Scheduled';
      }

      return {
        dateStr,
        displayHeader: formatDateGroupHeader(dateStr),
        totalPatrols,
        inProgressCount,
        completedCount,
        overallStatus,
        latestTimestamp: ts,
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
      navigation.navigate('PatrolDetails', { patrolId: activeOrNextPatrol.id, patrol: activeOrNextPatrol });
      return;
    }

    if (!isClockedIn) {
      Alert.alert(
        'Clock In Required',
        'You must clock in before starting a patrol. Please clock in first.'
      );
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
    navigation.navigate('PatrolDetails', { patrolId: activeOrNextPatrol.id, patrol: activeOrNextPatrol });
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
                <Card key={summary.dateStr} variant="outlined" style={styles.card}>
                  <View style={styles.headerRow}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <AppText size="lg" weight="bold" color="primary" style={styles.cardHeaderTitle}>
                        {summary.displayHeader}
                      </AppText>
                    </View>
                    <StatusBadge status={summary.overallStatus} size="md" />
                  </View>

                  <View style={[styles.detailRow, { marginTop: spacing.sm || 10 }]}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <AppText size="xs" color="secondary" weight="semibold" style={styles.metaLabelText}>PATROLS ASSIGNED</AppText>
                      <AppText size="base" weight="bold" color="primary" style={styles.metaValueText}>
                        {summary.totalPatrols} Patrol{summary.totalPatrols > 1 ? 's' : ''}
                      </AppText>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <AppText size="xs" color="secondary" weight="semibold" style={styles.metaLabelText}>COMPLETED</AppText>
                      <AppText size="base" weight="bold" style={[styles.metaValueText, { color: colors.primary[600] || '#2563EB' }]}>
                        {summary.completedCount} / {summary.totalPatrols}
                      </AppText>
                    </View>
                  </View>

                  {summary.inProgressCount > 0 && (
                    <View style={{ marginTop: 10 }}>
                      <AppText size="xs" color="secondary" weight="semibold" style={styles.metaLabelText}>STATUS</AppText>
                      <AppText size="base" color="text" weight="bold" style={styles.metaValueText}>
                        {summary.inProgressCount} Patrol(s) In Progress
                      </AppText>
                    </View>
                  )}

                  <View style={[styles.actionsRow, { borderTopColor: colors.border || '#E2E8F0' }]}>
                    <TouchableOpacity
                      style={styles.iconActionBtnView}
                      onPress={() => navigation.navigate('PatrolDateLogs', { dateStr: summary.dateStr })}
                      activeOpacity={0.7}
                      accessibilityLabel="View patrol date logs"
                      accessibilityRole="button"
                    >
                      <NavIcon name="eye" size={24} color="#4F46E5" />
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>

        {/* Floating Action Button (Matching LeaveScreen FAB) */}
        <TouchableOpacity
          style={[
            styles.floatingButton,
            activeAvailability?.isInProgress && { backgroundColor: '#0284C7' },
            activeAvailability?.isCompleted && { backgroundColor: '#059669' },
            (activeAvailability?.isExpired || (!activeAvailability?.canStart && !activeAvailability?.isInProgress && !activeAvailability?.isCompleted)) && { backgroundColor: '#94A3B8' },
          ]}
          activeOpacity={0.85}
          disabled={activeAvailability ? (activeAvailability.isExpired || (!activeAvailability.canStart && !activeAvailability.isInProgress && !activeAvailability.isCompleted)) : false}
          onPress={handleStartPatrolAction}
        >
          <NavIcon name="patrol" size={24} color="#FFFFFF" />
          <AppText size="base" weight="bold" style={styles.floatingButtonText}>
            {activeAvailability ? activeAvailability.buttonText : "START PATROLLING"}
          </AppText>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  headerSubtitleContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  headerSubtitleText: {
    fontSize: 15,
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
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 56,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: '#0F172A',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 14,
  },
  dropdownMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 4,
  },
  dropdownMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 6,
    minHeight: 48,
    justifyContent: 'center',
  },
  dropdownMenuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 96,
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
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    color: '#0F172A',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  metaLabelText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metaValueText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 3,
    lineHeight: 22,
    color: '#0F172A',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  iconActionBtnView: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5B46E5',
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 999,
    gap: 8,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
