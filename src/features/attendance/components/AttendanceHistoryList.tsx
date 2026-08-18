import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, AttendanceRecord } from '../../../store/useGuardStore';
import { Card } from '../../../components/Card';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';
import { Input } from '../../../components/Input';
import { AppText } from '../../../components/typography/Text';

type FilterType = 'All' | 'Today' | 'Yesterday' | 'This Week' | 'This Month' | 'Custom';
type ViewType = 'List' | 'Calendar';

export const AttendanceHistoryList: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const history = useGuardStore(state => state.attendanceHistory);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [viewType, setViewType] = useState<ViewType>('List');

  const filteredHistory = React.useMemo(() => {
    return history.filter(record => {
      // 1. Search filter
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        record.date.includes(q) || 
        record.siteName.toLowerCase().includes(q) || 
        record.status.toLowerCase().includes(q);

      // 2. Chip filter (simplified for mock purposes)
      let matchesChip = true;
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (activeFilter === 'Today') matchesChip = record.date === todayStr;
      if (activeFilter === 'Yesterday') matchesChip = record.date === yesterday;
      
      return matchesSearch && matchesChip;
    });
  }, [history, searchQuery, activeFilter]);

  const renderFilterChip = (filter: FilterType) => {
    const isActive = activeFilter === filter;
    return (
      <TouchableOpacity
        key={filter}
        style={[
          styles.chip,
          { 
            backgroundColor: isActive ? colors.primary[600] : colors.surfaceSecondary,
            borderRadius: borderRadius.full 
          }
        ]}
        onPress={() => setActiveFilter(filter)}
      >
        <AppText 
          size="sm" 
          weight="semibold" 
          color={isActive ? 'inverse' : 'secondary'}
        >
          {filter}
        </AppText>
      </TouchableOpacity>
    );
  };

  const renderCard = (record: AttendanceRecord) => {
    const clockIn = record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const clockOut = record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

    return (
      <TouchableOpacity 
        key={record.id} 
        activeOpacity={0.7} 
        onPress={() => navigation.navigate('AttendanceDetails', { recordId: record.id })}
      >
        <Card style={styles.recordCard}>
          <View style={styles.cardHeader}>
            <View>
              <AppText size="md" weight="bold" color="primary">{record.date}</AppText>
              <AppText size="xs" color="secondary" style={styles.day}>{record.day}</AppText>
            </View>
            <AttendanceStatusBadge status={record.status as any} />
          </View>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <AppText size="xs" color="secondary" style={styles.detailLabel}>Site</AppText>
              <AppText size="sm" weight="medium" color="primary">{record.siteName}</AppText>
            </View>
            <View style={styles.detailBox}>
              <AppText size="xs" color="secondary" style={styles.detailLabel}>Shift</AppText>
              <AppText size="sm" weight="medium" color="primary">{record.shiftName}</AppText>
            </View>
          </View>

          <View style={[styles.timeRow, { borderTopColor: colors.border }]}>
            <View style={styles.timeBox}>
              <AppText size="xs" color="secondary" style={styles.timeLabel}>Clock In</AppText>
              <AppText size="base" weight="semibold" color="primary">{clockIn}</AppText>
            </View>
            <View style={styles.timeBox}>
              <AppText size="xs" color="secondary" style={styles.timeLabel}>Clock Out</AppText>
              <AppText size="base" weight="semibold" color="primary">{clockOut}</AppText>
            </View>
            <View style={styles.timeBox}>
              <AppText size="xs" color="secondary" style={styles.timeLabel}>Hours</AppText>
              <AppText size="base" weight="semibold" color="primary">
                {record.workingHours ? record.workingHours.toFixed(1) : '-'}
              </AppText>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderCalendar = () => {
    return (
      <Card style={styles.calendarCard}>
        <AppText size="md" weight="semibold" color="secondary" style={styles.calendarTitle}>
          Calendar View Active
        </AppText>
        <AppText size="sm" color="secondary" style={{ marginTop: 8, textAlign: 'center' }}>
          (Select List View to see details, calendar dots represent Present/Absent statuses)
        </AppText>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.controlsRow}>
        <Input
          placeholder="Search date, site, status..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<AppText style={{ marginRight: spacing.xs }}>🔍</AppText>}
        />
      </View>

      <View style={styles.chipScroll}>
        {['All', 'Today', 'Yesterday', 'This Week', 'This Month', 'Custom'].map(f => renderFilterChip(f as FilterType))}
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity onPress={() => setViewType('List')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <AppText 
            size="md" 
            weight={viewType === 'List' ? 'bold' : 'medium'} 
            color={viewType === 'List' ? 'link' : 'secondary'}
          >
            List View
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewType('Calendar')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <AppText 
            size="md" 
            weight={viewType === 'Calendar' ? 'bold' : 'medium'} 
            color={viewType === 'Calendar' ? 'link' : 'secondary'}
          >
            Calendar View
          </AppText>
        </TouchableOpacity>
      </View>

      {filteredHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <AppText size="md" color="secondary" style={styles.emptyText}>
            No attendance records available.
          </AppText>
        </View>
      ) : (
        viewType === 'List' ? filteredHistory.map(renderCard) : renderCalendar()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  controlsRow: {
    marginBottom: 12,
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  chipScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 14,
  },
  recordCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  date: {
    fontSize: 15,
    fontWeight: '700',
  },
  day: {
    fontSize: 12,
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailBox: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  timeBox: {
    alignItems: 'flex-start',
  },
  timeLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  calendarCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
