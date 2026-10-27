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
import { DispatchCard } from '../components/DispatchCard';
import { NavIcon } from '../../../components/NavIcon';
import { FilterBottomSheet } from '../../../components/FilterBottomSheet';
import { TriangleAlert } from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'Dispatches'>;

export const DispatchesScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, spacing, borderRadius } = useTheme();
  const { dispatches, guardId, guardEmail, loadGuardData, simulateEmergencyDispatch } = useGuardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const statusOptions = [
    { label: 'All Dispatches', value: 'All' },
    { label: 'Assigned', value: 'Assigned' },
    { label: 'Acknowledged', value: 'Acknowledged' },
    { label: 'En Route', value: 'En Route' },
    { label: 'Arrived', value: 'Arrived' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    if (guardId && guardEmail) {
      await loadGuardData(guardId, guardEmail);
    }
    setRefreshing(false);
  };

  const filteredDispatches = useMemo(() => {
    return dispatches.filter((disp) => {
      // Status filter
      if (selectedStatus !== 'All' && disp.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = disp.dispatchReference.toLowerCase().includes(q);
        const matchesReason = disp.reason.toLowerCase().includes(q);
        const matchesSite = disp.site.toLowerCase().includes(q);
        const matchesInstr = (disp.instructions || '').toLowerCase().includes(q);
        return matchesRef || matchesReason || matchesSite || matchesInstr;
      }

      return true;
    });
  }, [dispatches, selectedStatus, searchQuery]);

  return (
    <ScreenLayout>
      <PageHeader
        title="My Dispatches"
        showBack
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            onPress={() => simulateEmergencyDispatch()}
            style={[styles.testAlertBtn, { borderColor: '#DC2626', backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
            activeOpacity={0.75}
          >
            <TriangleAlert size={14} color="#DC2626" />
            <AppText size="xs" weight="bold" style={{ color: '#DC2626', marginLeft: 4 }}>
              Test Alert
            </AppText>
          </TouchableOpacity>
        }
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
            <NavIcon name="search" size={18} color="#64748B" />
          </View>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search dispatches..."
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

        {/* Filter Trigger Button */}
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
            {selectedStatus === 'All' ? 'Status: All' : selectedStatus}
          </AppText>
          <AppText style={styles.filterArrow}>▼</AppText>
        </TouchableOpacity>
      </View>

      {/* Filter Bottom Sheet */}
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

      {/* Summary Row */}
      <View style={[styles.countRow, { paddingHorizontal: spacing.base }]}>
        <AppText style={[styles.countText, { color: colors.textTertiary }]}>
          Showing {filteredDispatches.length} {filteredDispatches.length === 1 ? 'dispatch' : 'dispatches'}
        </AppText>
        {(selectedStatus !== 'All' || searchQuery) && (
          <TouchableOpacity
            onPress={() => {
              setSelectedStatus('All');
              setSearchQuery('');
            }}
            activeOpacity={0.7}
          >
            <AppText style={[styles.resetText, { color: colors.primary[600] }]}>Reset Filters</AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* Dispatches List */}
      <FlatList
        data={filteredDispatches}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: spacing.base },
          filteredDispatches.length === 0 && styles.emptyContainer,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary[600]]} />
        }
        renderItem={({ item }) => (
          <DispatchCard
            dispatch={item}
            onPress={() => navigation.navigate('DispatchDetails', { dispatchId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyStateBox}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.surfaceSecondary }]}>
              <NavIcon name="truck" size={38} color={colors.textTertiary} />
            </View>
            <AppText style={[styles.emptyTitle, { color: colors.text }]}>No Dispatches</AppText>
            <AppText style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
              {searchQuery || selectedStatus !== 'All'
                ? 'No dispatches match your search or filter.'
                : 'No active dispatches at this time.'}
            </AppText>
          </View>
        }
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchInputWrapper: {
    flex: 1,
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
    padding: 4,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 56,
    minWidth: 120,
  },
  filterTriggerText: {
    fontSize: 14.5,
    fontWeight: '700',
    marginRight: 6,
  },
  filterArrow: {
    fontSize: 10,
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
    width: 76,
    height: 76,
    borderRadius: 38,
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
  testAlertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
});
