import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { NavIcon } from '../../../components/NavIcon';
import { LeaveBalanceCard } from '../components/LeaveBalanceCard';
import { LeaveForm } from '../components/LeaveForm';
import { LeaveHistory } from '../components/LeaveHistory';
import { useGuardStore, LeaveRequest } from '../../../store/useGuardStore';
import { useAuthStore } from '../../../store/useAuthStore';

const filterOptions = [
  { label: 'All', value: 'All' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Cancelled', value: 'Cancelled' },
];

export const LeaveScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { colors, borderRadius } = useTheme();
  const { guardId, guardEmail, loadGuardData } = useGuardStore();

  useEffect(() => {
    if (isFocused) {
      const authUser = useAuthStore.getState().user;
      const effectiveId = guardId || authUser?.id || authUser?.employeeId || 'G-1001';
      const effectiveEmail = guardEmail || authUser?.email || 'john@priority-one.io';
      loadGuardData(effectiveId, effectiveEmail);
    }
  }, [isFocused, guardId, guardEmail, loadGuardData]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);

  const handleEditLeave = (leave: LeaveRequest) => {
    setEditingLeave(leave);
    setIsApplyModalOpen(true);
  };

  const handleFinishedEdit = () => {
    setEditingLeave(null);
    setIsApplyModalOpen(false);
  };

  const handleOpenApplyModal = () => {
    setEditingLeave(null);
    setIsApplyModalOpen(true);
  };

  return (
    <ScreenLayout>
      <PageHeader
        title="Leave Management"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.mainContainer}>
        {/* Compact Leave Balance Card */}
        <LeaveBalanceCard />

        {/* Search & Filter Row */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchInputWrapper}>
            <NavIcon name="search" size={22} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search leaves..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setDropdownOpen(!dropdownOpen)}
            activeOpacity={0.7}
          >
            <AppText size="base" weight="semibold" style={{ color: '#0F172A', marginRight: 6 }}>
              Filter: {statusFilter}
            </AppText>
            <AppText size="xs" color="secondary">
              {dropdownOpen ? '▲' : '▼'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Dropdown Options List */}
        {dropdownOpen && (
          <View style={styles.dropdownMenuContainer}>
            {filterOptions.map((opt) => {
              const isActive = statusFilter === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.dropdownMenuItem,
                    isActive && styles.dropdownMenuItemActive,
                  ]}
                  onPress={() => {
                    setStatusFilter(opt.value);
                    setDropdownOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <AppText
                    size="base"
                    weight={isActive ? 'bold' : 'medium'}
                    style={{ color: isActive ? '#4F46E5' : '#0F172A' }}
                  >
                    {opt.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Leave History Scrollable Card List */}
        <ScrollView contentContainerStyle={styles.listContainer}>
          <LeaveHistory
            onEditLeave={handleEditLeave}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
          />
        </ScrollView>

        {/* Floating Action Button (FAB) for APPLY LEAVE */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleOpenApplyModal}
          activeOpacity={0.85}
          accessibilityLabel="Apply for leave"
          accessibilityRole="button"
        >
          <NavIcon name="leaves" size={22} color="#FFFFFF" />
          <AppText size="base" weight="bold" style={styles.floatingButtonText}>
            APPLY LEAVE
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Apply / Edit Leave Application Form Modal Flow */}
      <Modal
        visible={isApplyModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setIsApplyModalOpen(false);
          setEditingLeave(null);
        }}
      >
        <ScreenLayout>
          <PageHeader
            title={editingLeave ? 'Edit Leave Application' : 'Apply For Leave'}
            showBack
            onBack={() => {
              setIsApplyModalOpen(false);
              setEditingLeave(null);
            }}
          />
          <View style={{ flex: 1 }}>
            <LeaveForm
              editingLeave={editingLeave}
              onFinishedEdit={handleFinishedEdit}
            />
          </View>
        </ScreenLayout>
      </Modal>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
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
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 0,
    marginLeft: 8,
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    zIndex: 100,
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
    paddingBottom: 100,
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
    letterSpacing: 0.5,
  },
});
