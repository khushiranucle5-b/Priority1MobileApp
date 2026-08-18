import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { getTable, DBSite } from '../../../services/db';

import { NavIcon, NavIconName } from '../../../components/NavIcon';

type TabType =
  | 'Overview & Settings'
  | 'Geofencing'
  | 'Post Orders'
  | 'Checklists'
  | 'Safety Rules'
  | 'Tour Checkpoints'
  | 'Site Users'
  | 'Site Documents';

export const SiteDetailsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const siteId = route.params?.siteId || 's-12lnsg7-1786085509818';
  const [site, setSite] = useState<DBSite | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Overview & Settings');

  useEffect(() => {
    loadSiteDetails();
  }, [siteId]);

  const loadSiteDetails = async () => {
    const allSites = await getTable<DBSite>('sites');
    const selected = allSites.find((s) => s.id === siteId) || allSites[0] || {
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
      coordinates: { latitude: 23.1189, longitude: 72.5842, radiusMeters: 100 },
      postOrders: [
        { id: 'po-1', title: 'Perimeter Access Control Protocol', version: 'v2.4', lastUpdated: '2026-08-01', status: 'Active' },
      ],
      checklists: [
        { id: 'cl-1', title: 'Morning Shift Opening Inspection', category: 'Safety & Operational', itemsCount: 12, frequency: 'Daily', status: 'Active' },
      ],
      safetyRules: [
        { id: 'sr-1', ruleName: 'Mandatory Hardhat & Hi-Vis Safety Vest Area', description: 'Guards and visitors must wear certified PPE inside Zundal loading dock zones.', status: 'Enforced', effectiveDate: '2026-01-01' },
      ],
      tourCheckpoints: [
        { id: 'cp-1', name: 'Main Entry Gate A', code: 'CP-RN-01', location: 'North Entrance', status: 'Active', sequence: 1 },
      ],
      assignedUsers: [
        { id: 'u-sup-1', name: 'Daniel Brooks', role: 'Supervisor', email: 'daniel.b@priority-one.io' },
        { id: 'u-grd-1', name: 'John Smith', role: 'Guard', email: 'john@priority-one.io' },
      ],
      documents: [
        { id: 'doc-1', title: 'Ranucle Zundal Site Security Directive', category: 'Operations', fileName: 'Ranucle_Zundal_Security_Plan.pdf', fileSize: '2.4 MB', uploadedBy: 'Daniel Brooks', uploadDate: '2026-07-10' },
      ],
    };
    setSite(selected);
  };

  if (!site) {
    return (
      <ScreenLayout activeRoute="SitesList">
        <View style={{ padding: 24, alignItems: 'center' }}>
          <AppText size="base" color="secondary">Loading site details...</AppText>
        </View>
      </ScreenLayout>
    );
  }

  const tabs: { label: TabType; icon: NavIconName }[] = [
    { label: 'Overview & Settings', icon: 'dashboard' },
    { label: 'Geofencing', icon: 'sites' },
    { label: 'Post Orders', icon: 'payslips' },
    { label: 'Checklists', icon: 'attendance' },
    { label: 'Safety Rules', icon: 'loneworker' },
    { label: 'Tour Checkpoints', icon: 'patrol' },
    { label: 'Site Users', icon: 'employees' },
    { label: 'Site Documents', icon: 'policies' },
  ];

  return (
    <ScreenLayout activeRoute="SitesList">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('SitesList')}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <AppText size="base" weight="bold" color="primary">← Back to Sites</AppText>
        </TouchableOpacity>

        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Heading level="h2" color="primary">{site.name}</Heading>
                <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                  <AppText size="xs" weight="bold" style={{ color: '#059669' }}>
                    {site.status.toUpperCase()}
                  </AppText>
                </View>
              </View>

              <AppText size="xs" color="secondary" style={{ marginTop: 4 }}>
                Site ID: <AppText size="xs" weight="bold" color="primary">{site.id}</AppText> • Client: <AppText size="xs" weight="bold" color="primary">{site.clientName}</AppText>
              </AppText>
            </View>

            {/* Read-Only Badge */}
            <View style={[styles.readOnlyBadge, { backgroundColor: '#F1F5F9', borderRadius: borderRadius.sm }]}>
              <AppText size="xs" weight="bold" style={{ color: '#64748B' }}>
                🔒 Read Only (SUPERVISOR)
              </AppText>
            </View>
          </View>
        </Card>

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScrollView}
          contentContainerStyle={styles.tabContainer}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.label;
            return (
              <TouchableOpacity
                key={tab.label}
                onPress={() => setActiveTab(tab.label)}
                style={[styles.tabItem, isActive && styles.activeTabItem]}
                activeOpacity={0.7}
              >
                <View style={{ marginRight: 8, width: 18, alignItems: 'center' }}>
                  <NavIcon name={tab.icon} size={16} active={isActive} color="#64748B" />
                </View>
                <AppText
                  size="sm"
                  weight={isActive ? 'bold' : 'medium'}
                  style={{ color: isActive ? '#4F46E5' : '#64748B' }}
                >
                  {tab.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* TAB CONTENT PANELS */}

        {/* 1. Overview & Settings */}
        {activeTab === 'Overview & Settings' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 14 }}>Site Information & Settings</Heading>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Site Name</AppText>
                <AppText size="sm" weight="bold" color="primary">{site.name}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Site Code</AppText>
                <AppText size="sm" weight="bold" color="primary">{site.code}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Client Association</AppText>
                <AppText size="sm" weight="bold" color="primary">{site.clientName}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Branch</AppText>
                <AppText size="sm" weight="bold" color="primary">{site.branch}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Facility Type</AppText>
                <AppText size="sm" weight="bold" color="primary">{site.facilityType}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Supervisor In-Charge</AppText>
                <AppText size="sm" weight="bold" color="primary">{site.supervisorName}</AppText>
              </View>
            </View>

            <View style={styles.divider} />

            <Heading level="h4" color="primary" style={{ marginBottom: 10 }}>Site Address Details</Heading>
            <View style={styles.addressBox}>
              <AppText size="sm" color="primary">
                {site.addressLine1}{site.addressLine2 ? `, ${site.addressLine2}` : ''}
              </AppText>
              <AppText size="sm" color="secondary" style={{ marginTop: 2 }}>
                {site.city}, {site.state} - {site.postalCode}, {site.country}
              </AppText>
            </View>
          </Card>
        )}

        {/* 2. Geofencing */}
        {activeTab === 'Geofencing' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 12 }}>Geofence Boundaries & Verification</Heading>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Latitude</AppText>
                <AppText size="sm" weight="bold" color="primary">{site.coordinates?.latitude || 23.1189}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Longitude</AppText>
                <AppText size="sm" weight="bold" color="primary">{site.coordinates?.longitude || 72.5842}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Geofence Radius</AppText>
                <AppText size="sm" weight="bold" color="primary">{site.coordinates?.radiusMeters || 100} meters</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Verification Status</AppText>
                <AppText size="sm" weight="bold" style={{ color: '#059669' }}>✓ ACTIVE GEOFENCE</AppText>
              </View>
            </View>
          </Card>
        )}

        {/* 3. Post Orders */}
        {activeTab === 'Post Orders' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 12 }}>Site Post Orders</Heading>
            {(!site.postOrders || site.postOrders.length === 0) ? (
              <AppText size="sm" color="secondary">No post orders configured for this site.</AppText>
            ) : (
              site.postOrders.map((po) => (
                <View key={po.id} style={styles.listItem}>
                  <View style={{ flex: 1 }}>
                    <AppText size="base" weight="bold" color="primary">{po.title}</AppText>
                    <AppText size="xs" color="secondary">Version {po.version} • Updated {po.lastUpdated}</AppText>
                  </View>
                  <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
                    <AppText size="xs" weight="bold" style={{ color: '#059669' }}>{po.status}</AppText>
                  </View>
                </View>
              ))
            )}
          </Card>
        )}

        {/* 4. Checklists */}
        {activeTab === 'Checklists' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 12 }}>Site Checklists</Heading>
            {(!site.checklists || site.checklists.length === 0) ? (
              <AppText size="sm" color="secondary">No checklists configured for this site.</AppText>
            ) : (
              site.checklists.map((cl) => (
                <View key={cl.id} style={styles.listItem}>
                  <View style={{ flex: 1 }}>
                    <AppText size="base" weight="bold" color="primary">{cl.title}</AppText>
                    <AppText size="xs" color="secondary">{cl.category} • {cl.itemsCount} Items • {cl.frequency}</AppText>
                  </View>
                  <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
                    <AppText size="xs" weight="bold" style={{ color: '#059669' }}>{cl.status}</AppText>
                  </View>
                </View>
              ))
            )}
          </Card>
        )}

        {/* 5. Safety Rules */}
        {activeTab === 'Safety Rules' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 12 }}>Site Safety Directives</Heading>
            {(!site.safetyRules || site.safetyRules.length === 0) ? (
              <AppText size="sm" color="secondary">No safety rules configured for this site.</AppText>
            ) : (
              site.safetyRules.map((sr) => (
                <View key={sr.id} style={styles.listItemVertical}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <AppText size="base" weight="bold" color="primary">{sr.ruleName}</AppText>
                    <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                      <AppText size="xs" weight="bold" style={{ color: '#D97706' }}>{sr.status}</AppText>
                    </View>
                  </View>
                  <AppText size="sm" color="secondary" style={{ marginTop: 4 }}>{sr.description}</AppText>
                  <AppText size="xs" color="secondary" style={{ marginTop: 4 }}>Effective: {sr.effectiveDate}</AppText>
                </View>
              ))
            )}
          </Card>
        )}

        {/* 6. Tour Checkpoints */}
        {activeTab === 'Tour Checkpoints' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 12 }}>Site Tour Checkpoints</Heading>
            {(!site.tourCheckpoints || site.tourCheckpoints.length === 0) ? (
              <AppText size="sm" color="secondary">No checkpoints configured for this site.</AppText>
            ) : (
              site.tourCheckpoints.map((cp) => (
                <View key={cp.id} style={styles.listItem}>
                  <View style={{ flex: 1 }}>
                    <AppText size="base" weight="bold" color="primary">{cp.sequence}. {cp.name} ({cp.code})</AppText>
                    <AppText size="xs" color="secondary">Location: {cp.location}</AppText>
                  </View>
                  <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
                    <AppText size="xs" weight="bold" style={{ color: '#059669' }}>{cp.status}</AppText>
                  </View>
                </View>
              ))
            )}
          </Card>
        )}

        {/* 7. Site Users */}
        {activeTab === 'Site Users' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 12 }}>Assigned Site Personnel</Heading>
            {(!site.assignedUsers || site.assignedUsers.length === 0) ? (
              <AppText size="sm" color="secondary">No personnel assigned to this site.</AppText>
            ) : (
              site.assignedUsers.map((user) => (
                <View key={user.id} style={styles.listItem}>
                  <View style={{ flex: 1 }}>
                    <AppText size="base" weight="bold" color="primary">{user.name}</AppText>
                    <AppText size="xs" color="secondary">{user.email}</AppText>
                  </View>
                  <View style={[styles.badge, { backgroundColor: user.role === 'Supervisor' ? '#EEF2FF' : '#F1F5F9' }]}>
                    <AppText size="xs" weight="bold" style={{ color: user.role === 'Supervisor' ? '#4F46E5' : '#475569' }}>
                      {user.role}
                    </AppText>
                  </View>
                </View>
              ))
            )}
          </Card>
        )}

        {/* 8. Site Documents */}
        {activeTab === 'Site Documents' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 12 }}>Site Operations & Compliance Documents</Heading>
            {(!site.documents || site.documents.length === 0) ? (
              <AppText size="sm" color="secondary">No documents uploaded for this site.</AppText>
            ) : (
              site.documents.map((doc) => (
                <View key={doc.id} style={styles.docItem}>
                  <View style={{ flex: 1 }}>
                    <AppText size="base" weight="bold" color="primary">{doc.title}</AppText>
                    <AppText size="xs" color="secondary">
                      {doc.category} • {doc.fileName} ({doc.fileSize})
                    </AppText>
                    <AppText size="xs" color="secondary">
                      Uploaded by {doc.uploadedBy} on {doc.uploadDate}
                    </AppText>
                  </View>

                  <View style={styles.docActions}>
                    <Button
                      title="View"
                      variant="outline"
                      size="small"
                      onPress={() => Alert.alert('Viewing Document', `Opening ${doc.fileName}...`)}
                      style={{ paddingHorizontal: 10, minHeight: 36 }}
                    />
                    <Button
                      title="Download"
                      variant="primary"
                      size="small"
                      onPress={() => Alert.alert('Downloading Document', `Downloading ${doc.fileName}...`)}
                      style={{ paddingHorizontal: 10, minHeight: 36 }}
                    />
                  </View>
                </View>
              ))
            )}
          </Card>
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
  backBtn: {
    marginBottom: 12,
  },
  headerCard: {
    padding: 18,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  readOnlyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tabScrollView: {
    marginBottom: 16,
  },
  tabContainer: {
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 44,
  },
  activeTabItem: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  tabIcon: {
    marginRight: 6,
    fontSize: 15,
  },
  contentCard: {
    padding: 18,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  infoBox: {
    width: '50%',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  addressBox: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  listItemVertical: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  docItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  docActions: {
    flexDirection: 'row',
    gap: 6,
  },
});
