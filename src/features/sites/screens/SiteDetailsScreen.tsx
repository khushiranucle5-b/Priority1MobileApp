import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
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
  const { colors, borderRadius } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const siteId = route.params?.siteId || 's-12lnsg7-1786085509818';
  const [site, setSite] = useState<DBSite | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Overview & Settings');

  const tabScrollViewRef = useRef<ScrollView>(null);
  const [scrollXOffset, setScrollXOffset] = useState(0);

  useEffect(() => {
    loadSiteDetails();
  }, [siteId]);

  const loadSiteDetails = async () => {
    const allSites = await getTable<DBSite>('sites');
    const selected = allSites.find((s) => s.id === siteId) || allSites[0] || null;
    setSite(selected);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('SitesList');
    }
  };

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

  const handleScrollLeft = () => {
    const newX = Math.max(0, scrollXOffset - 160);
    tabScrollViewRef.current?.scrollTo({ x: newX, animated: true });
    setScrollXOffset(newX);
  };

  const handleScrollRight = () => {
    const newX = scrollXOffset + 160;
    tabScrollViewRef.current?.scrollTo({ x: newX, animated: true });
    setScrollXOffset(newX);
  };

  if (!site) {
    return (
      <ScreenLayout activeRoute="SitesList">
        <PageHeader title="Site Details" showBack onBack={handleBack} />
        <View style={{ padding: 24, alignItems: 'center' }}>
          <AppText size="base" color="secondary">Loading site details...</AppText>
        </View>
      </ScreenLayout>
    );
  }

  // Extract site overview data defaults matching Web Site specs
  const addressStr = site.addressLine1 || 'S.P.Ring Road (Zundal), Ahmedabad, Gujarat 382424, India';
  const cityStr = site.city || 'Ahmedabad';
  const stateStr = site.state || 'Gujarat';
  const postalCodeStr = site.postalCode || '382424';
  const countryStr = site.country || 'India';
  const facilityTypeStr = site.facilityType || 'Commercial Port / Terminal';
  const clientStr = site.clientName || 'Ranucle';
  const codeStr = site.code || site.id;

  const contact = site.contact || {
    primaryContactName: site.supervisorName || 'Daniel Brooks',
    contactEmail: 'daniel.b@ranucle.com',
    primaryPhone: '+91 98765 43210',
    alternatePhone: '+91 98765 43211',
  };

  const operational = site.operationalSettings || {
    requireGpsEnabled: true,
    enableLocationTracking: true,
    enableShiftScheduling: true,
    allowGuardMobileAccess: true,
  };

  const internalNotes = site.internalNotes || 'High priority commercial port & container terminal site. Strict geofence validation and PPE safety compliance required at all perimeter gates.';

  const geofence = site.geofence || {
    boundaryType: 'Circle',
    latitude: site.coordinates?.latitude || 23.129695,
    longitude: site.coordinates?.longitude || 72.58482,
    radiusMeters: site.coordinates?.radiusMeters || 150,
    status: 'ACTIVE GEOFENCE',
    enableGeofenceValidation: true,
    requireGeofenceClockIn: true,
    requireGeofenceClockOut: true,
    requireLocationPermission: true,
    outsideBoundaryAction: 'Allow But Flag Exception',
    accuracyThresholdMeters: 50,
  };

  const postOrders = site.postOrders || [
    { id: 'po-1', priority: 'High', title: 'aaaa', category: 'Access Control', version: 'v1.0', effectiveDate: '2026-08-11', expiryDate: 'Indefinite', status: 'Active' },
    { id: 'po-2', priority: 'Medium', title: 'Perimeter Access Control Protocol', category: 'Security Protocol', version: 'v2.4', effectiveDate: '2026-08-01', expiryDate: '2027-12-31', status: 'Active' },
  ];

  const checklists = site.checklists || [
    {
      id: 'cl-1',
      priority: 'High',
      title: 'Medical Emergency Checklist',
      category: 'Emergency Response',
      description: 'Standard response procedure for on-site medical emergencies',
      steps: [
        '1. Call 911 immediately',
        '2. Render First Aid / CPR if certified',
        '3. Guide paramedic unit to gate',
        '4. Notify site supervisor',
      ],
      itemsCount: 4,
      status: 'Active',
    },
    {
      id: 'cl-2',
      priority: 'Medium',
      title: 'Morning Shift Opening Inspection',
      category: 'Safety & Operational',
      description: 'Daily verification of perimeter gates and guard room logs.',
      steps: [
        '1. Verify main entry gate locks',
        '2. Inspect CCTV monitor feeds',
        '3. Check radio battery charge levels',
        '4. Log shift handover report',
      ],
      itemsCount: 12,
      status: 'Active',
    },
  ];

  const safetyConfig = site.safetyConfig || {
    shiftRules: { minMinsBeforeShift: 15, maxMinsAfterShift: 30, minMinsBeforeEnd: 10, maxMinsAfterEnd: 15 },
    officerShiftChecks: { enabled: true, intervalMins: 60, graceMins: 10 },
    loneWorkerChecks: { enabled: true, intervalMins: 30, graceMins: 5 },
  };

  const checkpoints = site.tourCheckpoints || [
    { id: 'cp-1', name: 'Main Entry Gate A', code: 'CP-RN-01', location: 'North Entrance', status: 'Active', sequence: 1 },
    { id: 'cp-2', name: 'Chemical Storage Bay', code: 'CP-RN-02', location: 'East Sector', status: 'Active', sequence: 2 },
    { id: 'cp-3', name: 'Loading Dock 4', code: 'CP-RN-03', location: 'South Dock', status: 'Active', sequence: 3 },
  ];

  const assignedUsers = site.assignedUsers || [
    { id: 'u-1', name: 'Michael Carter', username: 'michael.carter', email: 'michael.carter@acme.io', role: 'Command Supervisor', shiftTiming: '08:00 AM - 08:00 PM', shiftPeriod: '2026-08-01 to 2026-12-31' },
    { id: 'u-2', name: 'richerl Rohde', username: 'richerl_rohde', email: 'richerl@acme.io', role: 'Security Guard', shiftTiming: '06:00 - 13:00', shiftPeriod: 'August 13, 2026' },
    { id: 'u-3', name: 'abc xyz', username: 'abc_xyz', email: 'abc@acme.io', role: 'Security Guard', shiftTiming: '08:00 AM - 04:00 PM', shiftPeriod: '2026-08-01 to 2026-12-31' },
  ];

  const documents = site.documents || [
    { id: 'doc-1', title: 'Ranucle Zundal Site Security Directive', category: 'Operations', fileName: 'Ranucle_Zundal_Security_Plan.pdf', fileSize: '2.4 MB', uploadedBy: 'Daniel Brooks', uploadDate: '2026-07-10' },
    { id: 'doc-2', title: 'Emergency Evacuation & Fire Map', category: 'Compliance', fileName: 'Zundal_Evac_Map_2026.pdf', fileSize: '1.1 MB', uploadedBy: 'Daniel Brooks', uploadDate: '2026-07-12' },
  ];

  return (
    <ScreenLayout activeRoute="SitesList">
      <PageHeader title="Site Details" showBack onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Back Link Button */}
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
        </TouchableOpacity>

        {/* Site Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={styles.titleRow}>
                <Heading level="h2" color="primary">{site.name}</Heading>
                <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                  <AppText size="xs" weight="bold" style={{ color: '#059669' }}>
                    {(site.status || 'ACTIVE').toUpperCase()}
                  </AppText>
                </View>
              </View>

              <AppText size="xs" color="secondary" style={{ marginTop: 4 }}>
                Site ID: <AppText size="xs" weight="bold" color="primary">{codeStr}</AppText> • Client: <AppText size="xs" weight="bold" color="primary">{clientStr}</AppText>
              </AppText>
            </View>

            {/* Read-Only Badge */}
           
          </View>
        </Card>

        {/* Horizontal Navigation Tab Bar with Slider Arrows */}
        <View style={styles.tabBarWrapper}>
          <TouchableOpacity
            style={styles.sliderArrowBtn}
            onPress={handleScrollLeft}
            activeOpacity={0.7}
          >
            <AppText size="sm" weight="bold" style={{ color: '#4F46E5' }}>‹</AppText>
          </TouchableOpacity>

          <ScrollView
            ref={tabScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => setScrollXOffset(e.nativeEvent.contentOffset.x)}
            scrollEventThrottle={16}
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
                  <AppText
                    size="xs"
                    weight={isActive ? 'bold' : 'medium'}
                    style={{ color: isActive ? '#4F46E5' : '#475569' }}
                  >
                    {tab.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.sliderArrowBtn}
            onPress={handleScrollRight}
            activeOpacity={0.7}
          >
            <AppText size="sm" weight="bold" style={{ color: '#4F46E5' }}>›</AppText>
          </TouchableOpacity>
        </View>

        {/* TAB PANELS */}

        {/* 1. OVERVIEW & SETTINGS */}
        {activeTab === 'Overview & Settings' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 12 }}>SECTION A — Site Information</Heading>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Site Name</AppText>
                <AppText size="sm" weight="bold" color="primary">{site.name}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Site ID / Code</AppText>
                <AppText size="sm" weight="bold" color="primary">{codeStr}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Client Association</AppText>
                <AppText size="sm" weight="bold" color="primary">{clientStr}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Branch</AppText>
                <AppText size="sm" weight="bold" color="primary">{site.branch}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Site Facility Type</AppText>
                <AppText size="sm" weight="bold" color="primary">{facilityTypeStr}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Status</AppText>
                <AppText size="sm" weight="bold" style={{ color: '#059669' }}>Active</AppText>
              </View>
            </View>

            <View style={styles.dividerLine} />

            <Heading level="h4" color="primary" style={{ marginBottom: 8 }}>Site Address Details</Heading>
            <View style={styles.addressBox}>
              <AppText size="sm" weight="bold" color="primary">{addressStr}</AppText>
              {site.addressLine2 ? <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>{site.addressLine2}</AppText> : null}
              <AppText size="xs" color="secondary" style={{ marginTop: 4 }}>
                {cityStr}, {stateStr} {postalCodeStr}, {countryStr}
              </AppText>
            </View>

            {internalNotes ? (
              <>
                <View style={styles.dividerLine} />
                <Heading level="h4" color="primary" style={{ marginBottom: 8 }}>Internal Site Notes</Heading>
                <View style={styles.notesBox}>
                  <AppText size="sm" color="primary" style={{ lineHeight: 20 }}>
                    {internalNotes}
                  </AppText>
                </View>
              </>
            ) : null}
          </Card>
        )}

        {/* 2. GEOFENCING */}
        {activeTab === 'Geofencing' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 4 }}>Site Geofence Boundary & Location Configuration</Heading>
            <AppText size="xs" color="secondary" style={{ marginBottom: 14 }}>
              Geofence boundary verification and GPS enforcement options.
            </AppText>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Boundary Type</AppText>
                <AppText size="sm" weight="bold" color="primary">{geofence.boundaryType || 'Circle'}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Latitude</AppText>
                <AppText size="sm" weight="bold" color="primary">{geofence.latitude}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Longitude</AppText>
                <AppText size="sm" weight="bold" color="primary">{geofence.longitude}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="xs" color="secondary">Geofence Radius</AppText>
                <AppText size="sm" weight="bold" color="primary">{geofence.radiusMeters} meters</AppText>
              </View>

              <View style={styles.infoBoxFull}>
                <AppText size="xs" color="secondary">Verification Status</AppText>
                <View style={[styles.statusChipGreen, { marginTop: 4 }]}>
                  <AppText size="xs" weight="bold" style={{ color: '#059669' }}>
                    ✓ {geofence.status || 'ACTIVE GEOFENCE'}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.dividerLine} />

            <Heading level="h4" color="primary" style={{ marginBottom: 12 }}>Geofence Validation Rules</Heading>
            <View style={{ gap: 8 }}>
              <View style={styles.toggleRow}>
                <AppText size="sm" color="primary">Enable Geofence Validation</AppText>
                <View style={styles.statusChipGreen}><AppText size="xs" weight="bold" style={{ color: '#059669' }}>✓ Enabled</AppText></View>
              </View>

              <View style={styles.toggleRow}>
                <AppText size="sm" color="primary">Require Geofence for Clock-In</AppText>
                <View style={styles.statusChipGreen}><AppText size="xs" weight="bold" style={{ color: '#059669' }}>✓ Enabled</AppText></View>
              </View>

              <View style={styles.toggleRow}>
                <AppText size="sm" color="primary">Require Geofence for Clock-Out</AppText>
                <View style={styles.statusChipGreen}><AppText size="xs" weight="bold" style={{ color: '#059669' }}>✓ Enabled</AppText></View>
              </View>

              <View style={styles.toggleRow}>
                <AppText size="sm" color="primary">Require Location Permission</AppText>
                <View style={styles.statusChipGreen}><AppText size="xs" weight="bold" style={{ color: '#059669' }}>✓ Enabled</AppText></View>
              </View>
            </View>

            <View style={styles.dividerLine} />

            <View style={styles.infoGrid}>
              <View style={styles.infoBoxFull}>
                <AppText size="xs" color="secondary">Outside Boundary Action</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                  {geofence.outsideBoundaryAction || 'Allow But Flag Exception'}
                </AppText>
              </View>

              <View style={styles.infoBoxFull}>
                <AppText size="xs" color="secondary">Location Accuracy Threshold</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                  {geofence.accuracyThresholdMeters || 50} meters
                </AppText>
              </View>
            </View>
          </Card>
        )}

        {/* 3. POST ORDERS */}
        {activeTab === 'Post Orders' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 4 }}>Site Assigned Post Orders & SOP Directives</Heading>
            <AppText size="xs" color="secondary" style={{ marginBottom: 14 }}>
              Active standard operating procedures and standing post instructions.
            </AppText>

            {postOrders.length === 0 ? (
              <AppText size="sm" color="secondary">No post orders configured for this site.</AppText>
            ) : (
              postOrders.map((po) => (
                <View key={po.id} style={styles.cardItemBox}>
                  <View style={styles.itemHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Heading level="h4" color="primary">{po.title}</Heading>
                      <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                        Category: <AppText size="xs" weight="bold" color="primary">{po.category || 'Access Control'}</AppText>
                      </AppText>
                    </View>

                    <View style={[styles.priorityBadge, { backgroundColor: (po.priority || 'High').toLowerCase() === 'high' ? '#FEE2E2' : '#FEF3C7' }]}>
                      <AppText size="xs" weight="bold" style={{ color: (po.priority || 'High').toLowerCase() === 'high' ? '#DC2626' : '#D97706' }}>
                        {po.priority || 'High'} Priority
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.itemDetailsRow}>
                    <AppText size="xs" color="secondary">Version: <AppText size="xs" weight="bold" color="primary">{po.version}</AppText></AppText>
                    <AppText size="xs" color="secondary">Effective: <AppText size="xs" weight="bold" color="primary">{po.effectiveDate || '2026-08-11'}</AppText></AppText>
                    <AppText size="xs" color="secondary">Expiry: <AppText size="xs" weight="bold" color="primary">{po.expiryDate || 'Indefinite'}</AppText></AppText>
                  </View>

                  <View style={styles.itemActionsRow}>
                    <Button
                      title="View SOP"
                      variant="outline"
                      size="small"
                      onPress={() => Alert.alert('View SOP', `Opening Post Order Directive: ${po.title}`)}
                      style={{ paddingHorizontal: 12, minHeight: 36 }}
                    />
                    <Button
                      title="Download"
                      variant="primary"
                      size="small"
                      onPress={() => Alert.alert('Download SOP', `Downloading Post Order: ${po.title}`)}
                      style={{ paddingHorizontal: 12, minHeight: 36 }}
                    />
                  </View>
                </View>
              ))
            )}
          </Card>
        )}

        {/* 4. CHECKLISTS */}
        {activeTab === 'Checklists' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 4 }}>Site Incident & Action Checklists</Heading>
            <AppText size="xs" color="secondary" style={{ marginBottom: 14 }}>
              Operational checklists and emergency execution protocols.
            </AppText>

            {checklists.length === 0 ? (
              <AppText size="sm" color="secondary">No checklists configured for this site.</AppText>
            ) : (
              checklists.map((cl) => (
                <View key={cl.id} style={styles.cardItemBox}>
                  <View style={styles.itemHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Heading level="h4" color="primary">{cl.title}</Heading>
                      <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                        Category: <AppText size="xs" weight="bold" color="primary">{cl.category}</AppText>
                      </AppText>
                    </View>

                    <View style={[styles.priorityBadge, { backgroundColor: (cl.priority || 'High').toLowerCase() === 'high' ? '#FEE2E2' : '#FEF3C7' }]}>
                      <AppText size="xs" weight="bold" style={{ color: (cl.priority || 'High').toLowerCase() === 'high' ? '#DC2626' : '#D97706' }}>
                        {cl.priority || 'High'}
                      </AppText>
                    </View>
                  </View>

                  {cl.description ? (
                    <AppText size="xs" color="secondary" style={{ marginTop: 6 }}>
                      {cl.description}
                    </AppText>
                  ) : null}

                  {/* Execution Steps */}
                  {cl.steps && cl.steps.length > 0 ? (
                    <View style={styles.stepsBox}>
                      <AppText size="xs" weight="bold" color="primary" style={{ marginBottom: 4 }}>Steps:</AppText>
                      {cl.steps.map((step, idx) => (
                        <AppText key={idx} size="xs" color="secondary" style={{ marginTop: 2 }}>
                          {step}
                        </AppText>
                      ))}
                    </View>
                  ) : null}

                  <View style={styles.itemActionsRow}>
                    <Button
                      title="Start Execution"
                      variant="primary"
                      size="small"
                      onPress={() => Alert.alert('Checklist Execution', `Starting execution for ${cl.title}`)}
                      style={{ paddingHorizontal: 16, minHeight: 38 }}
                    />
                  </View>
                </View>
              ))
            )}
          </Card>
        )}

        {/* 5. SAFETY RULES */}
        {activeTab === 'Safety Rules' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 4 }}>Site Attendance & Guard Safety Rules</Heading>
            <AppText size="xs" color="secondary" style={{ marginBottom: 14 }}>
              Shift rules, officer safety checks, and lone worker configuration.
            </AppText>

            {/* Shift Rules Card */}
            <View style={styles.sectionCardBox}>
              <Heading level="h4" color="primary" style={{ marginBottom: 10 }}>Clock In / Clock Out Shift Rules</Heading>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoBox}>
                  <AppText size="xs" color="secondary">Min Mins Before Shift</AppText>
                  <AppText size="sm" weight="bold" color="primary">{safetyConfig.shiftRules?.minMinsBeforeShift || 15} mins</AppText>
                </View>

                <View style={styles.infoBox}>
                  <AppText size="xs" color="secondary">Max Mins After Shift</AppText>
                  <AppText size="sm" weight="bold" color="primary">{safetyConfig.shiftRules?.maxMinsAfterShift || 30} mins</AppText>
                </View>

                <View style={styles.infoBox}>
                  <AppText size="xs" color="secondary">Min Mins Before End</AppText>
                  <AppText size="sm" weight="bold" color="primary">{safetyConfig.shiftRules?.minMinsBeforeEnd || 10} mins</AppText>
                </View>

                <View style={styles.infoBox}>
                  <AppText size="xs" color="secondary">Max Mins After End</AppText>
                  <AppText size="sm" weight="bold" color="primary">{safetyConfig.shiftRules?.maxMinsAfterEnd || 15} mins</AppText>
                </View>
              </View>
            </View>

            {/* Officer Shift Checks Card */}
            <View style={styles.sectionCardBox}>
              <Heading level="h4" color="primary" style={{ marginBottom: 10 }}>Officer Shift Checks</Heading>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoBox}>
                  <AppText size="xs" color="secondary">Enable Shift Checks</AppText>
                  <AppText size="sm" weight="bold" style={{ color: '#059669' }}>✓ Enabled</AppText>
                </View>

                <View style={styles.infoBox}>
                  <AppText size="xs" color="secondary">Check Interval</AppText>
                  <AppText size="sm" weight="bold" color="primary">{safetyConfig.officerShiftChecks?.intervalMins || 60} mins</AppText>
                </View>

                <View style={styles.infoBox}>
                  <AppText size="xs" color="secondary">Grace Period</AppText>
                  <AppText size="sm" weight="bold" color="primary">{safetyConfig.officerShiftChecks?.graceMins || 10} mins</AppText>
                </View>
              </View>
            </View>

            {/* Lone Worker Checks Card */}
            <View style={styles.sectionCardBox}>
              <Heading level="h4" color="primary" style={{ marginBottom: 10 }}>Lone Worker Safety Checks</Heading>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoBox}>
                  <AppText size="xs" color="secondary">Enable Lone Worker Checks</AppText>
                  <AppText size="sm" weight="bold" style={{ color: '#059669' }}>✓ Enabled</AppText>
                </View>

                <View style={styles.infoBox}>
                  <AppText size="xs" color="secondary">Check Interval</AppText>
                  <AppText size="sm" weight="bold" color="primary">{safetyConfig.loneWorkerChecks?.intervalMins || 30} mins</AppText>
                </View>

                <View style={styles.infoBox}>
                  <AppText size="xs" color="secondary">Grace Period</AppText>
                  <AppText size="sm" weight="bold" color="primary">{safetyConfig.loneWorkerChecks?.graceMins || 5} mins</AppText>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* 6. TOUR CHECKPOINTS */}
        {activeTab === 'Tour Checkpoints' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 4 }}>Site Tour Checkpoints</Heading>
            <AppText size="xs" color="secondary" style={{ marginBottom: 14 }}>
              Configured patrol route checkpoints and tags.
            </AppText>

            {checkpoints.length === 0 ? (
              <AppText size="sm" color="secondary">No tour checkpoints configured for this site.</AppText>
            ) : (
              checkpoints.map((cp) => (
                <View key={cp.id} style={styles.checkpointCard}>
                  <View style={styles.cpNumberBadge}>
                    <AppText size="sm" weight="bold" style={{ color: '#FFFFFF' }}>{cp.sequence}</AppText>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Heading level="h4" color="primary">{cp.sequence}. {cp.name} ({cp.code})</Heading>
                    <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                      Location: <AppText size="xs" weight="bold" color="primary">{cp.location}</AppText>
                    </AppText>
                  </View>

                  <View style={[styles.statusChipGreen, { alignSelf: 'flex-start' }]}>
                    <AppText size="xs" weight="bold" style={{ color: '#059669' }}>{cp.status}</AppText>
                  </View>
                </View>
              ))
            )}
          </Card>
        )}

        {/* 7. SITE USERS */}
        {activeTab === 'Site Users' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 4 }}>Site Users & Assigned Officers</Heading>
            <AppText size="xs" color="secondary" style={{ marginBottom: 14 }}>
              Supervisors and guards assigned to active rosters at this site.
            </AppText>

            {assignedUsers.length === 0 ? (
              <AppText size="sm" color="secondary">No personnel assigned to this site.</AppText>
            ) : (
              assignedUsers.map((user) => (
                <View key={user.id} style={styles.userCardBox}>
                  <View style={styles.userHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Heading level="h4" color="primary">{user.name}</Heading>
                      <AppText size="xs" color="secondary">@{user.username || user.email.split('@')[0]}</AppText>
                    </View>

                    <View style={[styles.roleBadge, { backgroundColor: user.role.includes('Supervisor') ? '#EEF2FF' : '#F1F5F9' }]}>
                      <AppText size="xs" weight="bold" style={{ color: user.role.includes('Supervisor') ? '#4F46E5' : '#475569' }}>
                        {user.role}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.dividerLineLight} />

                  <View style={styles.infoGrid}>
                    <View style={styles.infoBoxFull}>
                      <AppText size="xs" color="secondary">Email:</AppText>
                      <AppText size="xs" weight="bold" color="primary">{user.email}</AppText>
                    </View>

                    <View style={styles.infoBox}>
                      <AppText size="xs" color="secondary">Shift Timing:</AppText>
                      <AppText size="xs" weight="bold" color="primary">{user.shiftTiming || '08:00 AM - 04:00 PM'}</AppText>
                    </View>

                    <View style={styles.infoBox}>
                      <AppText size="xs" color="secondary">Shift Period:</AppText>
                      <AppText size="xs" weight="bold" color="primary">{user.shiftPeriod || '2026-08-01 to 2026-12-31'}</AppText>
                    </View>
                  </View>
                </View>
              ))
            )}
          </Card>
        )}

        {/* 8. SITE DOCUMENTS */}
        {activeTab === 'Site Documents' && (
          <Card style={styles.contentCard}>
            <Heading level="h4" color="primary" style={{ marginBottom: 4 }}>Site Operations & Compliance Documents</Heading>
            <AppText size="xs" color="secondary" style={{ marginBottom: 14 }}>
              Uploaded security plans, compliance maps, and site directives.
            </AppText>

            {documents.length === 0 ? (
              <AppText size="sm" color="secondary">No documents uploaded for this site.</AppText>
            ) : (
              documents.map((doc) => (
                <View key={doc.id} style={styles.docCardBox}>
                  <View style={{ flex: 1 }}>
                    <Heading level="h4" color="primary">{doc.title}</Heading>
                    <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                      Category: <AppText size="xs" weight="bold" color="primary">{doc.category}</AppText>
                    </AppText>
                    <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                      File: <AppText size="xs" weight="semibold" color="primary">{doc.fileName}</AppText> ({doc.fileSize})
                    </AppText>
                    <AppText size="xs" color="secondary" style={{ marginTop: 4 }}>
                      Uploaded by {doc.uploadedBy} on {doc.uploadDate}
                    </AppText>
                  </View>

                  <View style={styles.docActionsColumn}>
                    <Button
                      title="View"
                      variant="outline"
                      size="small"
                      onPress={() => Alert.alert('Viewing Document', `Opening ${doc.fileName}...`)}
                      style={{ paddingHorizontal: 12, minHeight: 36 }}
                    />
                    <Button
                      title="Download"
                      variant="primary"
                      size="small"
                      onPress={() => Alert.alert('Downloading Document', `Downloading ${doc.fileName}...`)}
                      style={{ paddingHorizontal: 12, minHeight: 36 }}
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
    alignSelf: 'flex-start',
  },
  backBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
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
    flexWrap: 'wrap',
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
  tabBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  sliderArrowBtn: {
    width: 34,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
  },
  tabContainer: {
    gap: 8,
    paddingHorizontal: 4,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
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
    paddingRight: 6,
  },
  infoBoxFull: {
    width: '100%',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  dividerLineLight: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  addressBox: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesBox: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusChipGreen: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardItemBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 6,
  },
  itemDetailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  itemActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  stepsBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sectionCardBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  checkpointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  cpNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCardBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  userHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  docCardBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  docActionsColumn: {
    gap: 6,
  },
});
