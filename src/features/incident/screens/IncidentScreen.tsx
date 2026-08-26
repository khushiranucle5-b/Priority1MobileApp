import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { StatusBadge, StatusType } from '../../../components/StatusBadge';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getTable, DBIncident } from '../../../services/db';
import { NavIcon } from '../../../components/NavIcon';
import { FilterBottomSheet } from '../../../components/FilterBottomSheet';

export const IncidentScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { guardName, guardId, assignedSite } = useGuardStore();

  const [incidents, setIncidents] = useState<DBIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Under Review' | 'Resolved' | 'High / Critical'>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadIncidents();
    }
  }, [isFocused, guardId]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const all = await getTable<DBIncident>('incidents');
      // Filter for logged-in guard only
      const myIncidents = (all || []).filter((item) => {
        if (!item) return false;
        const matchesId = guardId && item.reportedById && item.reportedById === guardId;
        const matchesName = guardName && item.reportedBy && item.reportedBy.toLowerCase() === guardName.toLowerCase();
        const isDefault = !item.reportedById || item.reportedById === 'guard-1' || item.reportedBy === 'Khushi Rani';
        return matchesId || matchesName || isDefault;
      });

      setIncidents(myIncidents);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    'All Statuses',
    'Open',
    'Under Review',
    'Resolved',
    'High / Critical',
  ] as const;

  const filteredIncidents = incidents.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const titleMatch = (item.title || '').toLowerCase().includes(q);
    const codeMatch = (item.incidentCode || item.id || '').toLowerCase().includes(q);
    const siteMatch = (item.site || '').toLowerCase().includes(q);
    const categoryMatch = (item.category || '').toLowerCase().includes(q);

    const matchesSearch = !q || titleMatch || codeMatch || siteMatch || categoryMatch;

    let matchesStatus = true;
    const st = (item.status || '').toLowerCase();
    if (statusFilter === 'Open') {
      matchesStatus = st === 'open';
    } else if (statusFilter === 'Under Review') {
      matchesStatus = st === 'under review' || st === 'under_review';
    } else if (statusFilter === 'Resolved') {
      matchesStatus = st === 'resolved';
    } else if (statusFilter === 'High / Critical') {
      const s = (item.severity || '').toLowerCase();
      matchesStatus = s === 'high' || s === 'critical';
    }

    return matchesSearch && matchesStatus;
  });

  const getMappedStatusType = (status?: string): StatusType => {
    switch (status) {
      case 'Resolved': return 'success';
      case 'Under Review': return 'info';
      case 'Open': default: return 'warning';
    }
  };

  return (
    <ScreenLayout activeRoute="Incident">
      <PageHeader title="My Incident Reports" showBack />

      <View style={styles.mainContainer}>
        {/* Search & Dropdown Filter Row */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchInputWrapper}>
            <NavIcon name="search" size={22} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search incidents..."
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
              Filter: {statusFilter === 'All' ? 'All' : statusFilter}
            </AppText>
            <AppText size="xs" color="secondary">
              {dropdownOpen ? '▲' : '▼'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Incident Status Filter Bottom Sheet */}
        <FilterBottomSheet
          visible={dropdownOpen}
          onClose={() => setDropdownOpen(false)}
          title="Select Incident Status"
          options={filterOptions.map((opt) => ({
            label: opt,
            value: opt === 'All Statuses' ? 'All' : opt,
          }))}
          selectedValue={statusFilter}
          onSelect={(val) => setStatusFilter(val as any)}
        />

        {/* Incidents List */}
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <AppText size="sm" color="secondary" style={{ marginTop: 10 }}>Loading incident logs...</AppText>
            </View>
          ) : filteredIncidents.length === 0 ? (
            <Card style={{ padding: 24, alignItems: 'center', marginHorizontal: 16 }}>
              <NavIcon name="incidents" size={36} color="#94A3B8" />
              <AppText size="sm" color="secondary" style={{ marginTop: 10, textAlign: 'center' }}>
                {searchQuery || statusFilter !== 'All'
                  ? 'No incident reports match your search or filter.'
                  : 'No incidents reported by your account yet.'}
              </AppText>
            </Card>
          ) : (
            filteredIncidents.map((item) => (
              <Card key={item.id} variant="outlined" style={styles.card}>
                <View style={styles.headerRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <AppText size="lg" weight="bold" color="primary" numberOfLines={1}>{(item.title || 'Untitled').toUpperCase()}</AppText>
                  </View>
                  <StatusBadge status={item.status || 'Open'} type={getMappedStatusType(item.status)} size="md" />
                </View>
                
                <View style={[styles.detailRow, { marginTop: spacing.sm }]}>
                  <View>
                    <AppText size="xs" color="secondary" weight="semibold">DATE</AppText>
                    <AppText size="base" weight="bold" color="primary" style={{ marginTop: 2 }}>
                      {item.date}
                    </AppText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText size="xs" color="secondary" weight="semibold">INCIDENT TYPE</AppText>
                    <AppText size="base" weight="bold" style={{ color: colors.primary[600] || '#2563eb', marginTop: 2 }}>
                      {item.category || 'General'}
                    </AppText>
                  </View>
                </View>

                <View style={{ marginTop: 10 }}>
                  <AppText size="xs" color="secondary" weight="semibold">LOCATION</AppText>
                  <AppText size="base" color="text" weight="medium" style={{ marginTop: 2 }}>
                    {item.site || assignedSite || 'Ahmedabad Plant'}
                  </AppText>
                </View>

                <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={styles.iconActionBtnEdit}
                    onPress={() => navigation.navigate('FileIncident', { incidentId: item.id })}
                    activeOpacity={0.7}
                    accessibilityLabel="Edit incident"
                    accessibilityRole="button"
                  >
                    <NavIcon name="edit" size={24} color="#4F46E5" />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </ScrollView>

        {/* Floating Action Button (FAB) for REPORT INCIDENT */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('FileIncident')}
          activeOpacity={0.85}
          accessibilityLabel="Report incident"
          accessibilityRole="button"
        >
          <NavIcon name="incidents" size={22} color="#FFFFFF" />
          <AppText size="base" weight="bold" style={styles.floatingButtonText}>
            REPORT INCIDENT
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
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
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
    paddingHorizontal: 16,
  },
  centerBox: {
    padding: 40,
    alignItems: 'center',
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  iconActionBtnEdit: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
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
