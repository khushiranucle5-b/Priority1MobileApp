import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getTable, saveTable, DBSite } from '../../../services/db';
import { NavIcon } from '../../../components/NavIcon';
import { FilterBottomSheet } from '../../../components/FilterBottomSheet';

const DEFAULT_SITES: DBSite[] = [
  {
    id: 's-04',
    companyId: 'c-1',
    name: 'Ranucle zundal',
    code: 's-04',
    clientName: 'Ranucle Group',
    branch: 'West Zone Branch',
    facilityType: 'Commercial Port / Terminal',
    supervisorName: 'Daniel Brooks',
    guardsCount: 15,
    riskLevel: 'Medium',
    contractEnd: '2027-12-31',
    status: 'active',
    addressLine1: 'Zundal Circle, Gandhinagar, Gujarat 382424, India',
    addressLine2: 'Plot 42, Zundal Industrial Estate',
    city: 'Gandhinagar',
    state: 'Gujarat',
    postalCode: '382424',
    country: 'India',
    coordinates: {
      latitude: 23.1437,
      longitude: 72.5902,
      radiusMeters: 150,
    },
    contact: {
      primaryContactName: 'Alex Mendes (Facilities Director)',
      contactEmail: 'alex.mendes@ranucle.com',
      primaryPhone: '+351 912 345 678',
      alternatePhone: '+351 265 550 120',
    },
    operationalSettings: {
      requireGpsEnabled: true,
      enableLocationTracking: true,
      enableShiftScheduling: true,
      allowGuardMobileAccess: true,
    },
    internalNotes: 'High priority commercial port & container terminal site.',
    geofence: {
      boundaryType: 'Circle',
      latitude: 23.1437,
      longitude: 72.5902,
      radiusMeters: 150,
      status: 'Active Boundary',
      enableGeofenceValidation: true,
      requireGeofenceClockIn: true,
      requireGeofenceClockOut: true,
      requireLocationPermission: true,
      outsideBoundaryAction: 'Allow But Flag Exception',
      accuracyThresholdMeters: 50,
    },
    postOrders: [
      { id: 'po-1', priority: 'High', title: 'aaaa', category: 'Access Control', version: 'v1.0', effectiveDate: '2026-08-11', expiryDate: 'Indefinite', lastUpdated: '2026-08-11', status: 'Active' },
      { id: 'po-2', priority: 'Medium', title: 'Perimeter Access Control Protocol', category: 'Security Protocol', version: 'v2.4', effectiveDate: '2026-08-01', expiryDate: '2027-12-31', lastUpdated: '2026-08-01', status: 'Active' },
    ],
    checklists: [
      { id: 'cl-1', priority: 'High', title: 'Medical Emergency Checklist', category: 'Emergency Response', description: 'Standard response procedure for on-site medical emergencies', steps: ['1. Call 911 immediately', '2. Render First Aid / CPR if certified', '3. Guide paramedic unit to gate', '4. Notify site supervisor'], itemsCount: 4, frequency: 'Emergency', status: 'Active' },
    ],
    safetyConfig: {
      shiftRules: { minMinsBeforeShift: 15, maxMinsAfterShift: 30, minMinsBeforeEnd: 10, maxMinsAfterEnd: 15 },
      officerShiftChecks: { enabled: true, intervalMins: 60, graceMins: 10 },
      loneWorkerChecks: { enabled: true, intervalMins: 30, graceMins: 5 },
    },
    tourCheckpoints: [
      { id: 'cp-1', name: 'Main Entry Gate A', code: 'CP-RN-01', location: 'North Entrance', status: 'Active', sequence: 1 },
      { id: 'cp-2', name: 'Chemical Storage Bay', code: 'CP-RN-02', location: 'East Sector', status: 'Active', sequence: 2 },
      { id: 'cp-3', name: 'Loading Dock 4', code: 'CP-RN-03', location: 'South Dock', status: 'Active', sequence: 3 },
    ],
    assignedUsers: [
      { id: 'u-user-1', name: 'Michael Carter', username: 'michael.carter', email: 'michael.carter@acme.io', role: 'Command Supervisor', shiftTiming: '08:00 AM - 08:00 PM', shiftPeriod: '2026-08-01 to 2026-12-31' },
      { id: 'u-user-2', name: 'richerl Rohde', username: 'richerl_rohde', email: 'richerl@acme.io', role: 'Security Guard', shiftTiming: '06:00 - 13:00', shiftPeriod: 'August 13, 2026' },
      { id: 'u-user-3', name: 'abc xyz', username: 'abc_xyz', email: 'abc@acme.io', role: 'Security Guard', shiftTiming: '08:00 AM - 04:00 PM', shiftPeriod: '2026-08-01 to 2026-12-31' },
    ],
    documents: [
      { id: 'doc-1', title: 'Ranucle Zundal Site Security Directive', category: 'Operations', fileName: 'Ranucle_Zundal_Security_Plan.pdf', fileSize: '2.4 MB', uploadedBy: 'Daniel Brooks', uploadDate: '2026-07-10' },
    ],
  },
  {
    id: 's-02',
    companyId: 'c-1',
    name: 'HQ Corporate Tower',
    code: 'SIT-HQ-002',
    clientName: 'Priority One Corp',
    branch: 'Central HQ Branch',
    facilityType: 'Commercial High-rise',
    supervisorName: 'Jane Smith',
    guardsCount: 5,
    riskLevel: 'Low',
    contractEnd: '2028-01-15',
    status: 'active',
    addressLine1: '100 Financial Plaza',
    city: 'San Francisco',
    state: 'California',
    postalCode: '94111',
    country: 'United States',
    coordinates: { latitude: 37.7749, longitude: -122.4194, radiusMeters: 50 },
  },
  {
    id: 's-01',
    companyId: 'c-1',
    name: 'Harbor Terminal 3',
    code: 'SIT-HT-001',
    clientName: 'Port Authority',
    branch: 'Maritime District',
    facilityType: 'Port & Container Terminal',
    supervisorName: 'Elena Ruiz',
    guardsCount: 8,
    riskLevel: 'Medium',
    contractEnd: '2027-06-30',
    status: 'active',
    addressLine1: 'Pier 44, Maritime Terminal Way',
    city: 'San Francisco',
    state: 'California',
    postalCode: '94105',
    country: 'United States',
    coordinates: { latitude: 37.7751, longitude: -122.4192, radiusMeters: 150 },
  },
];

