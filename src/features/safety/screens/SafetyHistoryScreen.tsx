import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useGuardStore, LoneWorkerHistoryItem } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';
import {
  formatDisplayDate,
  formatDateGroupHeader,
} from '../../../utils/dateUtils';

interface DateSummary {
  dateStr: string;
  displayHeader: string;
  totalChecks: number;
  gpsVerifiedCount: number;
  overallStatus: string;
  latestTimestamp: number;
  items: LoneWorkerHistoryItem[];
}

const filterOptions = [
  { label: 'All', value: 'All' },
  { label: 'Safe', value: 'Safe' },
  { label: 'Issue', value: 'Issue' },
  { label: 'Missed', value: 'Missed' },
  { label: 'GPS Verified', value: 'GPS Verified' },
  { label: 'Not Verified', value: 'Not Verified' },
  { label: 'On Time', value: 'On Time' },
  { label: 'Late', value: 'Late' },
];

export const SafetyHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { guardId, guardName, loneWorkerHistory } = useGuardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Single source of truth for logged-in guard
  const rawHistory = useMemo(() => {
    return (loneWorkerHistory || []).filter((item) => {
      if (!item) return false;
      const matchesId = guardId && item.guardId && item.guardId === guardId;
      const matchesName = guardName && item.guardName && item.guardName.toLowerCase() === guardName.toLowerCase();
      const isDefaultGuard = !item.guardId || item.guardId === 'guard-1' || item.guardName === 'Khushi Rani';
      return matchesId || matchesName || isDefaultGuard;
    });
  }, [loneWorkerHistory, guardId, guardName]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setDropdownOpen(false);
  };

  // Filtered raw items based on search query & dropdown filter
  const filteredHistory = useMemo(() => {
    return rawHistory.filter((item) => {
      // 1. Search Query (Date, Site, Guard, Status, GPS, Timing)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesDate = (item.dateStr || '').toLowerCase().includes(q);
        const matchesTime = (item.exactTime || '').toLowerCase().includes(q);
        const matchesSite = (item.siteName || '').toLowerCase().includes(q);
        const matchesGuard = (item.guardName || '').toLowerCase().includes(q);
        const matchesStatus = (item.status || '').toLowerCase().includes(q);
        const matchesGps = (item.gpsStatus || '').toLowerCase().includes(q);
        const matchesTiming = (item.onTimeStatus || '').toLowerCase().includes(q);
        if (
          !matchesDate &&
          !matchesTime &&
          !matchesSite &&
          !matchesGuard &&
          !matchesStatus &&
          !matchesGps &&
          !matchesTiming
        ) {
          return false;
        }
      }

      // 2. Dropdown Filter Selection
      if (statusFilter === 'Safe' && item.status !== 'Safe' && item.status !== 'SAFE') return false;
      if (
        statusFilter === 'Issue' &&
        !item.status?.toLowerCase().includes('issue') &&
        !item.status?.toLowerCase().includes('sos')
      ) {
        return false;
      }
      if (
        statusFilter === 'Missed' &&
        !item.status?.toLowerCase().includes('missed') &&
        !item.onTimeStatus?.toLowerCase().includes('missed')
      ) {
        return false;
      }
      if (statusFilter === 'GPS Verified' && item.gpsStatus !== 'GPS Verified') return false;
      if (statusFilter === 'Not Verified' && item.gpsStatus === 'GPS Verified') return false;
      if (statusFilter === 'On Time' && item.onTimeStatus !== 'On Time') return false;
      if (statusFilter === 'Late' && item.onTimeStatus === 'On Time') return false;

      return true;
    });
  }, [rawHistory, searchQuery, statusFilter]);

  // Aggregate into Date-wise Summary List (Level 1 — ONE CARD PER DATE)
  const dateSummaries: DateSummary[] = useMemo(() => {
    const map: { [dateKey: string]: LoneWorkerHistoryItem[] } = {};

    filteredHistory.forEach((item) => {
      const dateKey = formatDisplayDate(item.dateStr || item.timestamp);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(item);
    });

    const summaries: DateSummary[] = Object.keys(map).map((dateStr) => {
      const items = map[dateStr];
      const totalChecks = items.length;
      const gpsVerifiedCount = items.filter((i) => i.gpsStatus === 'GPS Verified').length;

      const hasIssue = items.some(
        (i) => i.status === 'SOS / Issue Reported' || i.status?.toLowerCase().includes('issue') || i.status?.toLowerCase().includes('sos')
      );
      const overallStatus = hasIssue ? 'SOS / Issue Reported' : 'Safe';

      const latestTimestamp = Math.max(...items.map((i) => i.timestamp || 0));

      return {
        dateStr,
        displayHeader: formatDateGroupHeader(dateStr),
        totalChecks,
        gpsVerifiedCount,
        overallStatus,
        latestTimestamp,
        items,
      };
    });

    // Sort summaries newest date first
    summaries.sort((a, b) => b.latestTimestamp - a.latestTimestamp);
    return summaries;
  }, [filteredHistory]);

  return (
    <ScreenLayout activeRoute="LoneWorker">
      <PageHeader title="Safety Check History" showBack />

      {/* Search & Dropdown Filter Row (Identical to Incident Reports UI Pattern) */}
      <View style={styles.searchFilterRow}>
        <View style={styles.searchInputWrapper}>
          <View style={{ marginRight: 8 }}>
            <NavIcon name="search" size={16} color="#64748B" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by date, site, status..."
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
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {dateSummaries.length === 0 ? (
          <Card style={styles.emptyCard}>
            <NavIcon name="loneworker" size={36} color="#94A3B8" />
            <Heading level="h4" color="primary" style={{ marginTop: 12 }}>
              {rawHistory.length === 0 ? 'No safety check history' : 'No matching safety checks'}
            </Heading>
            <AppText size="sm" color="secondary" style={{ textAlign: 'center', marginTop: 6 }}>
              {rawHistory.length === 0
                ? 'Your completed safety checks will appear here.'
                : 'Try changing your search or filter options.'}
            </AppText>
            {statusFilter !== 'All' || searchQuery ? (
              <Button
                title="Reset Filters"
                variant="outline"
                size="small"
                onPress={resetFilters}
                style={{ marginTop: 14 }}
              />
            ) : null}
          </Card>
        ) : (
          dateSummaries.map((summary) => {
            const isSafe = summary.overallStatus === 'Safe';
            const statusColor = isSafe ? '#059669' : '#DC2626';
            const statusBg = isSafe ? '#D1FAE5' : '#FEE2E2';

            return (
              <Card key={summary.dateStr} style={styles.dateSummaryCard}>
                <View style={styles.cardRow}>
                  {/* Left Column: Date & Aggregated Stats */}
                  <View style={{ flex: 1 }}>
                    <Heading level="h4" color="primary">
                      {summary.displayHeader}
                    </Heading>

                    <AppText size="sm" color="secondary" weight="semibold" style={{ marginTop: 4 }}>
                      {summary.totalChecks} Safety Check{summary.totalChecks > 1 ? 's' : ''}
                    </AppText>

                    <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                      {summary.gpsVerifiedCount} GPS Verified
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
                    onPress={() => navigation.navigate('SafetyDateChecks', { dateStr: summary.dateStr })}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`View history for ${summary.dateStr}`}
                  >
                    <NavIcon name="eye" size={18} color="#4F46E5" />
                  </TouchableOpacity>
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
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
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
    padding: 16,
    paddingBottom: 40,
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
});
