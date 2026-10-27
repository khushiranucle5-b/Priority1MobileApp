import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  RefreshControl,
} from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { visitorService } from '../services/visitor.service';
import { VisitorRecord, VisitorStatus } from '../types/visitor.types';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Clock,
  AlertTriangle,
  Search,
  ShieldAlert,
  LogOut,
  Building2,
  Calendar,
  X,
  Shield,
  FileText,
  Tag,
  Car,
} from 'lucide-react-native';
import { NavIcon } from '../../../components/NavIcon';

export const VisitorsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { guardName, guardId, assignedSite } = useGuardStore();

  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'on_site' | 'all'>('on_site');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'custom'>('all');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  // Set of dates that have visitor records
  const visitorDatesSet = useMemo(() => {
    const set = new Set<string>();
    visitors.forEach((v) => {
      const raw = v.actualCheckInAt || v.createdAt || v.expectedArrival;
      if (raw) {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
        }
      }
    });
    return set;
  }, [visitors]);

  const monthYearStr = useMemo(() => {
    return calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [calendarMonth]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ day: number | null; dateStr: string | null; isToday: boolean; isSelected: boolean; hasVisitors: boolean }> = [];

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const selStr = selectedCalendarDate
      ? `${selectedCalendarDate.getFullYear()}-${String(selectedCalendarDate.getMonth() + 1).padStart(2, '0')}-${String(selectedCalendarDate.getDate()).padStart(2, '0')}`
      : null;

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateStr: null, isToday: false, isSelected: false, hasVisitors: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const isSelected = dateFilter === 'custom' && dateStr === selStr;
      const hasVisitors = visitorDatesSet.has(dateStr);
      cells.push({ day: d, dateStr, isToday, isSelected, hasVisitors });
    }

    return cells;
  }, [calendarMonth, selectedCalendarDate, dateFilter, visitorDatesSet]);

  // Deny Modal State
  const [denyModalVisible, setDenyModalVisible] = useState(false);
  const [selectedVisitorForDeny, setSelectedVisitorForDeny] = useState<VisitorRecord | null>(null);
  const [denyReason, setDenyReason] = useState('Identity Verification Failed');
  const [denyComments, setDenyComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const all = await visitorService.getVisitors();
      setVisitors(all);
    } catch (err) {
      console.error('Failed to load visitor data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
    const onSite = visitors.filter((v) => v.status === 'checked_in');
    const overstayCount = onSite.filter((v) => visitorService.isVisitorOverstay(v)).length;

    return {
      onSiteCount: onSite.length,
      overstayCount,
    };
  }, [visitors]);

  // Tab & Search filter
  const filteredVisitors = useMemo(() => {
    let list = [...visitors];

    if (activeTab === 'on_site') {
      list = list.filter((v) => v.status === 'checked_in');
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const ydayDate = new Date();
      ydayDate.setDate(ydayDate.getDate() - 1);
      const ydayStr = `${ydayDate.getFullYear()}-${String(ydayDate.getMonth() + 1).padStart(2, '0')}-${String(ydayDate.getDate()).padStart(2, '0')}`;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const customStr = selectedCalendarDate
        ? `${selectedCalendarDate.getFullYear()}-${String(selectedCalendarDate.getMonth() + 1).padStart(2, '0')}-${String(selectedCalendarDate.getDate()).padStart(2, '0')}`
        : null;

      list = list.filter((v) => {
        const rawDate = v.actualCheckInAt || v.createdAt || v.expectedArrival;
        if (!rawDate) return false;
        const d = new Date(rawDate);
        if (isNaN(d.getTime())) return false;

        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        if (dateFilter === 'today') {
          return dateStr === todayStr;
        } else if (dateFilter === 'yesterday') {
          return dateStr === ydayStr;
        } else if (dateFilter === 'week') {
          return d.getTime() >= weekAgo.getTime();
        } else if (dateFilter === 'custom' && customStr) {
          return dateStr === customStr;
        }
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const qClean = q.replace(/[\s-]/g, '');

      list = list.filter((v) => {
        const matchName = v.visitorName.toLowerCase().includes(q);
        const matchComp = (v.visitorCompany || '').toLowerCase().includes(q);
        const matchCat = (v.category || '').toLowerCase().includes(q);
        const matchRef = v.referenceNumber.toLowerCase().includes(q);
        const matchPhone = v.visitorPhone && v.visitorPhone.replace(/[\s-]/g, '').includes(qClean);
        const matchHost = v.hostName.toLowerCase().includes(q);
        const matchBadge = (v.badgeNumber || '').toLowerCase().includes(q);
        const matchUnit = (v.unitNumber || '').toLowerCase().includes(q);
        const matchPlate = (v.vehiclePlateNumber || '').toLowerCase().includes(q) || (v.vehiclePlateNumber || '').replace(/[\s-]/g, '').toLowerCase().includes(qClean);

        return matchName || matchComp || matchCat || matchRef || matchPhone || matchHost || matchBadge || matchUnit || matchPlate;
      });
    }

    return list;
  }, [visitors, activeTab, searchQuery, dateFilter, selectedCalendarDate]);

  // Guard Actions: Quick Check-In
  const handleQuickCheckIn = async (visitor: VisitorRecord) => {
    Alert.alert(
      'Admit Visitor',
      `Clear gate entry and check-in ${visitor.visitorName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Grant Entry',
          onPress: async () => {
            setActionLoading(true);
            const res = await visitorService.quickCheckIn(visitor.id, {
              guardId: guardId || 'guard-1',
              guardName: guardName || 'Khushi Rani',
            });
            setActionLoading(false);
            if (res.success) {
              Alert.alert('Entry Granted', `${visitor.visitorName} is now Checked-In On-Site.`);
              loadData();
            } else {
              Alert.alert('Error', res.error || 'Failed to check in.');
            }
          },
        },
      ]
    );
  };

  // Guard Actions: Single-Tap Check-Out
  const handleSingleTapCheckOut = (visitor: VisitorRecord) => {
    Alert.alert(
      'Single-Tap Check Out',
      `Record physical gate departure for ${visitor.visitorName} (Badge #${visitor.badgeNumber || 'N/A'})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check Out Now',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            const res = await visitorService.singleTapCheckOut(visitor.id, {
              guardId: guardId || 'guard-1',
              guardName: guardName || 'Khushi Rani',
            });
            setActionLoading(false);
            if (res.success) {
              Alert.alert('Exit Recorded', `${visitor.visitorName} marked as Checked Out.`);
              loadData();
            } else {
              Alert.alert('Error', res.error || 'Failed to check out.');
            }
          },
        },
      ]
    );
  };

  const handleOpenDenyModal = (visitor: VisitorRecord) => {
    setSelectedVisitorForDeny(visitor);
    setDenyReason('Identity Verification Failed');
    setDenyComments('');
    setDenyModalVisible(true);
  };

  const handleConfirmDeny = async () => {
    if (!selectedVisitorForDeny) return;
    setActionLoading(true);

    const res = await visitorService.denyVisitorEntry(
      selectedVisitorForDeny.id,
      {
        reason: denyReason,
        comments: denyComments.trim() || undefined,
      },
      { guardId: guardId || 'guard-1', guardName: guardName || 'Khushi Rani' }
    );

    setActionLoading(false);
    setDenyModalVisible(false);

    if (res.success) {
      Alert.alert('Entry Denied', `Entry refusal recorded for ${selectedVisitorForDeny.visitorName}.`);
      loadData();
    } else {
      Alert.alert('Error', res.error || 'Failed to record denial.');
    }
  };

  const handleDeleteVisitor = (v: VisitorRecord) => {
    Alert.alert(
      'Delete Visitor Record?',
      `Are you sure you want to delete the visitor record for ${v.visitorName} (${v.referenceNumber})? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await visitorService.deleteVisitor(v.id);
            if (res.success) {
              Alert.alert('Deleted', 'Visitor record deleted successfully.');
              loadData();
            } else {
              Alert.alert('Error', res.error || 'Failed to delete visitor record.');
            }
          },
        },
      ]
    );
  };

  const formatDuration = (startTime?: string) => {
    if (!startTime) return 'Just now';
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const diffMins = Math.max(1, Math.round((now - start) / 60000));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const renderStatusBadge = (status: VisitorStatus, isOverstay?: boolean) => {
    if (isOverstay) {
      return (
        <View style={[styles.statusPill, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
          <AlertTriangle size={12} color="#DC2626" />
          <AppText size="xs" weight="bold" style={{ color: '#DC2626', marginLeft: 4 }}>
            OVERSTAY
          </AppText>
        </View>
      );
    }

    switch (status) {
      case 'checked_in':
        return (
          <View style={[styles.statusPill, { backgroundColor: '#DCFCE7', borderColor: '#22C55E' }]}>
            <View style={styles.pulsingDot} />
            <AppText size="xs" weight="bold" style={{ color: '#15803D', marginLeft: 4 }}>
              ON-SITE
            </AppText>
          </View>
        );
      case 'checked_out':
        return (
          <View style={[styles.statusPill, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
            <AppText size="xs" weight="semibold" style={{ color: '#64748B' }}>
              CHECKED OUT
            </AppText>
          </View>
        );
      case 'scheduled':
      case 'approved':
        return (
          <View style={[styles.statusPill, { backgroundColor: '#E0E7FF', borderColor: '#6366F1' }]}>
            <AppText size="xs" weight="bold" style={{ color: '#4338CA' }}>
              SCHEDULED
            </AppText>
          </View>
        );
      case 'denied_entry':
      case 'rejected':
        return (
          <View style={[styles.statusPill, { backgroundColor: '#FEE2E2', borderColor: '#F87171' }]}>
            <AppText size="xs" weight="bold" style={{ color: '#B91C1C' }}>
              DENIED
            </AppText>
          </View>
        );
      default:
        return (
          <View style={[styles.statusPill, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <AppText size="xs" weight="bold" style={{ color: '#B45309' }}>
              AWAITING
            </AppText>
          </View>
        );
    }
  };

  return (
    <ScreenLayout activeRoute="VisitorsScreen">
      {/* Page Header */}
      <PageHeader
        title="Gate Visitors"
        showBack={true}
      />

      <View style={styles.mainContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary[600]]} />}
        >
        {/* Big Search Bar & Date Filter Row */}
        <View style={styles.searchFilterRow}>
          <View style={[styles.searchInputWrapper, { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderStrong || colors.border }]}>
            <Search size={22} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search visitors..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Date Filter Button Right Next to Search */}
          <TouchableOpacity
            style={[
              styles.dateFilterBtn,
              dateFilter !== 'all'
                ? { backgroundColor: colors.primary[600], borderColor: colors.primary[700] }
                : { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderStrong || colors.border },
            ]}
            onPress={() => setDateModalVisible(true)}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityLabel="Filter by date"
          >
            <Calendar size={20} color={dateFilter !== 'all' ? '#FFFFFF' : colors.textSecondary} />
            {dateFilter !== 'all' && (
              <AppText size="xs" weight="bold" style={{ color: '#FFFFFF', marginLeft: 4 }}>
                {dateFilter === 'today'
                  ? 'Today'
                  : dateFilter === 'yesterday'
                  ? 'Yday'
                  : dateFilter === 'week'
                  ? '7D'
                  : selectedCalendarDate
                  ? `${selectedCalendarDate.getDate()} ${selectedCalendarDate.toLocaleDateString('en-US', { month: 'short' })}`
                  : 'Date'}
              </AppText>
            )}
          </TouchableOpacity>
        </View>

        {/* Filter for Active On-Site and All Visitors */}
        <View style={styles.filterSegmentsRow}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeTab === 'on_site'
                ? [styles.segmentBtnActive, { backgroundColor: colors.primary[600], borderColor: colors.primary[700] }]
                : [styles.segmentBtnInactive, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }],
            ]}
            onPress={() => setActiveTab('on_site')}
            activeOpacity={0.8}
          >
            <View style={[styles.liveDot, { backgroundColor: activeTab === 'on_site' ? '#86EFAC' : '#16A34A' }]} />
            <AppText
              size="sm"
              weight={activeTab === 'on_site' ? 'bold' : 'semibold'}
              style={{ color: activeTab === 'on_site' ? '#FFFFFF' : colors.text }}
            >
              Active On-Site ({metrics.onSiteCount})
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeTab === 'all'
                ? [styles.segmentBtnActive, { backgroundColor: colors.primary[600], borderColor: colors.primary[700] }]
                : [styles.segmentBtnInactive, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }],
            ]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.8}
          >
            <AppText
              size="sm"
              weight={activeTab === 'all' ? 'bold' : 'semibold'}
              style={{ color: activeTab === 'all' ? '#FFFFFF' : colors.text }}
            >
              All Visitors ({visitors.length})
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Visitor Cards Listing */}
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
            <AppText size="sm" style={{ color: colors.textSecondary, marginTop: 12 }}>
              Loading gate visitor logs...
            </AppText>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredVisitors.length === 0 ? (
              <View style={styles.emptyState}>
                <UserCheck size={40} color={colors.textTertiary} />
                <AppText size="base" weight="semibold" style={{ color: colors.text, marginTop: 12 }}>
                  {activeTab === 'on_site' ? 'No Visitors Currently On-Site' : 'No Visitors Found'}
                </AppText>
                <AppText size="sm" style={{ color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
                  {activeTab === 'on_site'
                    ? 'All registered guests have checked out or none are checked-in.'
                    : 'No visitors match your current search criteria.'}
                </AppText>
              </View>
            ) : (
              filteredVisitors.map((item) => {
                const isOverstay = visitorService.isVisitorOverstay(item);
                const isOnSite = item.status === 'checked_in';
                const isScheduled = item.status === 'scheduled' || item.status === 'approved';

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('VisitorDetails', { visitorId: item.id })}
                  >
                    <Card
                      style={[
                        styles.itemCard,
                        { borderColor: isOverstay ? '#EF4444' : colors.border },
                        isOverstay && styles.overstayCardHighlight,
                      ]}
                    >
                      {/* Card Header Row */}
                      <View style={styles.cardHeaderRow}>
                        <View style={{ flex: 1 }}>
                          <View style={styles.nameCategoryRow}>
                            <AppText size="base" weight="bold" style={{ color: colors.text }}>
                              {item.visitorName}
                            </AppText>
                            {item.badgeNumber && (
                              <View style={[styles.badgeTag, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }]}>
                                <AppText size="xs" weight="bold" style={{ color: colors.primary[700] }}>
                                  #{item.badgeNumber}
                                </AppText>
                              </View>
                            )}
                            {item.vehiclePlateNumber && (
                              <View style={[styles.vehiclePlateTag, { backgroundColor: '#FEF9C3', borderColor: '#FDE047' }]}>
                                <Car size={11} color="#854D0E" />
                                <AppText size="xs" weight="bold" style={{ color: '#854D0E', marginLeft: 3 }}>
                                  {item.vehiclePlateNumber}
                                </AppText>
                              </View>
                            )}
                          </View>
                          <AppText size="xs" weight="semibold" style={{ color: colors.primary[700], marginTop: 2 }}>
                            {item.category} • {item.unitNumber ? `Flat ${item.unitNumber}` : item.visitorCompany || 'Resident Guest'}
                          </AppText>
                        </View>
                        {renderStatusBadge(item.status, isOverstay)}
                      </View>

                      {/* Meta Grid */}
                      <View style={[styles.metaGrid, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.sm }]}>
                        <View style={styles.metaCol}>
                          <AppText size="xs" style={{ color: colors.textTertiary }}>Host / Resident</AppText>
                          <AppText size="xs" weight="bold" style={{ color: colors.text }}>
                            {item.hostName}
                          </AppText>
                          <AppText size="xs" style={{ color: colors.textSecondary }}>
                            {item.unitNumber ? `Unit ${item.unitNumber}` : 'Resident'}
                          </AppText>
                        </View>

                        <View style={styles.metaDivider} />

                        <View style={styles.metaCol}>
                          <AppText size="xs" style={{ color: colors.textTertiary }}>
                            {isOnSite
                              ? 'Time-In (On-Site)'
                              : item.status === 'checked_out'
                              ? 'Time In / Out'
                              : 'Scheduled Arrival'}
                          </AppText>
                          <AppText size="xs" weight="bold" style={{ color: isOnSite ? '#15803D' : item.status === 'checked_out' ? '#475569' : colors.text }}>
                            {isOnSite
                              ? `In: ${new Date(item.actualCheckInAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${formatDuration(item.actualCheckInAt)})`
                              : item.status === 'checked_out'
                              ? `Time In: ${item.actualCheckInAt ? new Date(item.actualCheckInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} • Time Out: ${item.actualCheckOutAt ? new Date(item.actualCheckOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}`
                              : new Date(item.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </AppText>
                          <AppText size="xs" weight="medium" numberOfLines={1} ellipsizeMode="tail" style={{ color: colors.textSecondary, marginTop: 2 }}>
                            Ref: {item.referenceNumber}
                          </AppText>
                        </View>
                      </View>

                      {/* Guard Action Buttons */}
                      <View style={[styles.cardActionsRow, { borderTopColor: colors.border }]}>
                        <View style={styles.leftActions}>
                          {isOnSite && (
                            <TouchableOpacity
                              style={[styles.gateActionBtn, { backgroundColor: '#DC2626' }]}
                              onPress={() => handleSingleTapCheckOut(item)}
                              activeOpacity={0.8}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                              accessibilityLabel="Check Out"
                            >
                              <LogOut size={18} color="#FFFFFF" strokeWidth={2.2} />
                            </TouchableOpacity>
                          )}

                          {isScheduled && (
                            <TouchableOpacity
                              style={[styles.denyActionBtn, { borderColor: '#EF4444', backgroundColor: '#FEF2F2' }]}
                              onPress={() => handleOpenDenyModal(item)}
                              activeOpacity={0.8}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                              accessibilityLabel="Deny Entry"
                            >
                              <ShieldAlert size={18} color="#DC2626" />
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Direct View, Edit, Delete Actions */}
                        <View style={styles.rightActionBtns}>
                          <TouchableOpacity
                            style={[styles.iconActionBtnView, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                            onPress={() => navigation.navigate('VisitorDetails', { visitorId: item.id })}
                            activeOpacity={0.7}
                            accessibilityLabel="View visitor details"
                            accessibilityRole="button"
                          >
                            <NavIcon name="eye" size={26} color={colors.primary[600]} />
                          </TouchableOpacity>

                          {/* When clock in/out is completed (checked_out), edit and delete are removed as requested */}
                          {item.status !== 'checked_out' && (
                            <>
                              <TouchableOpacity
                                style={[styles.iconActionBtnEdit, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                                onPress={() => navigation.navigate('RegisterVisitor', { editVisitorId: item.id })}
                                activeOpacity={0.7}
                                accessibilityLabel="Edit visitor"
                                accessibilityRole="button"
                              >
                                <NavIcon name="edit" size={24} color={colors.primary[600]} />
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.iconActionBtnDelete, { backgroundColor: colors.errorLight, borderColor: colors.errorLight }]}
                                onPress={() => handleDeleteVisitor(item)}
                                activeOpacity={0.7}
                                accessibilityLabel="Delete visitor"
                                accessibilityRole="button"
                              >
                                <NavIcon name="delete" size={24} color={colors.errorDark} />
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) for REGISTER VISITOR */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: colors.primary[600] }]}
        onPress={() => navigation.navigate('RegisterVisitor')}
        activeOpacity={0.85}
        accessibilityLabel="Register visitor"
        accessibilityRole="button"
      >
        <NavIcon name="visitors" size={22} color="#FFFFFF" />
        <AppText size="base" weight="bold" style={styles.floatingButtonText}>
          REGISTER VISITOR
        </AppText>
      </TouchableOpacity>
    </View>

      {/* Deny Entry Modal */}
      {/* Date Filter & Interactive Calendar Modal */}
      <Modal visible={dateModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: 18 }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: colors.primary[50] }]}>
                <Calendar size={20} color={colors.primary[600]} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Heading level="h4" style={{ color: colors.text }}>Filter By Date</Heading>
                <AppText size="xs" style={{ color: colors.textSecondary }}>
                  Tap any date on calendar or select preset
                </AppText>
              </View>
              <TouchableOpacity onPress={() => setDateModalVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Quick Filter Presets Row */}
            <View style={styles.calendarPresetsRow}>
              {[
                { id: 'all', label: 'All Dates' },
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'week', label: 'Past 7 Days' },
              ].map((p) => {
                const isSelected = dateFilter === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.calendarPresetChip,
                      {
                        backgroundColor: isSelected ? colors.primary[600] : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary[700] : colors.border,
                      },
                    ]}
                    onPress={() => {
                      if (p.id === 'all') {
                        setDateFilter('all');
                        setSelectedCalendarDate(null);
                      } else if (p.id === 'today') {
                        setDateFilter('today');
                        const t = new Date();
                        setSelectedCalendarDate(t);
                        setCalendarMonth(t);
                      } else if (p.id === 'yesterday') {
                        setDateFilter('yesterday');
                        const yd = new Date();
                        yd.setDate(yd.getDate() - 1);
                        setSelectedCalendarDate(yd);
                        setCalendarMonth(yd);
                      } else if (p.id === 'week') {
                        setDateFilter('week');
                        setSelectedCalendarDate(null);
                      }
                      setDateModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <AppText
                      size="xs"
                      weight={isSelected ? 'bold' : 'medium'}
                      style={{ color: isSelected ? '#FFFFFF' : colors.text }}
                    >
                      {p.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Month Navigation */}
            <View style={styles.calendarNavHeader}>
              <TouchableOpacity
                onPress={handlePrevMonth}
                style={[styles.calArrowBtn, { backgroundColor: colors.surfaceSecondary }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeft size={18} color={colors.primary[600]} />
              </TouchableOpacity>

              <AppText size="sm" weight="bold" style={{ color: colors.text }}>
                {monthYearStr}
              </AppText>

              <TouchableOpacity
                onPress={handleNextMonth}
                style={[styles.calArrowBtn, { backgroundColor: colors.surfaceSecondary }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronRight size={18} color={colors.primary[600]} />
              </TouchableOpacity>
            </View>

            {/* Weekdays Row */}
            <View style={styles.calWeekRow}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w, idx) => (
                <View key={idx} style={styles.calDayCol}>
                  <AppText size="xs" weight="bold" style={{ color: colors.textTertiary, textAlign: 'center' }}>
                    {w}
                  </AppText>
                </View>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.calDaysGrid}>
              {calendarDays.map((cell, idx) => {
                if (cell.day === null) {
                  return <View key={idx} style={styles.calDayCol} />;
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.calDayCol}
                    onPress={() => {
                      const picked = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), cell.day! );
                      setSelectedCalendarDate(picked);
                      setDateFilter('custom');
                      setDateModalVisible(false);
                    }}
                    activeOpacity={0.6}
                  >
                    <View
                      style={[
                        styles.calDayCircle,
                        cell.isSelected
                          ? { backgroundColor: colors.primary[600] }
                          : cell.isToday
                          ? { borderColor: colors.primary[500], borderWidth: 1.5 }
                          : null,
                      ]}
                    >
                      <AppText
                        size="xs"
                        weight={cell.isSelected || cell.isToday ? 'bold' : 'regular'}
                        style={{
                          color: cell.isSelected ? '#FFFFFF' : cell.isToday ? colors.primary[700] : colors.text,
                        }}
                      >
                        {cell.day}
                      </AppText>
                    </View>
                    {cell.hasVisitors && (
                      <View
                        style={[
                          styles.calRecordDot,
                          { backgroundColor: cell.isSelected ? '#FFFFFF' : '#16A34A' },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Calendar Footer / Reset Button */}
            <View style={styles.calFooter}>
              <TouchableOpacity
                style={[styles.calClearBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                onPress={() => {
                  setDateFilter('all');
                  setSelectedCalendarDate(null);
                  setDateModalVisible(false);
                }}
              >
                <AppText size="xs" weight="semibold" style={{ color: colors.textSecondary }}>
                  Reset to All Dates
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={denyModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <ShieldAlert size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Heading level="h4" style={{ color: '#DC2626' }}>Deny Entry</Heading>
                <AppText size="xs" style={{ color: colors.textSecondary }}>
                  Record reason for entry refusal
                </AppText>
              </View>
              <TouchableOpacity onPress={() => setDenyModalVisible(false)}>
                <X size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {selectedVisitorForDeny && (
              <View style={styles.modalBody}>
                <AppText size="xs" weight="semibold" style={{ color: colors.textSecondary, marginBottom: 6 }}>
                  Reason
                </AppText>

                {[
                  'No Valid ID',
                  'Host Denied Entry',
                  'Suspicious Activity',
                  'Unauthorized Visit',
                ].map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonOption,
                      denyReason === reason && { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
                    ]}
                    onPress={() => setDenyReason(reason)}
                  >
                    <View style={[styles.radioCircle, denyReason === reason && { borderColor: '#DC2626' }]}>
                      {denyReason === reason && <View style={[styles.radioDot, { backgroundColor: '#DC2626' }]} />}
                    </View>
                    <AppText size="xs" weight={denyReason === reason ? 'bold' : 'regular'} style={{ color: colors.text, marginLeft: 8, flex: 1 }}>
                      {reason}
                    </AppText>
                  </TouchableOpacity>
                ))}

                <AppText size="xs" weight="semibold" style={{ color: colors.textSecondary, marginTop: 12, marginBottom: 4 }}>
                  Remarks (Optional)
                </AppText>
                <TextInput
                  style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter remarks..."
                  placeholderTextColor={colors.textTertiary}
                  value={denyComments}
                  onChangeText={setDenyComments}
                  multiline
                  numberOfLines={2}
                />

                <View style={styles.modalBtnRow}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setDenyModalVisible(false)}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    title={actionLoading ? 'Recording...' : 'Deny Entry'}
                    onPress={handleConfirmDeny}
                    disabled={actionLoading}
                    style={{ flex: 1, marginLeft: 8, backgroundColor: '#DC2626' }}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 95,
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
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 56,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  dateFilterBtn: {
    height: 56,
    minWidth: 56,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
    marginBottom: 12,
  },
  calendarPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  calendarNavHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 4,
  },
  calArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calWeekRow: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 6,
  },
  calDayCol: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calDayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calRecordDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  calDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  calClearBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  filterSegmentsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  segmentBtnActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  segmentBtnInactive: {},
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  listContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  loaderWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCard: {
    marginBottom: 12,
    padding: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  overstayCardHighlight: {
    borderWidth: 2,
    backgroundColor: '#FFF5F5',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  badgeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  vehiclePlateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  metaGrid: {
    flexDirection: 'row',
    padding: 10,
    marginTop: 10,
  },
  metaCol: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  metaDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  gateActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  denyActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  iconActionBtnView: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActionBtnEdit: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActionBtnDelete: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    padding: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    marginTop: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
