import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { NavIcon } from '../../../components/NavIcon';
import { FilterBottomSheet } from '../../../components/FilterBottomSheet';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { visitorService, formatAmountK } from '../services/visitor.service';
import { VehicleExpenseClaim, ExpenseStatus } from '../types/visitor.types';
import {
  Receipt,
  Plus,
  Car,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  FileText,
  Eye,
  Edit2,
  Building2,
  RotateCcw,
} from 'lucide-react-native';

const STATUS_FILTER_OPTIONS = [
  { label: 'All Statuses', value: 'All' },
  { label: 'Pending Approval', value: 'Pending Supervisor Approval' },
  { label: 'Changes Requested', value: 'Changes Requested by Supervisor' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
];

export { formatAmountK };

export const VehicleExpenseScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { guardId } = useGuardStore();

  const [claims, setClaims] = useState<VehicleExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const allClaims = await visitorService.getExpenseClaims(guardId || 'guard-1');
      setClaims(allClaims);
    } catch (e) {
      console.error('Failed to load expense claims', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [guardId]);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = claims.reduce((sum, c) => sum + (c.claimedAmount ?? c.amount ?? 0), 0);
    const approved = claims
      .filter((c) => c.status === 'Approved')
      .reduce((sum, c) => sum + (c.claimedAmount ?? c.amount ?? 0), 0);
    const pending = claims.filter((c) => c.status === 'Pending Supervisor Approval').length;
    const changesRequested = claims.filter((c) => c.status === 'Changes Requested by Supervisor').length;

    return { total, approved, pending, changesRequested };
  }, [claims]);

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    let result = claims;

    // Status Filter (from Patrol Log style dropdown)
    if (statusFilter !== 'All') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((c) => {
        return (
          c.id.toLowerCase().includes(q) ||
          c.businessPurpose?.toLowerCase().includes(q) ||
          c.merchantName?.toLowerCase().includes(q) ||
          c.expenseCategory?.toLowerCase().includes(q) ||
          c.expenseType?.toLowerCase().includes(q) ||
          c.vehiclePlate?.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [claims, statusFilter, searchQuery]);

  const renderStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case 'Changes Requested by Supervisor':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }]}>
            <RotateCcw size={12} color="#1D4ED8" />
            <AppText size="xs" weight="bold" style={{ color: '#1D4ED8', marginLeft: 4 }}>
              CHANGES REQUESTED
            </AppText>
          </View>
        );
      case 'Approved':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7', borderColor: '#22C55E' }]}>
            <CheckCircle2 size={12} color="#15803D" />
            <AppText size="xs" weight="bold" style={{ color: '#15803D', marginLeft: 4 }}>
              APPROVED
            </AppText>
          </View>
        );
      case 'Rejected':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
            <AlertCircle size={12} color="#DC2626" />
            <AppText size="xs" weight="bold" style={{ color: '#DC2626', marginLeft: 4 }}>
              REJECTED
            </AppText>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <Clock size={12} color="#B45309" />
            <AppText size="xs" weight="bold" style={{ color: '#B45309', marginLeft: 4 }}>
              PENDING 
            </AppText>
          </View>
        );
    }
  };

  const getFilterLabel = () => {
    if (statusFilter === 'All') return 'Filter: All';
    if (statusFilter === 'Pending Supervisor Approval') return 'Filter: Pending';
    if (statusFilter === 'Changes Requested by Supervisor') return 'Filter: Changes';
    if (statusFilter === 'Approved') return 'Filter: Approved';
    if (statusFilter === 'Rejected') return 'Filter: Rejected';
    return `Filter: ${statusFilter}`;
  };

  return (
    <ScreenLayout activeRoute="VehicleExpense">
      {/* Page Header (No top Create Claim button) */}
      <PageHeader
        title="Expense Claims"
        showBack={true}
        onBack={() => navigation.navigate('HomeMain')}
      />

      {/* Search & Dropdown Filter Row (Identical to Patrol Logs design & icon size) */}
      <View style={styles.searchFilterRow}>
        <View
          style={[
            styles.searchInputWrapper,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderStrong || colors.border },
          ]}
        >
          <View style={{ marginRight: 8 }}>
            <NavIcon name="search" size={18} color={colors.textSecondary} />
          </View>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search expenses..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <AppText size="xs" weight="bold" style={{ color: colors.textSecondary }}>✕</AppText>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Dropdown Filter Trigger (Matching Patrol Logs) */}
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderStrong || colors.border },
          ]}
          onPress={() => setDropdownOpen(!dropdownOpen)}
          activeOpacity={0.8}
        >
          <AppText size="sm" weight="bold" style={{ color: colors.text, marginRight: 4 }}>
            {getFilterLabel()}
          </AppText>
          <AppText size="xs" color="secondary">{dropdownOpen ? '▲' : '▼'}</AppText>
        </TouchableOpacity>
      </View>

      {/* Patrol-Style Status Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
        title="Filter by Status"
        options={STATUS_FILTER_OPTIONS}
        selectedValue={statusFilter}
        onSelect={(val) => {
          setStatusFilter(val);
          setDropdownOpen(false);
        }}
      />

      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary[600]]} />}
        >
          {/* Metrics Row */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppText size="xs" style={{ color: colors.textTertiary }}>TOTAL</AppText>
              <AppText
                size="base"
                weight="bold"
                style={{ color: colors.text, marginTop: 4 }}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {formatAmountK(metrics.total)}
              </AppText>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppText size="xs" style={{ color: colors.textTertiary }}>APPROVED</AppText>
              <AppText
                size="base"
                weight="bold"
                style={{ color: '#16A34A', marginTop: 4 }}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {formatAmountK(metrics.approved)}
              </AppText>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppText size="xs" style={{ color: colors.textTertiary }}>PENDING</AppText>
              <AppText
                size="base"
                weight="bold"
                style={{ color: '#D97706', marginTop: 4 }}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {metrics.pending}
              </AppText>
            </View>

            {metrics.changesRequested > 0 && (
              <View style={[styles.metricCard, { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' }]}>
                <AppText size="xs" style={{ color: '#1E40AF' }}>CHANGES</AppText>
                <AppText
                  size="base"
                  weight="bold"
                  style={{ color: '#1D4ED8', marginTop: 4 }}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                >
                  {metrics.changesRequested}
                </AppText>
              </View>
            )}
          </View>

          {/* Claims List */}
          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
            </View>
          ) : filteredClaims.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Receipt size={44} color={colors.textTertiary} />
              <Heading level="h4" style={{ marginTop: 12, color: colors.text }}>
                {statusFilter === 'Changes Requested by Supervisor'
                  ? 'No Changes Requested'
                  : statusFilter === 'Rejected'
                  ? 'No Rejected Claims'
                  : statusFilter === 'Pending Supervisor Approval'
                  ? 'No Pending Claims'
                  : statusFilter === 'Approved'
                  ? 'No Approved Claims'
                  : searchQuery
                  ? 'No Matching Claims'
                  : 'No Expense Claims Found'}
              </Heading>
              <AppText size="xs" style={{ color: colors.textSecondary, marginTop: 4, textAlign: 'center', lineHeight: 18 }}>
                {searchQuery
                  ? `No expense claims matching "${searchQuery}".`
                  : statusFilter === 'Changes Requested by Supervisor'
                  ? 'There are currently no expense claims requiring revision from your supervisor.'
                  : statusFilter === 'Rejected'
                  ? 'There are no rejected expense claims.'
                  : statusFilter === 'Pending Supervisor Approval'
                  ? 'All submitted expense claims have been reviewed.'
                  : statusFilter === 'Approved'
                  ? 'There are no approved expense claims yet.'
                  : 'No expense claims recorded yet.'}
              </AppText>

              {/* NEVER show "+ Create First Claim" when filtering by Changes Requested or Rejected */}
              {statusFilter === 'All' && !searchQuery && claims.length === 0 && (
                <Button
                  title="+ Create First Claim"
                  onPress={() => navigation.navigate('ExpenseClaimForm')}
                  style={{ marginTop: 16 }}
                />
              )}
            </View>
          ) : (
            <View style={styles.listContainer}>
              {filteredClaims.map((claim) => {
                const totalAmt = claim.claimedAmount ?? claim.amount ?? 0;
                // ONLY can edit if supervisor requested changes!
                const canEdit = claim.status === 'Changes Requested by Supervisor';

                return (
                  <Card key={claim.id} style={[styles.claimCard, { borderColor: colors.border }]}>
                    {/* Header Row: ID, Date, Status */}
                    <View style={styles.claimHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.idRow}>
                          <AppText size="xs" weight="bold" style={{ color: colors.primary[600] }}>
                            {claim.id}
                          </AppText>
                          <AppText size="xs" style={{ color: colors.textTertiary, marginLeft: 8 }}>
                            {claim.expenseDate || new Date(claim.dateTime).toLocaleDateString()}
                          </AppText>
                        </View>
                        <Heading level="h4" style={{ marginTop: 2, color: colors.text }}>
                          {formatAmountK(totalAmt)}
                        </Heading>
                      </View>
                      {renderStatusBadge(claim.status)}
                    </View>

                    {/* Business Purpose & Summary */}
                    <View style={styles.purposeBox}>
                      <AppText size="sm" weight="semibold" style={{ color: colors.text }} numberOfLines={2}>
                        {claim.businessPurpose || claim.remarks || 'Operational Expense'}
                      </AppText>
                    </View>

                    {/* Supervisor Change Request Feedback Banner */}
                    {claim.supervisorNotes && claim.status === 'Changes Requested by Supervisor' && (
                      <View style={[styles.supervisorNotesBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                        <RotateCcw size={14} color="#1D4ED8" />
                        <AppText size="xs" weight="medium" style={{ color: '#1E40AF', marginLeft: 6, flex: 1 }}>
                          {claim.supervisorNotes}
                        </AppText>
                      </View>
                    )}

                    {/* Metadata Badges: Category, Merchant */}
                    <View style={styles.metaBadgesRow}>
                      <View style={[styles.pillBadge, { backgroundColor: colors.surfaceSecondary }]}>
                        <Tag size={12} color={colors.primary[600]} />
                        <AppText size="xs" weight="medium" style={{ color: colors.text, marginLeft: 4 }}>
                          {claim.expenseCategory || 'General Expense'}
                        </AppText>
                      </View>

                      {claim.merchantName && (
                        <View style={[styles.pillBadge, { backgroundColor: colors.surfaceSecondary }]}>
                          <Building2 size={12} color={colors.textSecondary} />
                          <AppText size="xs" style={{ color: colors.textSecondary, marginLeft: 4 }} numberOfLines={1}>
                            {claim.merchantName}
                          </AppText>
                        </View>
                      )}
                    </View>

                    {/* Icon-Only Action Buttons: Eye and Edit */}
                    <View style={styles.cardActionsRow}>
                      {/* Eye Icon for View Details */}
                      <TouchableOpacity
                        style={[styles.actionIconBtn, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                        onPress={() => navigation.navigate('ExpenseClaimDetails', { claimId: claim.id })}
                        activeOpacity={0.7}
                        accessibilityLabel="View Claim Details"
                      >
                        <NavIcon name="eye" size={26} color={colors.primary[600]} />
                      </TouchableOpacity>

                      {/* Edit Icon (Active ONLY if supervisor requested changes) */}
                      <TouchableOpacity
                        style={[
                          styles.actionIconBtn,
                          {
                            borderColor: canEdit ? colors.primary[600] : colors.border,
                            backgroundColor: canEdit ? colors.primary[50] : colors.surfaceSecondary,
                            opacity: canEdit ? 1 : 0.45,
                          },
                        ]}
                        onPress={() => {
                          if (canEdit) {
                            navigation.navigate('ExpenseClaimForm', { claimId: claim.id, isEditing: true });
                          } else {
                            Alert.alert(
                              'Editing Locked',
                              'Expenses cannot be edited while pending review or once approved. Editing is only permitted when a supervisor requests changes.'
                            );
                          }
                        }}
                        activeOpacity={0.7}
                        accessibilityLabel="Edit Claim"
                      >
                        <Edit2 size={18} color={canEdit ? colors.primary[700] : colors.textTertiary} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Proper Floating Action Button (FAB) matching the theme */}
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: colors.primary[600] }]}
          onPress={() => navigation.navigate('ExpenseClaimForm')}
          activeOpacity={0.85}
          accessibilityLabel="Submit Expense Claim"
          accessibilityRole="button"
        >
          <Plus size={22} color="#FFFFFF" strokeWidth={2.5} />
          <AppText size="base" weight="bold" style={styles.floatingButtonText}>
            CLAIM EXPENSE
          </AppText>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 95,
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
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
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 56,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 14,
  },
  loaderWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyWrap: {
    paddingVertical: 48,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  listContainer: {
    gap: 12,
  },
  claimCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  claimHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  purposeBox: {
    marginTop: 8,
    marginBottom: 8,
  },
  supervisorNotesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  metaBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vehicleLinkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  receiptEvidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  actionIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 54,
    borderRadius: 27,
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
