import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation.types';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { TaskCard } from '../components/TaskCard';
import { NavIcon } from '../../../components/NavIcon';
import { FilterBottomSheet } from '../../../components/FilterBottomSheet';

type Props = NativeStackScreenProps<HomeStackParamList, 'Tasks'>;

export const TasksScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, spacing, borderRadius } = useTheme();
  const { tasks, guardId, guardEmail, loadGuardData } = useGuardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [priorityFilterOpen, setPriorityFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const statusOptions = [
    { label: 'All Statuses', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Under Review', value: 'Under Review' },
    { label: 'Completed', value: 'Completed' },
  ];

  const priorityOptions = [
    { label: 'All Priorities', value: 'All' },
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    if (guardId && guardEmail) {
      await loadGuardData(guardId, guardEmail);
    }
    setRefreshing(false);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (selectedStatus !== 'All' && task.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'All' && task.priority.toLowerCase() !== selectedPriority.toLowerCase()) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesRef = task.taskReference.toLowerCase().includes(query);
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesSite = task.site.toLowerCase().includes(query);
        const matchesInstr = (task.instructions || '').toLowerCase().includes(query);
        return matchesRef || matchesTitle || matchesSite || matchesInstr;
      }

      return true;
    });
  }, [tasks, selectedStatus, selectedPriority, searchQuery]);

  return (
    <ScreenLayout>
      <PageHeader
        title="My Tasks"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Search Input Row */}
      <View style={[styles.searchRow, { paddingHorizontal: spacing.base }]}>
        <View
          style={[
            styles.searchInputWrapper,
            { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
          ]}
        >
          <View style={{ marginRight: 8 }}>
            <NavIcon name="search" size={20} color="#64748B" />
          </View>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search tasks by title, ref, location..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn} activeOpacity={0.7}>
              <AppText style={styles.clearText}>✕</AppText>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Row: Status & Priority Filters */}
      <View style={[styles.filtersRow, { paddingHorizontal: spacing.base }]}>
        {/* Status Filter Trigger */}
        <TouchableOpacity
          style={[
            styles.filterTrigger,
            {
              backgroundColor: selectedStatus !== 'All' ? colors.primary[50] : colors.surface,
              borderColor: selectedStatus !== 'All' ? colors.primary[400] : colors.border,
              borderRadius: borderRadius.md,
            },
          ]}
          onPress={() => setStatusFilterOpen(true)}
          activeOpacity={0.8}
        >
          <AppText style={[styles.filterTriggerText, { color: selectedStatus !== 'All' ? colors.primary[600] : colors.text }]}>
            Status: {selectedStatus}
          </AppText>
          <AppText style={styles.filterArrow}>▼</AppText>
        </TouchableOpacity>

        {/* Priority Filter Trigger */}
        <TouchableOpacity
          style={[
            styles.filterTrigger,
            {
              backgroundColor: selectedPriority !== 'All' ? colors.primary[50] : colors.surface,
              borderColor: selectedPriority !== 'All' ? colors.primary[400] : colors.border,
              borderRadius: borderRadius.md,
            },
          ]}
          onPress={() => setPriorityFilterOpen(true)}
          activeOpacity={0.8}
        >
          <AppText style={[styles.filterTriggerText, { color: selectedPriority !== 'All' ? colors.primary[600] : colors.text }]}>
            Priority: {selectedPriority}
          </AppText>
          <AppText style={styles.filterArrow}>▼</AppText>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheets for Filters */}
      <FilterBottomSheet
        visible={statusFilterOpen}
        onClose={() => setStatusFilterOpen(false)}
        title="Filter by Status"
        options={statusOptions}
        selectedValue={selectedStatus}
        onSelect={(val) => {
          setStatusFilterOpen(false);
          setSelectedStatus(val);
        }}
      />

      <FilterBottomSheet
        visible={priorityFilterOpen}
        onClose={() => setPriorityFilterOpen(false)}
        title="Filter by Priority"
        options={priorityOptions}
        selectedValue={selectedPriority}
        onSelect={(val) => {
          setPriorityFilterOpen(false);
          setSelectedPriority(val);
        }}
      />

      {/* Task Count & Active Filters Indicator */}
      <View style={[styles.countRow, { paddingHorizontal: spacing.base }]}>
        <AppText style={[styles.countText, { color: colors.textTertiary }]}>
          Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </AppText>
        {(selectedStatus !== 'All' || selectedPriority !== 'All' || searchQuery) && (
          <TouchableOpacity
            onPress={() => {
              setSelectedStatus('All');
              setSelectedPriority('All');
              setSearchQuery('');
            }}
            activeOpacity={0.7}
          >
            <AppText style={[styles.resetText, { color: colors.primary[600] }]}>Reset Filters</AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: spacing.base },
          filteredTasks.length === 0 && styles.emptyContainer,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary[600]]} />
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyStateBox}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.surfaceSecondary }]}>
              <NavIcon name="shifts" size={36} color={colors.textTertiary} />
            </View>
            <AppText style={[styles.emptyTitle, { color: colors.text }]}>No Tasks Found</AppText>
            <AppText style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
              {searchQuery || selectedStatus !== 'All' || selectedPriority !== 'All'
                ? 'No tasks match your selected filters. Try clearing the filter options.'
                : 'You have no assigned tasks at this time. All assigned tasks will show here.'}
            </AppText>
          </View>
        }
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    marginBottom: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 56,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  clearBtn: {
    padding: 6,
  },
  clearText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  filterTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 56,
  },
  filterTriggerText: {
    fontSize: 15,
    fontWeight: '700',
  },
  filterArrow: {
    fontSize: 12,
    color: '#64748B',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  countText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  resetText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 30,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14.5,
    textAlign: 'center',
    lineHeight: 22,
  },
});