export const SitesListScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [sites, setSites] = useState<DBSite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [riskDropdownOpen, setRiskDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadSites();
    }
  }, [isFocused]);

  const loadSites = async () => {
    const data = await getTable<DBSite>('sites');
    if (!data || data.length === 0) {
      setSites(DEFAULT_SITES);
      await saveTable('sites', DEFAULT_SITES);
    } else {
      setSites(data);
    }
  };

  const filteredSites = sites.filter((site) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (site.name || '').toLowerCase().includes(q) ||
      (site.code || '').toLowerCase().includes(q) ||
      (site.id || '').toLowerCase().includes(q) ||
      (site.clientName || '').toLowerCase().includes(q) ||
      (site.branch || '').toLowerCase().includes(q) ||
      (site.supervisorName || '').toLowerCase().includes(q) ||
      (site.addressLine1 || '').toLowerCase().includes(q) ||
      (site.city || '').toLowerCase().includes(q) ||
      (site.state || '').toLowerCase().includes(q);

    const matchesRisk =
      riskFilter === 'All' ||
      (site.riskLevel || '').toLowerCase() === riskFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'All' ||
      (site.status || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRisk && matchesStatus;
  });

  const getRiskBadgeColor = (risk?: string) => {
    switch ((risk || '').toLowerCase()) {
      case 'high':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'medium':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'low':
      default:
        return { bg: '#D1FAE5', text: '#059669' };
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'active':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'inactive':
      default:
        return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  return (
    <ScreenLayout activeRoute="SitesList">
      <PageHeader title="Sites" showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Block */}
        <View style={styles.headerBlock}>
          <Heading level="h2" color="primary">Sites</Heading>
          <AppText size="sm" color="secondary" style={{ marginTop: 2 }}>
            Protected Sites • Client sites, coverage, risk tier and geofencing.
          </AppText>
        </View>

        {/* Search & Filter Bar Component (Matching Incident Reports style) */}
        <View style={styles.searchFilterContainer}>
          {/* Full-width rounded search input */}
          <View style={styles.searchBar}>
            <View style={{ marginRight: 8 }}>
              <NavIcon name="search" size={18} color="#64748B" />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search site, client, code, address..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <AppText size="sm" weight="bold" style={{ color: '#64748B' }}>✕</AppText>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Compact Filter Row matching Incident Reports */}
          <View style={styles.filterTriggersRow}>
            {/* Risk Tier Dropdown Trigger */}
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                setRiskDropdownOpen(!riskDropdownOpen);
                setStatusDropdownOpen(false);
              }}
              activeOpacity={0.8}
            >
              <AppText size="sm" color="secondary" style={{ marginRight: 4 }}>Risk:</AppText>
              <AppText size="sm" weight="bold" style={{ color: '#475569', marginRight: 4 }}>
                {riskFilter}
              </AppText>
              <AppText size="sm" color="secondary">{riskDropdownOpen ? '▲' : '▼'}</AppText>
            </TouchableOpacity>

            {/* Status Dropdown Trigger */}
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setRiskDropdownOpen(false);
              }}
              activeOpacity={0.8}
            >
              <AppText size="sm" color="secondary" style={{ marginRight: 4 }}>Status:</AppText>
              <AppText size="sm" weight="bold" style={{ color: '#475569', marginRight: 4 }}>
                {statusFilter}
              </AppText>
              <AppText size="sm" color="secondary">{statusDropdownOpen ? '▲' : '▼'}</AppText>
            </TouchableOpacity>
          </View>

        {/* Risk Tier Filter Bottom Sheet */}
        <FilterBottomSheet
          visible={riskDropdownOpen}
          onClose={() => setRiskDropdownOpen(false)}
          title="Select Risk Level"
          options={[
            { label: 'All Risk Levels', value: 'All' },
            { label: 'Low', value: 'Low' },
            { label: 'Medium', value: 'Medium' },
            { label: 'High', value: 'High' },
          ]}
          selectedValue={riskFilter}
          onSelect={(val) => setRiskFilter(val)}
        />

        {/* Status Filter Bottom Sheet */}
        <FilterBottomSheet
          visible={statusDropdownOpen}
          onClose={() => setStatusDropdownOpen(false)}
          title="Select Status"
          options={[
            { label: 'All Statuses', value: 'All' },
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
          ]}
          selectedValue={statusFilter}
          onSelect={(val) => setStatusFilter(val)}
        />
        </View>

        {/* List Title */}
        <View style={styles.listHeaderRow}>
          <Heading level="h3" color="primary">Protected Sites List ({filteredSites.length})</Heading>
        </View>

        {/* Site Cards List */}
        {filteredSites.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <NavIcon name="sites" size={36} color="#94A3B8" />
            <AppText size="base" color="secondary" style={{ marginTop: 10, textAlign: 'center' }}>
              No sites match your search query or filter criteria.
            </AppText>
          </Card>
        ) : (
          filteredSites.map((site) => {
            const riskColors = getRiskBadgeColor(site.riskLevel);
            const statusColors = getStatusBadgeColor(site.status);

            return (
              <Card key={site.id} style={styles.siteCard}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('SiteDetails', { siteId: site.id })}
                >
                  {/* Card Header */}
                  <View style={styles.siteCardHeader}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Heading level="h3" color="primary">{site.name}</Heading>
                      <AppText size="sm" color="secondary" style={{ marginTop: 2 }}>
                        Client: <AppText size="sm" weight="bold" color="primary">{site.clientName}</AppText>
                      </AppText>
                    </View>

                    <View style={styles.badgeGroup}>
                      <View style={[styles.badge, { backgroundColor: riskColors.bg }]}>
                        <AppText size="sm" weight="bold" style={{ color: riskColors.text }}>
                          {site.riskLevel} Risk
                        </AppText>
                      </View>
                      <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
                        <AppText size="sm" weight="bold" style={{ color: statusColors.text }}>
                          {(site.status || 'ACTIVE').toUpperCase()}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Card Details Grid */}
                  <View style={styles.grid}>
                    <View style={styles.gridCol}>
                      <AppText size="sm" color="secondary">Branch:</AppText>
                      <AppText size="base" weight="bold" color="primary" numberOfLines={1}>{site.branch}</AppText>
                    </View>

                    <View style={styles.gridCol}>
                      <AppText size="sm" color="secondary">Supervisor:</AppText>
                      <AppText size="base" weight="bold" color="primary" numberOfLines={1}>{site.supervisorName}</AppText>
                    </View>

                    <View style={styles.gridCol}>
                      <AppText size="sm" color="secondary">Guards on Site:</AppText>
                      <AppText size="base" weight="bold" color="primary">{site.guardsCount} Guards</AppText>
                    </View>

                    <View style={styles.gridCol}>
                      <AppText size="sm" color="secondary">Contract End:</AppText>
                      <AppText size="base" weight="bold" color="primary">{site.contractEnd}</AppText>
                    </View>
                  </View>

                  {/* Action Footer with View Icon Button */}
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.viewIconButton}
                      onPress={() => navigation.navigate('SiteDetails', { siteId: site.id })}
                      activeOpacity={0.7}
                    >
                      <NavIcon name="eye" size={20} color="#4F46E5" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Card>
            );
          })
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBlock: {
    marginBottom: 12,
  },
  searchFilterContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  filterTriggersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dropdownTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 10,
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 4,
    marginTop: 6,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  dropdownItemActive: {
    backgroundColor: '#EEF2FF',
  },
  listHeaderRow: {
    marginBottom: 12,
  },
  siteCard: {
    padding: 16,
    marginBottom: 14,
  },
  siteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
    marginBottom: 12,
  },
  gridCol: {
    width: '50%',
    paddingRight: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  viewIconButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
