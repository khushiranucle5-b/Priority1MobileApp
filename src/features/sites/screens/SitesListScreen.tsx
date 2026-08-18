import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { getTable, saveTable, insertRow, DBSite } from '../../../services/db';

const DEFAULT_SITES: DBSite[] = [
  {
    id: 's-12lnsg7-1786085509818',
    companyId: 'c-1',
    name: 'Ahmedabad Plant (Ranucle Zundal)',
    code: 'SIT-RN-004',
    clientName: 'Ranucle Corp',
    branch: 'West Zone Branch',
    facilityType: 'Industrial Plant & Logistics',
    supervisorName: 'Daniel Brooks',
    guardsCount: 6,
    riskLevel: 'High',
    contractEnd: '2027-12-31',
    status: 'active',
    addressLine1: 'Plot 42, Zundal Industrial Park',
    addressLine2: 'Near SG Highway Ring Road',
    city: 'Ahmedabad',
    state: 'Gujarat',
    postalCode: '382421',
    country: 'India',
    coordinates: {
      latitude: 23.1189,
      longitude: 72.5842,
      radiusMeters: 100,
    },
    postOrders: [
      { id: 'po-1', title: 'Perimeter Access Control Protocol', version: 'v2.4', lastUpdated: '2026-08-01', status: 'Active' },
      { id: 'po-2', title: 'Night Patrol & Hazard Escort Procedure', version: 'v1.8', lastUpdated: '2026-07-15', status: 'Active' },
    ],
    checklists: [
      { id: 'cl-1', title: 'Morning Shift Opening Inspection', category: 'Safety & Operational', itemsCount: 12, frequency: 'Daily', status: 'Active' },
    ],
    safetyRules: [
      { id: 'sr-1', ruleName: 'Mandatory Hardhat & Hi-Vis Safety Vest Area', description: 'Guards and visitors must wear certified PPE inside Zundal loading dock zones.', status: 'Enforced', effectiveDate: '2026-01-01' },
    ],
    tourCheckpoints: [
      { id: 'cp-1', name: 'Main Entry Gate A', code: 'CP-RN-01', location: 'North Entrance', status: 'Active', sequence: 1 },
      { id: 'cp-2', name: 'Chemical Storage Bay', code: 'CP-RN-02', location: 'East Sector', status: 'Active', sequence: 2 },
    ],
    assignedUsers: [
      { id: 'u-sup-1', name: 'Daniel Brooks', role: 'Supervisor', email: 'daniel.b@priority-one.io' },
      { id: 'u-grd-1', name: 'John Smith', role: 'Guard', email: 'john@priority-one.io' },
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
    addressLine2: 'Floors 1 - 15',
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
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();

  const [sites, setSites] = useState<DBSite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadSites();
  }, []);

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
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = riskFilter === 'All' || site.riskLevel.toLowerCase() === riskFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || site.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRisk && matchesStatus;
  });

  const getRiskBadgeColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'medium':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'low':
      default:
        return { bg: '#D1FAE5', text: '#059669' };
    }
  };

  return (
    <ScreenLayout activeRoute="SitesList">
      <PageHeader
        title="Sites"
        showBack
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Subtitle */}
        <View style={{ marginBottom: 14 }}>
          <AppText size="sm" color="secondary">
            Protected Sites • Client sites, coverage, risk tier and geofencing.
          </AppText>
        </View>

        {/* Filters Bar */}
        <Card style={styles.filterCard}>
          <View style={styles.searchBox}>
            <AppText style={styles.searchIcon}>🔍</AppText>
            <TextInput
              placeholder="Search site, client, code, address..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.filterRow}>
            {/* Risk Filters */}
            <View style={styles.filterGroup}>
              <AppText size="xs" color="secondary" style={styles.filterLabel}>Risk Tier:</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {['All', 'Low', 'Medium', 'High'].map((risk) => (
                  <TouchableOpacity
                    key={risk}
                    onPress={() => setRiskFilter(risk)}
                    style={[
                      styles.chip,
                      riskFilter === risk && styles.activeChip,
                    ]}
                  >
                    <AppText
                      size="xs"
                      weight={riskFilter === risk ? 'bold' : 'regular'}
                      style={{ color: riskFilter === risk ? '#FFFFFF' : '#475569' }}
                    >
                      {risk}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Status Filters */}
            <View style={styles.filterGroup}>
              <AppText size="xs" color="secondary" style={styles.filterLabel}>Status:</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {['All', 'Active', 'Inactive'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setStatusFilter(status)}
                    style={[
                      styles.chip,
                      statusFilter === status && styles.activeChip,
                    ]}
                  >
                    <AppText
                      size="xs"
                      weight={statusFilter === status ? 'bold' : 'regular'}
                      style={{ color: statusFilter === status ? '#FFFFFF' : '#475569' }}
                    >
                      {status}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Card>

        {/* Sites Table / List */}
        <View style={styles.headerTitleRow}>
          <Heading level="h4" color="primary">Protected Sites List ({filteredSites.length})</Heading>
        </View>

        {filteredSites.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <AppText size="base" color="secondary">No sites match the current search or filters.</AppText>
          </Card>
        ) : (
          filteredSites.map((site) => {
            const riskColors = getRiskBadgeColor(site.riskLevel);
            return (
              <Card key={site.id} style={styles.siteCard}>
                <View style={styles.siteHeader}>
                  <View style={{ flex: 1 }}>
                    <Heading level="h4" color="primary">{site.name}</Heading>
                    <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                      {site.code} • Client: <AppText size="xs" weight="bold" color="primary">{site.clientName}</AppText>
                    </AppText>
                  </View>

                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: riskColors.bg }]}>
                      <AppText size="xs" weight="bold" style={{ color: riskColors.text }}>
                        {site.riskLevel} Risk
                      </AppText>
                    </View>
                    <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
                      <AppText size="xs" weight="bold" style={{ color: '#059669' }}>
                        {site.status.toUpperCase()}
                      </AppText>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Details Grid */}
                <View style={styles.grid}>
                  <View style={styles.gridItem}>
                    <AppText size="xs" color="secondary">Branch</AppText>
                    <AppText size="sm" weight="bold" color="primary">{site.branch}</AppText>
                  </View>

                  <View style={styles.gridItem}>
                    <AppText size="xs" color="secondary">Supervisor</AppText>
                    <AppText size="sm" weight="bold" color="primary">{site.supervisorName}</AppText>
                  </View>

                  <View style={styles.gridItem}>
                    <AppText size="xs" color="secondary">Guards On Site</AppText>
                    <AppText size="sm" weight="bold" color="primary">{site.guardsCount} Guards</AppText>
                  </View>

                  <View style={styles.gridItem}>
                    <AppText size="xs" color="secondary">Contract End</AppText>
                    <AppText size="sm" weight="bold" color="primary">{site.contractEnd}</AppText>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <AppText size="xs" color="secondary">
                    📍 {site.addressLine1}, {site.city}
                  </AppText>

                  <Button
                    title="View Site Details →"
                    variant="outline"
                    size="medium"
                    onPress={() => navigation.navigate('SiteDetails', { siteId: site.id })}
                    style={{ minHeight: 44, paddingHorizontal: 16 }}
                  />
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
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  filterCard: {
    padding: 16,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  filterRow: {
    gap: 12,
  },
  filterGroup: {
    gap: 4,
  },
  filterLabel: {
    marginBottom: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  activeChip: {
    backgroundColor: '#4F46E5',
  },
  headerTitleRow: {
    marginBottom: 12,
  },
  siteCard: {
    padding: 16,
    marginBottom: 14,
  },
  siteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
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
    marginBottom: 14,
  },
  gridItem: {
    width: '50%',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
});
