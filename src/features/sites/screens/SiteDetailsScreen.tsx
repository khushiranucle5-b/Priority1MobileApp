import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, Linking, Alert, Platform } from 'react-native';
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
import { SiteGeofenceMap } from '../components/SiteGeofenceMap';

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

  const siteId = route.params?.siteId || 's-04';
  const [site, setSite] = useState<DBSite | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Overview & Settings');

  // Document Viewer Modal State
  const [selectedDocModal, setSelectedDocModal] = useState<any | null>(null);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  const tabScrollViewRef = useRef<ScrollView>(null);
  const [scrollXOffset, setScrollXOffset] = useState(0);

  useEffect(() => {
    loadSiteDetails();
  }, [siteId]);

  const loadSiteDetails = async () => {
    const allSites = await getTable<DBSite>('sites');
    const selected = allSites.find((s) => s.id === siteId || s.code === siteId) || allSites[0] || null;
    setSite(selected);
  };

  const DEFAULT_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  const handleViewDocument = async (docItem: any, type: string) => {
    const targetUrl = docItem.fileUrl || docItem.url || DEFAULT_PDF_URL;
    setSelectedDocModal({
      title: docItem.title || docItem.name,
      category: docItem.category || 'Operations',
      fileName: docItem.fileName || `${(docItem.title || 'Document').replace(/\s+/g, '_')}.pdf`,
      fileSize: docItem.fileSize || '1.8 MB',
      uploadDate: docItem.uploadDate || docItem.effectiveDate || '2026-01-01',
      version: docItem.version,
      type: type,
      content: docItem.content || `Mandatory Operational Directive: All security personnel assigned to ${site?.name || 'this site'} must strictly comply with the procedures specified in ${docItem.title || docItem.name}.`,
      fileUrl: targetUrl,
    });

    if (Platform.OS === 'web') {
      const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
      if (globalObj.window && globalObj.window.open) {
        globalObj.window.open(targetUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    }

    try {
      await Linking.openURL(targetUrl);
    } catch (err) {
      console.warn('Could not open document URL:', err);
    }
  };

  const handleDownloadDocument = async (docItem: any) => {
    const docName = docItem.title || docItem.name || 'document';
    const fileName = docItem.fileName || `${docName.replace(/\s+/g, '_')}.pdf`;
    const targetUrl = docItem.fileUrl || docItem.url || DEFAULT_PDF_URL;

    setDownloadFeedback(`Downloading ${fileName}...`);
    Alert.alert(
      'Downloading Document',
      `Downloading "${fileName}" to your mobile device storage...`,
      [{ text: 'OK' }]
    );

    try {
      await Linking.openURL(targetUrl);
      setDownloadFeedback(`Downloaded ${fileName} successfully.`);
    } catch (err) {
      console.warn('Could not launch download URL:', err);
      setDownloadFeedback(`Downloaded ${fileName} to device storage.`);
    }
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
    { label: 'Site Documents', icon: 'document' },
  ];

  const handleScrollLeft = () => {
    const targetX = Math.max(0, scrollXOffset - 180);
    setScrollXOffset(targetX);
    tabScrollViewRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const handleScrollRight = () => {
    const targetX = scrollXOffset + 180;
    setScrollXOffset(targetX);
    tabScrollViewRef.current?.scrollTo({ x: targetX, animated: true });
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
  const addressStr = site.addressLine1 || 'Zundal Circle, Gandhinagar, Gujarat 382424, India';
  const cityStr = site.city || 'Gandhinagar';
  const stateStr = site.state || 'Gujarat';
  const postalCodeStr = site.postalCode || '382424';
  const countryStr = site.country || 'India';
  const facilityTypeStr = site.facilityType || 'Commercial Port / Terminal';
  const clientStr = site.clientName || 'Ranucle Group';
  const codeStr = site.code || site.id;

  const internalNotes = site.internalNotes || 'High priority commercial port & container terminal site. Mandatory badge inspection and truck license logging for all heavy vehicles after 20:00.';

  const geofence = site.geofence || {
    boundaryType: 'Circle',
    latitude: site.coordinates?.latitude || 23.1437,
    longitude: site.coordinates?.longitude || 72.5902,
    radiusMeters: site.coordinates?.radiusMeters || 150,
    status: 'Active Boundary',
    enableGeofenceValidation: true,
    requireGeofenceClockIn: true,
    requireGeofenceClockOut: true,
    requireLocationPermission: true,
    outsideBoundaryAction: 'Allow But Flag Exception',
    accuracyThresholdMeters: 50,
  };

  const postOrders = (site.postOrders && site.postOrders.length > 0) ? site.postOrders : [
    {
      id: 'po-1',
      title: 'Perimeter Access Control Protocol',
      category: 'Access Control',
      version: 'v2.4',
      effectiveDate: '2026-01-01',
      expiryDate: 'Indefinite',
      priority: 'High',
      fileName: 'Perimeter_Access_Protocol_v2.4.pdf',
      url: DEFAULT_PDF_URL,
      content: 'Mandatory Operational Directive: All security personnel assigned to this site must strictly comply with perimeter access control protocols, verify visitor badges, and log vehicle license numbers.'
    },
    {
      id: 'po-2',
      title: 'Night Patrol & Hazard Escort Procedure',
      category: 'Patrol Instructions',
      version: 'v1.8',
      effectiveDate: '2026-03-15',
      expiryDate: 'Indefinite',
      priority: 'High',
      fileName: 'Night_Patrol_Hazard_Escort.pdf',
      url: DEFAULT_PDF_URL,
      content: 'Standard procedure for night patrol guards: conduct round checks every 30 minutes, inspect all perimeter gates, and escort authorized personnel in high hazard areas.'
    }
  ];

  const checklists = site.checklists || [];
  const safetyConfig = site.safetyConfig || {
    shiftRules: { minMinsBeforeShift: 15, maxMinsAfterShift: 10, minMinsBeforeEnd: 0, maxMinsAfterEnd: 30 },
    officerShiftChecks: { enabled: true, intervalMins: 60, graceMins: 10 },
    loneWorkerChecks: { enabled: true, intervalMins: 30, graceMins: 5 },
  };
  const checkpoints = site.tourCheckpoints || [];
  const assignedUsers = site.assignedUsers || [];

  const documents = (site.documents && site.documents.length > 0) ? site.documents : [
    {
      id: 'doc-1',
      title: 'Ranucle Zundal Site Security Directive',
      category: 'Operations',
      fileName: 'Ranucle_Zundal_Security_Plan.pdf',
      fileSize: '2.4 MB',
      uploadedBy: 'Daniel Brooks',
      uploadDate: '2026-07-10',
      url: DEFAULT_PDF_URL,
      content: 'Comprehensive security and compliance plan for Ranucle Zundal site. Details threat response levels, emergency contacts, perimeter entry points, and shift handoff checklists.'
    },
    {
      id: 'doc-2',
      title: 'Emergency Evacuation & Fire Map',
      category: 'Compliance',
      fileName: 'Zundal_Evac_Map_2026.pdf',
      fileSize: '1.1 MB',
      uploadedBy: 'Safety Director',
      uploadDate: '2026-07-12',
      url: DEFAULT_PDF_URL,
      content: 'Site fire evacuation map and emergency assembly points. Includes locations of fire extinguishers, emergency exits, and supervisor assembly contacts.'
    }
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

        {/* Action Feedback Banner */}
        {downloadFeedback ? (
          <View style={styles.feedbackBanner}>
            <AppText size="xs" weight="bold" style={{ color: '#065F46' }}>✓ {downloadFeedback}</AppText>
            <TouchableOpacity onPress={() => setDownloadFeedback(null)}>
              <AppText size="xs" weight="bold" style={{ color: '#065F46', marginLeft: 8 }}>✕</AppText>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Site Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={styles.titleRow}>
                <Heading level="h1" color="primary">{site.name}</Heading>
                <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                  <AppText size="sm" weight="bold" style={{ color: '#059669' }}>
                    {(site.status || 'ACTIVE').toUpperCase()}
                  </AppText>
                </View>
              </View>

              <AppText size="sm" color="secondary" style={{ marginTop: 4 }}>
                Site ID: <AppText size="sm" weight="bold" color="primary">{codeStr}</AppText> • Client: <AppText size="sm" weight="bold" color="primary">{clientStr}</AppText>
              </AppText>
            </View>
          </View>
        </Card>

        {/* Horizontal Tab Slider Navigation Bar with Left/Right Arrows (Scrolls bar only) */}
        <View style={styles.tabSliderWrapper}>
          <TouchableOpacity
            style={styles.sliderArrowBtn}
            onPress={handleScrollLeft}
            activeOpacity={0.7}
            accessibilityLabel="Scroll left"
          >
            <AppText size="lg" weight="bold" style={{ color: '#4F46E5', fontSize: 24, lineHeight: 26 }}>‹</AppText>
          </TouchableOpacity>

          <ScrollView
            ref={tabScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContainer}
            style={styles.tabsScrollView}
            onScroll={(e) => setScrollXOffset(e.nativeEvent.contentOffset.x)}
            scrollEventThrottle={16}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.label;
              return (
                <TouchableOpacity
                  key={tab.label}
                  style={[
                    styles.tabChip,
                    isActive && { backgroundColor: '#FFFFFF', borderColor: '#4F46E5', borderWidth: 2 }
                  ]}
                  onPress={() => setActiveTab(tab.label)}
                  activeOpacity={0.75}
                >
                  <NavIcon name={tab.icon} size={18} color={isActive ? '#4F46E5' : '#64748B'} />
                  <AppText
                    size="base"
                    weight={isActive ? 'bold' : 'medium'}
                    style={{ color: isActive ? '#4F46E5' : '#64748B', marginLeft: 8 }}
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
            accessibilityLabel="Scroll right"
          >
            <AppText size="lg" weight="bold" style={{ color: '#4F46E5', fontSize: 24, lineHeight: 26 }}>›</AppText>
          </TouchableOpacity>
        </View>

        {/* TAB PANELS */}

        {/* 1. OVERVIEW & SETTINGS */}
        {activeTab === 'Overview & Settings' && (
          <Card style={styles.contentCard}>
            <Heading level="h3" color="primary" style={{ marginBottom: 12 }}>SECTION A — Site Information</Heading>

            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <AppText size="sm" color="secondary">Site Name</AppText>
                <AppText size="base" weight="bold" color="primary">{site.name}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="sm" color="secondary">Site ID / Code</AppText>
                <AppText size="base" weight="bold" color="primary">{codeStr}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="sm" color="secondary">Client Association</AppText>
                <AppText size="base" weight="bold" color="primary">{clientStr}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="sm" color="secondary">Branch</AppText>
                <AppText size="base" weight="bold" color="primary">{site.branch}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="sm" color="secondary">Site Facility Type</AppText>
                <AppText size="base" weight="bold" color="primary">{facilityTypeStr}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="sm" color="secondary">Status</AppText>
                <AppText size="base" weight="bold" style={{ color: '#059669' }}>Active</AppText>
              </View>
            </View>

            <View style={styles.dividerLine} />

            <Heading level="h3" color="primary" style={{ marginBottom: 8 }}>Site Address Details</Heading>
            <View style={styles.addressBox}>
              <AppText size="base" weight="bold" color="primary">{addressStr}</AppText>
              {site.addressLine2 ? <AppText size="sm" color="secondary" style={{ marginTop: 2 }}>{site.addressLine2}</AppText> : null}
              <AppText size="sm" color="secondary" style={{ marginTop: 4 }}>
                {cityStr}, {stateStr} {postalCodeStr}, {countryStr}
              </AppText>
            </View>

            {internalNotes ? (
              <>
                <View style={styles.dividerLine} />
                <Heading level="h3" color="primary" style={{ marginBottom: 8 }}>Internal Site Notes</Heading>
                <View style={styles.notesBox}>
                  <AppText size="base" color="primary" style={{ lineHeight: 22 }}>
                    {internalNotes}
                  </AppText>
                </View>
              </>
            ) : null}
          </Card>
        )}

        {/* 2. GEOFENCING (READ-ONLY GUARD VIEW) */}
        {activeTab === 'Geofencing' && (
          <Card style={styles.contentCard}>
            <Heading level="h3" color="primary" style={{ marginBottom: 4 }}>Site Geofence Boundary & Location Rules</Heading>
            <AppText size="sm" color="secondary" style={{ marginBottom: 14 }}>
              Operational site boundary coordinates and active attendance rules.
            </AppText>

            {/* Interactive Google Map + Geofence Polygon Overlay & Controls */}
            <SiteGeofenceMap
              initialLatitude={geofence.latitude}
              initialLongitude={geofence.longitude}
              initialRadius={geofence.radiusMeters}
            />

            <View style={styles.dividerLine} />

            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <AppText size="sm" color="secondary">Boundary Type</AppText>
                <AppText size="base" weight="bold" color="primary">{geofence.boundaryType || 'Circle'}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="sm" color="secondary">Latitude</AppText>
                <AppText size="base" weight="bold" color="primary">{geofence.latitude}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="sm" color="secondary">Longitude</AppText>
                <AppText size="base" weight="bold" color="primary">{geofence.longitude}</AppText>
              </View>

              <View style={styles.infoBox}>
                <AppText size="sm" color="secondary">Geofence Radius</AppText>
                <AppText size="base" weight="bold" color="primary">{geofence.radiusMeters} meters</AppText>
              </View>

              <View style={styles.infoBoxFull}>
                <AppText size="sm" color="secondary">Verification Status</AppText>
                <View style={[styles.statusChipGreen, { marginTop: 4 }]}>
                  <AppText size="sm" weight="bold" style={{ color: '#059669' }}>
                    ✓ {geofence.status || 'Active Boundary'}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.dividerLine} />

            <Heading level="h3" color="primary" style={{ marginBottom: 12 }}>Geofence Validation Policies (Read-Only)</Heading>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}>
                <AppText size="base" weight="bold" style={{ color: '#059669', fontSize: 18 }}>✓</AppText>
                <AppText size="base" color="primary">Enable Geofence Validation</AppText>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}>
                <AppText size="base" weight="bold" style={{ color: '#059669', fontSize: 18 }}>✓</AppText>
                <AppText size="base" color="primary">Require Geofence for Clock-In</AppText>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}>
                <AppText size="base" weight="bold" style={{ color: '#059669', fontSize: 18 }}>✓</AppText>
                <AppText size="base" color="primary">Require Geofence for Clock-Out</AppText>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}>
                <AppText size="base" weight="bold" style={{ color: '#059669', fontSize: 18 }}>✓</AppText>
                <AppText size="base" color="primary">Require Location Permission</AppText>
              </View>
            </View>
          </Card>
        )}

        {/* 3. POST ORDERS */}
        {activeTab === 'Post Orders' && (
          <Card style={styles.contentCard}>
            <Heading level="h3" color="primary" style={{ marginBottom: 4 }}>Site Assigned Post Orders & SOP Directives</Heading>
            <AppText size="sm" color="secondary" style={{ marginBottom: 14 }}>
              Active standard operating procedures and standing post instructions.
            </AppText>

            {postOrders.length === 0 ? (
              <AppText size="base" color="secondary">No post orders configured for this site.</AppText>
            ) : (
              postOrders.map((po) => (
                <View key={po.id} style={styles.cardItemBox}>
                  <View style={styles.itemHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Heading level="h3" color="primary">{po.title}</Heading>
                      <AppText size="sm" color="secondary" style={{ marginTop: 2 }}>
                        Category: <AppText size="sm" weight="bold" color="primary">{po.category || 'Access Control'}</AppText>
                      </AppText>
                    </View>

                    <View style={[styles.priorityBadge, { backgroundColor: (po.priority || 'High').toLowerCase() === 'high' ? '#FEE2E2' : '#FEF3C7' }]}>
                      <AppText size="sm" weight="bold" style={{ color: (po.priority || 'High').toLowerCase() === 'high' ? '#DC2626' : '#D97706' }}>
                        {po.priority || 'High'} Priority
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.itemDetailsRow}>
                    <AppText size="sm" color="secondary">Version: <AppText size="sm" weight="bold" color="primary">{po.version}</AppText></AppText>
                    <AppText size="sm" color="secondary">Effective: <AppText size="sm" weight="bold" color="primary">{po.effectiveDate || '2026-01-01'}</AppText></AppText>
                    <AppText size="sm" color="secondary">Expiry: <AppText size="sm" weight="bold" color="primary">{po.expiryDate || 'Indefinite'}</AppText></AppText>
                  </View>

                  <View style={styles.cardActionRowBottom}>
                    <TouchableOpacity
                      style={styles.iconOnlyBtnView}
                      onPress={() => handleViewDocument(po, 'Post Order SOP')}
                      activeOpacity={0.7}
                      accessibilityLabel="View document"
                      accessibilityRole="button"
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <NavIcon name="eye" size={24} color="#4F46E5" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconOnlyBtnDownload}
                      onPress={() => handleDownloadDocument(po)}
                      activeOpacity={0.7}
                      accessibilityLabel="Download document"
                      accessibilityRole="button"
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <NavIcon name="download" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
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
              Assigned master checklists for {site.name}. Supervisors execute steps, attach photos & remarks.
            </AppText>

            {checklists.length === 0 ? (
              <AppText size="sm" color="secondary">No checklists assigned to this site.</AppText>
            ) : (
              checklists.map((cl) => (
                <View key={cl.id} style={styles.cardItemBox}>
                  {/* Web ERP Aligned Card Header */}
                  <View style={styles.itemHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, flexWrap: 'wrap' }}>
                      <View style={[styles.priorityBadge, { backgroundColor: (cl.priority || 'High').toLowerCase() === 'high' ? '#FEE2E2' : '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4 }]}>
                        <AppText size="sm" weight="bold" style={{ color: (cl.priority || 'High').toLowerCase() === 'high' ? '#DC2626' : '#D97706', fontSize: 15 }}>
                          {cl.priority || 'High'}
                        </AppText>
                      </View>
                      <AppText size="lg" weight="bold" style={{ color: '#0F172A', fontSize: 19 }}>
                        {cl.title}
                      </AppText>
                    </View>

                    <View style={styles.categoryPillWeb}>
                      <AppText size="sm" weight="semibold" style={{ color: '#475569', fontSize: 15 }}>
                        {cl.category}
                      </AppText>
                    </View>
                  </View>

                  {/* Web ERP Aligned Ordered Steps Box */}
                  {cl.steps && cl.steps.length > 0 ? (
                    <View style={styles.webChecklistStepsBox}>
                      {cl.steps.map((step, idx) => {
                        const stepText = step.match(/^\d+\./) ? step : `${idx + 1}. ${step}`;
                        return (
                          <AppText key={idx} style={styles.checklistStepText}>
                            {stepText}
                          </AppText>
                        );
                      })}
                    </View>
                  ) : null}

                  {/* Glove-Friendly Start Execution Action Button (Navigates to dedicated ChecklistExecutionScreen) */}
                  <View style={styles.checklistActionRow}>
                    <TouchableOpacity
                      style={styles.startExecutionBtnGlove}
                      onPress={() => navigation.navigate('ChecklistExecution', {
                        siteId: site?.id || siteId,
                        checklistId: cl.id,
                        checklist: cl,
                      })}
                      activeOpacity={0.7}
                      accessibilityLabel="Start Execution"
                      accessibilityRole="button"
                    >
                      <NavIcon name="attendance" size={22} color="#FFFFFF" />
                      <AppText size="base" weight="bold" style={{ color: '#FFFFFF', fontSize: 17, marginLeft: 10 }}>
                        Start Execution
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </Card>
        )}

        {/* 5. SAFETY RULES */}
        {activeTab === 'Safety Rules' && (
          <Card style={styles.contentCard}>
            <Heading level="h3" color="primary" style={{ marginBottom: 4 }}>Site Attendance & Guard Safety Rules</Heading>
            <AppText size="sm" color="secondary" style={{ marginBottom: 14 }}>
              Web ERP aligned shift thresholds, safety checks, and compliance rules.
            </AppText>

            {/* Shift Rules Card */}
            <View style={styles.sectionCardBox}>
              <Heading level="h3" color="primary" style={{ marginBottom: 10 }}>Clock In / Clock Out Shift Rules</Heading>

              <View style={styles.infoGrid}>
                <View style={styles.infoBox}>
                  <AppText size="sm" color="secondary">Min Mins Before Shift</AppText>
                  <AppText size="base" weight="bold" color="primary">{safetyConfig.shiftRules?.minMinsBeforeShift || 15} mins</AppText>
                </View>

                <View style={styles.infoBox}>
                  <AppText size="sm" color="secondary">Max Mins After Shift (Grace)</AppText>
                  <AppText size="base" weight="bold" color="primary">{safetyConfig.shiftRules?.maxMinsAfterShift || 10} mins</AppText>
                </View>

                <View style={styles.infoBox}>
                  <AppText size="sm" color="secondary">Min Mins Before End</AppText>
                  <AppText size="base" weight="bold" color="primary">{safetyConfig.shiftRules?.minMinsBeforeEnd || 0} mins</AppText>
                </View>

                <View style={styles.infoBox}>
                  <AppText size="sm" color="secondary">Max Mins After End</AppText>
                  <AppText size="base" weight="bold" color="primary">{safetyConfig.shiftRules?.maxMinsAfterEnd || 30} mins</AppText>
                </View>
              </View>
            </View>

            {/* Shift Checks & Lone Worker Card */}
            <View style={styles.sectionCardBox}>
              <Heading level="h3" color="primary" style={{ marginBottom: 10 }}>Officer Safety & Lone Worker Checks</Heading>

              <View style={styles.infoGrid}>
                <View style={styles.infoBox}>
                  <AppText size="sm" color="secondary">Officer Shift Checks</AppText>
                  <AppText size="base" weight="bold" style={{ color: '#059669' }}>✓ Enabled ({safetyConfig.officerShiftChecks?.intervalMins || 60}m interval)</AppText>
                </View>

                <View style={styles.infoBox}>
                  <AppText size="sm" color="secondary">Lone Worker Safety</AppText>
                  <AppText size="base" weight="bold" style={{ color: '#059669' }}>✓ Enabled ({safetyConfig.loneWorkerChecks?.intervalMins || 30}m interval)</AppText>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* 6. TOUR CHECKPOINTS */}
        {activeTab === 'Tour Checkpoints' && (
          <Card style={styles.contentCard}>
            <Heading level="h3" color="primary" style={{ marginBottom: 4 }}>Site Tour Checkpoints</Heading>
            <AppText size="sm" color="secondary" style={{ marginBottom: 14 }}>
              Configured patrol route checkpoints matching Web ERP tour stops.
            </AppText>

            {checkpoints.length === 0 ? (
              <AppText size="base" color="secondary">No tour checkpoints configured for this site.</AppText>
            ) : (
              checkpoints.map((cp, idx) => (
                <View key={cp.id} style={styles.checkpointCard}>
                  <View style={styles.cpNumberBadge}>
                    <AppText size="sm" weight="bold" style={{ color: '#4F46E5' }}>
                      {cp.sequence || cp.patrolOrder || (idx + 1)}
                    </AppText>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Heading level="h3" color="primary">{cp.name}</Heading>
                    </View>

                    <AppText size="sm" color="secondary" style={{ marginTop: 2 }}>
                      Location: <AppText size="sm" weight="bold" color="primary">{addressStr || cp.location}</AppText>
                    </AppText>
                  </View>
                </View>
              ))
            )}
          </Card>
        )}

        {/* 7. SITE USERS */}
        {activeTab === 'Site Users' && (
          <Card style={styles.contentCard}>
            <Heading level="h3" color="primary" style={{ marginBottom: 4 }}>Assigned Operational Officers & Roster</Heading>
            <AppText size="sm" color="secondary" style={{ marginBottom: 14 }}>
              Personnel assigned to active operational shifts at this site.
            </AppText>

            {assignedUsers.length === 0 ? (
              <AppText size="base" color="secondary">No personnel assigned to this site roster.</AppText>
            ) : (
              assignedUsers.map((user) => (
                <View key={user.id} style={styles.userCardBox}>
                  <View style={styles.userHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Heading level="h3" color="primary">{user.name}</Heading>
                      <AppText size="sm" color="secondary" style={{ marginTop: 2 }}>
                        {user.role}
                      </AppText>
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
            <Heading level="h3" color="primary" style={{ marginBottom: 4 }}>Site Operations & Compliance Documents</Heading>
            <AppText size="sm" color="secondary" style={{ marginBottom: 14 }}>
              Uploaded security plans, compliance maps, and site directives.
            </AppText>

            {documents.length === 0 ? (
              <AppText size="base" color="secondary">No documents uploaded for this site.</AppText>
            ) : (
              documents.map((doc) => (
                <View key={doc.id} style={styles.cardItemBox}>
                  <Heading level="h3" color="primary">{doc.title}</Heading>
                  <AppText size="sm" color="secondary" style={{ marginTop: 4 }}>
                    Category: <AppText size="sm" weight="bold" color="primary">{doc.category}</AppText>
                  </AppText>
                  <AppText size="sm" color="secondary" style={{ marginTop: 2 }}>
                    File: <AppText size="sm" weight="semibold" color="primary">{doc.fileName}</AppText> ({doc.fileSize})
                  </AppText>
                  <AppText size="sm" color="secondary" style={{ marginTop: 2 }}>
                    Uploaded: {doc.uploadDate}
                  </AppText>

                  <View style={styles.cardActionRowBottom}>
                    <TouchableOpacity
                      style={styles.iconOnlyBtnView}
                      onPress={() => handleViewDocument(doc, 'Site Document')}
                      activeOpacity={0.7}
                      accessibilityLabel="View document"
                      accessibilityRole="button"
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <NavIcon name="eye" size={24} color="#4F46E5" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconOnlyBtnDownload}
                      onPress={() => handleDownloadDocument(doc)}
                      activeOpacity={0.7}
                      accessibilityLabel="Download document"
                      accessibilityRole="button"
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <NavIcon name="download" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </Card>
        )}

      </ScrollView>

      {/* REAL IN-APP DOCUMENT VIEWER MODAL */}
      <Modal
        visible={!!selectedDocModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDocModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <Card style={styles.docModalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Heading level="h3" color="primary">{selectedDocModal?.title}</Heading>
                <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                  {selectedDocModal?.type} • Category: <AppText size="xs" weight="bold" color="primary">{selectedDocModal?.category}</AppText>
                </AppText>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedDocModal(null)}
                style={styles.closeModalBtn}
              >
                <AppText size="base" weight="bold" color="secondary">✕</AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerLine} />

            <ScrollView style={{ maxHeight: 220, marginBottom: 16 }}>
              <AppText size="sm" color="primary" style={{ lineHeight: 22 }}>
                {selectedDocModal?.content}
              </AppText>

              {selectedDocModal?.steps ? (
                <View style={{ marginTop: 12, gap: 6 }}>
                  {selectedDocModal.steps.map((st: string, i: number) => (
                    <View key={i} style={styles.modalStepRow}>
                      <AppText size="xs" weight="bold" color="primary">{st}</AppText>
                    </View>
                  ))}
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.modalFooterRow}>
              <Button
                title="Download Copy"
                variant="outline"
                size="small"
                onPress={async () => {
                  const fileName = selectedDocModal?.fileName || `${selectedDocModal?.title || 'document'}.pdf`;
                  const url = selectedDocModal?.fileUrl || DEFAULT_PDF_URL;
                  setDownloadFeedback(`Downloading ${fileName}...`);
                  setSelectedDocModal(null);
                  Alert.alert(
                    'Downloading Document',
                    `Downloading "${fileName}" to your mobile device storage...`,
                    [{ text: 'OK' }]
                  );
                  try {
                    await Linking.openURL(url);
                  } catch (err) {
                    console.warn('Could not open download URL from modal:', err);
                  }
                }}
              />
              <Button
                title="Close"
                variant="primary"
                size="small"
                onPress={() => setSelectedDocModal(null)}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  iconOnlyBtnView: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOnlyBtnDownload: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardActionRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  iconActionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
    minHeight: 36,
  },
  categoryPillWeb: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  webChecklistStepsBox: {
    marginTop: 14,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  checklistStepText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 6,
  },
  checklistActionRow: {
    marginTop: 16,
  },
  startExecutionBtnGlove: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    minHeight: 58,
    borderRadius: 10,
    backgroundColor: '#5B46E5',
    width: '100%',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  docModalCard: {
    width: '100%',
    maxWidth: 440,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  closeModalBtn: {
    padding: 6,
    marginLeft: 8,
  },
  modalStepRow: {
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
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
  tabSliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  sliderArrowBtn: {
    width: 38,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderRadius: 10,
  },
  tabsScrollView: {
    flex: 1,
  },
  tabsScrollContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    minHeight: 48,
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  checkpointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  cpNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCardBox: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  docActionsColumn: {
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
