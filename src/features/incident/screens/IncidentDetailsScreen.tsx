import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Linking, ActivityIndicator } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useGuardStore } from '../../../store/useGuardStore';
import { useTheme } from '../../../providers/ThemeProvider';
import { getTable, DBIncident } from '../../../services/db';
import { NavIcon } from '../../../components/NavIcon';
import { AttachmentPreviewModal, AttachmentItem } from '../../../components/AttachmentPreviewModal';

export const IncidentDetailsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { guardName, guardId } = useGuardStore();

  const incidentId = route.params?.incidentId || 'inc-201';
  const [incident, setIncident] = useState<DBIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttachmentForPreview, setSelectedAttachmentForPreview] = useState<AttachmentItem | null>(null);

  useEffect(() => {
    loadIncident();
  }, [incidentId]);

  const loadIncident = async () => {
    setLoading(true);
    try {
      const allIncidents = await getTable<DBIncident>('incidents');
      const found = (allIncidents || []).find((i) => i.id === incidentId) || allIncidents[0] || null;
      setIncident(found);
    } catch (err) {
      console.error('Failed to load incident details', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadgeStyle = (sev?: string) => {
    switch (sev) {
      case 'Critical':
        return { bg: colors.errorLight, text: colors.errorDark };
      case 'High':
        return { bg: colors.warningLight, text: colors.warningDark };
      case 'Medium':
        return { bg: colors.warningLight, text: colors.warningDark };
      case 'Low':
      default:
        return { bg: colors.successLight, text: colors.successDark };
    }
  };

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case 'Resolved':
        return { bg: colors.successLight, text: colors.successDark };
      case 'Under Review':
        return { bg: colors.surfaceSecondary, text: colors.primary[600] };
      case 'Open':
      default:
        return { bg: colors.warningLight, text: colors.warningDark };
    }
  };

  if (loading || !incident) {
    return (
      <ScreenLayout activeRoute="Incident">
        <PageHeader title="Incident Detail" showBack />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <AppText size="sm" color="secondary" style={{ marginTop: 10 }}>Loading incident detail...</AppText>
        </View>
      </ScreenLayout>
    );
  }

  const severityColors = getSeverityBadgeStyle(incident.severity);
  const statusColors = getStatusBadgeStyle(incident.status);

  return (
    <ScreenLayout activeRoute="Incident">
      <PageHeader title="Incident Detail" showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Main Incident Header Card */}
        <Card style={styles.mainCard}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
              <AppText size="xs" weight="bold" style={{ color: statusColors.text }}>
                ● {incident.status}
              </AppText>
            </View>

            <View style={[styles.badge, { backgroundColor: severityColors.bg }]}>
              <AppText size="xs" weight="bold" style={{ color: severityColors.text }}>
                Severity: {incident.severity}
              </AppText>
            </View>

            {incident.category ? (
              <View style={[styles.badge, { backgroundColor: colors.surfaceSecondary }]}>
                <AppText size="xs" weight="bold" style={{ color: colors.textSecondary }}>
                  {incident.category}
                </AppText>
              </View>
            ) : null}
          </View>

          <Heading level="h3" color="primary" style={{ marginTop: 10 }}>
            {incident.title}
          </Heading>

          <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
            ID: {incident.incidentCode || incident.id} • {incident.date} at {incident.exactTime || '02:30 PM'}
          </AppText>
        </Card>

        {/* REPORTED BY & LOCATION CARD */}
        <Card style={styles.infoCard}>
          <AppText size="xs" weight="bold" style={styles.cardSectionHeading}>
            REPORT INFORMATION & LOCATION
          </AppText>

          <View style={styles.dividerLine} />

          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Reported By</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {incident.reportedBy || guardName || 'Khushi Rani'}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Employee ID / Role</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {incident.employeeId || guardId || 'GRD-1024'} • {incident.role || 'Officer'}
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Assigned Property / Site</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {incident.site || 'Ahmedabad Plant (Ranucle Zundal)'}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Assigned Investigator</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {incident.assignedTo || 'Unassigned / Control Room'}
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridColFull}>
                <AppText size="xs" color="secondary">GPS Location & Verification</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {incident.gps || '23.1145° N, 72.5821° E'}
                </AppText>

                <View style={[styles.badge, { backgroundColor: colors.successLight, marginTop: 6 }]}>
                  <AppText size="xs" weight="bold" style={{ color: colors.successDark }}>
                    ● {incident.gpsStatus || 'GPS Verified — Inside Site Boundary'}
                  </AppText>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* DESCRIPTION & OBSERVATIONS CARD */}
        <Card style={styles.infoCard}>
          <AppText size="xs" weight="bold" style={[styles.cardSectionHeading, { color: colors.textSecondary }]}>
            DESCRIPTION & OBSERVATIONS
          </AppText>

          <View style={[styles.dividerLine, { backgroundColor: colors.borderStrong }]} />

          <AppText size="xs" color="secondary">Brief Summary</AppText>
          <AppText size="sm" color="primary" style={{ marginTop: 4, lineHeight: 20 }}>
            {incident.details}
          </AppText>

          {incident.observations ? (
            <>
              <AppText size="xs" color="secondary" style={{ marginTop: 14 }}>
                Detailed Field Observations
              </AppText>
              <AppText size="sm" color="primary" style={{ marginTop: 4, lineHeight: 20 }}>
                {incident.observations}
              </AppText>
            </>
          ) : null}
        </Card>

        {/* ATTACHMENTS & MEDIA */}
        {incident.attachments && incident.attachments.length > 0 ? (
          <Card style={styles.infoCard}>
            <AppText size="xs" weight="bold" style={[styles.cardSectionHeading, { color: colors.textSecondary }]}>
              ATTACHMENTS & MEDIA ({incident.attachments.length})
            </AppText>

            <View style={[styles.dividerLine, { backgroundColor: colors.borderStrong }]} />

            <View style={{ gap: 10 }}>
              {incident.attachments.map((att) => (
                <TouchableOpacity
                  key={att.id}
                  style={[styles.attachmentRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderStrong }]}
                  onPress={() => setSelectedAttachmentForPreview(att)}
                  activeOpacity={0.7}
                >
                  <View style={{ marginRight: 10 }}>
                    <NavIcon name="incidents" size={20} color={colors.primary[600]} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <AppText size="sm" weight="bold" color="primary">{att.name}</AppText>
                    <AppText size="xs" color="secondary">
                      Type: {att.type.toUpperCase()} {att.size ? `• ${att.size}` : ''}
                    </AppText>
                  </View>

                  <TouchableOpacity
                    style={[styles.openBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                    onPress={() => setSelectedAttachmentForPreview(att)}
                    activeOpacity={0.7}
                  >
                    <AppText size="xs" weight="bold" style={{ color: colors.primary[600] }}>👁️ View / Open</AppText>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        ) : null}

        {/* SUPERVISOR INVESTIGATION COMMENTS */}
        {incident.comments && incident.comments.length > 0 ? (
          <Card style={styles.infoCard}>
            <AppText size="xs" weight="bold" style={[styles.cardSectionHeading, { color: colors.textSecondary }]}>
              SUPERVISOR INVESTIGATION & COMMENTS
            </AppText>

            <View style={[styles.dividerLine, { backgroundColor: colors.borderStrong }]} />

            {incident.comments.map((c) => (
              <View key={c.id} style={[styles.commentBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderStrong }]}>
                <View style={styles.commentHeader}>
                  <AppText size="sm" weight="bold" color="primary">{c.author}</AppText>
                  <AppText size="xs" color="secondary">{c.date}</AppText>
                </View>
                <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>Role: {c.role}</AppText>
                <AppText size="sm" color="primary" style={{ marginTop: 6, lineHeight: 18 }}>
                  {c.text}
                </AppText>
              </View>
            ))}
          </Card>
        ) : null}

        

      </ScrollView>

      {/* Media & Document Attachment Preview Modal */}
      <AttachmentPreviewModal
        visible={!!selectedAttachmentForPreview}
        attachment={selectedAttachmentForPreview}
        onClose={() => setSelectedAttachmentForPreview(null)}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  centerBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    marginBottom: 4,
  },
  mainCard: {
    padding: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  infoCard: {
    padding: 20,
  },
  cardSectionHeading: {
    letterSpacing: 0.5,
  },
  dividerLine: {
    height: 1,
    marginVertical: 12,
  },
  gridContainer: {
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCol: {
    width: '48%',
  },
  gridColFull: {
    width: '100%',
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  openBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  commentBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
