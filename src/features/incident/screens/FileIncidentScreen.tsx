import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGuardStore } from '../../../store/useGuardStore';
import { useTheme } from '../../../providers/ThemeProvider';
import { insertRow, DBIncident } from '../../../services/db';
import { NavIcon } from '../../../components/NavIcon';

export const FileIncidentScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { guardName, guardId, assignedSite, reportIncident } = useGuardStore();

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Form State
  const [title, setTitle] = useState(route.params?.prefillTitle || '');
  const [category, setCategory] = useState('Security Breach');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [incidentDate, setIncidentDate] = useState(dateStr);
  const [incidentTime, setIncidentTime] = useState(timeStr);
  const [description, setDescription] = useState('');
  const [observations, setObservations] = useState('');
  const [gpsLocation, setGpsLocation] = useState('23.1145° N, 72.5821° E');
  const [gpsRefreshing, setGpsRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<{ id: string; name: string; type: 'image' | 'video' | 'document'; url: string }[]>([]);

  const categories = [
    'Security Breach',
    'Trespassing',
    'Equipment Damage',
    'Property Damage',
    'Medical Emergency',
    'Fire Hazard',
    'Disturbance',
    'Other',
  ];

  const severities: ('Low' | 'Medium' | 'High' | 'Critical')[] = ['Low', 'Medium', 'High', 'Critical'];

  const handleRefreshGps = () => {
    setGpsRefreshing(true);
    setTimeout(() => {
      setGpsRefreshing(false);
      setGpsLocation('23.1148° N, 72.5823° E (Refreshed)');
      Alert.alert('GPS Location Refreshed', 'Location verified inside assigned site boundary.');
    }, 600);
  };

  const handleAddAttachment = (type: 'image' | 'video' | 'document') => {
    const id = `att-${Date.now()}`;
    const name = type === 'image'
      ? `Captured_Evidence_${attachments.length + 1}.jpg`
      : type === 'video'
      ? `Recorded_Clip_${attachments.length + 1}.mp4`
      : `Site_Document_${attachments.length + 1}.pdf`;

    setAttachments([
      ...attachments,
      {
        id,
        name,
        type,
        url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800',
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field Missing', 'Please enter an Incident Title / Summary.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Required Field Missing', 'Please enter Incident Description / Observations.');
      return;
    }

    setSubmitting(true);
    try {
      const incId = `inc-${Date.now()}`;
      const code = `INC-2026-${Math.floor(100 + Math.random() * 900)}`;

      const newIncident: DBIncident = {
        id: incId,
        incidentCode: code,
        title: title.trim(),
        category,
        severity,
        status: 'Open',
        reportedBy: guardName || 'Khushi Rani',
        reportedById: guardId || 'guard-1',
        employeeId: guardId || 'GRD-1024',
        role: 'Senior Security Officer',
        site: assignedSite || 'Ahmedabad Plant (Ranucle Zundal)',
        siteId: 'site-001',
        date: incidentDate,
        exactTime: incidentTime,
        createdAt: new Date().toISOString(),
        details: description.trim(),
        observations: observations.trim() || description.trim(),
        gps: gpsLocation,
        gpsStatus: 'GPS Verified — Inside Site Boundary',
        companyId: 'company-001',
        assignedTo: 'Security Control Room',
        attachments,
      };

      await insertRow('incidents', newIncident);

      await reportIncident({
        type: category,
        title: title.trim(),
        description: description.trim(),
        location: assignedSite || 'Ahmedabad Plant (Ranucle Zundal)',
        severity,
      });

      Alert.alert('Incident Filed', `Incident report ${code} filed successfully!`, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error('Failed to file incident', err);
      Alert.alert('Error', 'Failed to file incident report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout activeRoute="Incident">
      <PageHeader title="File Incident Report" showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Block */}
        <View style={styles.headerBlock}>
          <Heading level="h2" color="primary">File New Incident</Heading>
          <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
            Complete the form below to submit an official security incident report.
          </AppText>
        </View>

        {/* SECTION 1: GUARD & SITE INFORMATION (AUTOMATED) */}
        <Card style={styles.formCard}>
          <AppText size="xs" weight="bold" style={styles.cardSectionHeading}>
            REPORTING GUARD & SITE INFORMATION
          </AppText>
          <View style={styles.dividerLine} />

          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Reported By</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {guardName || 'Khushi Rani'}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Employee ID / Role</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {guardId || 'GRD-1024'} • Officer
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridColFull}>
                <AppText size="xs" color="secondary">Assigned Property / Site</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {assignedSite || 'Ahmedabad Plant (Ranucle Zundal)'}
                </AppText>
              </View>
            </View>

            {/* GPS Verification Row */}
            <View style={styles.gridRow}>
              <View style={styles.gridColFull}>
                <View style={styles.labelWithAction}>
                  <AppText size="xs" color="secondary">Verified GPS Location</AppText>
                  <TouchableOpacity onPress={handleRefreshGps} style={styles.refreshGpsBtn}>
                    {gpsRefreshing ? (
                      <ActivityIndicator size="small" color="#4F46E5" />
                    ) : (
                      <AppText size="xs" weight="bold" style={{ color: '#4F46E5' }}>↻ Refresh GPS</AppText>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.gpsDisplayBox}>
                  <NavIcon name="patrol" size={16} color="#059669" />
                  <AppText size="xs" weight="bold" style={{ color: '#065F46', marginLeft: 6 }}>
                    {gpsLocation}
                  </AppText>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* SECTION 2: INCIDENT DETAILS & CATEGORY */}
        <Card style={styles.formCard}>
          <AppText size="xs" weight="bold" style={styles.cardSectionHeading}>
            INCIDENT CLASSIFICATION & TIME
          </AppText>
          <View style={styles.dividerLine} />

          {/* Incident Category */}
          <AppText size="xs" weight="bold" color="primary" style={{ marginBottom: 6 }}>
            Incident Category / Type *
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
            {categories.map((cat) => {
              const isSel = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.pill, isSel ? styles.activePill : styles.inactivePill]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <AppText size="xs" weight="bold" style={{ color: isSel ? '#FFFFFF' : '#475569' }}>
                    {cat}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Threat Severity */}
          <AppText size="xs" weight="bold" color="primary" style={{ marginTop: 14, marginBottom: 6 }}>
            Threat Severity Level *
          </AppText>
          <View style={styles.severityRow}>
            {severities.map((sev) => {
              const isSel = severity === sev;
              let activeColor = '#059669';
              if (sev === 'Medium') activeColor = '#CA8A04';
              if (sev === 'High') activeColor = '#D97706';
              if (sev === 'Critical') activeColor = '#DC2626';

              return (
                <TouchableOpacity
                  key={sev}
                  style={[
                    styles.severityBtn,
                    isSel ? { backgroundColor: activeColor, borderColor: activeColor } : styles.inactivePill,
                  ]}
                  onPress={() => setSeverity(sev)}
                  activeOpacity={0.7}
                >
                  <AppText size="xs" weight="bold" style={{ color: isSel ? '#FFFFFF' : '#475569' }}>
                    {sev}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Date & Time Row */}
          <View style={[styles.gridRow, { marginTop: 14 }]}>
            <View style={styles.gridCol}>
              <AppText size="xs" color="secondary">Date of Incident</AppText>
              <TextInput
                style={styles.input}
                value={incidentDate}
                onChangeText={setIncidentDate}
                placeholder="Aug 18, 2026"
              />
            </View>

            <View style={styles.gridCol}>
              <AppText size="xs" color="secondary">Exact Time</AppText>
              <TextInput
                style={styles.input}
                value={incidentTime}
                onChangeText={setIncidentTime}
                placeholder="02:30 PM"
              />
            </View>
          </View>
        </Card>

        {/* SECTION 3: SUMMARY & DETAILED DESCRIPTION */}
        <Card style={styles.formCard}>
          <AppText size="xs" weight="bold" style={styles.cardSectionHeading}>
            INCIDENT DESCRIPTION & OBSERVATIONS
          </AppText>
          <View style={styles.dividerLine} />

          {/* Incident Title */}
          <AppText size="xs" weight="bold" color="primary" style={{ marginBottom: 6 }}>
            Incident Title / Brief Summary *
          </AppText>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Unauthorized vehicle near Sector 4 gate"
          />

          {/* Detailed Description */}
          <AppText size="xs" weight="bold" color="primary" style={{ marginTop: 14, marginBottom: 6 }}>
            Detailed Observations & Description *
          </AppText>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 10 }]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholder="Describe what occurred, persons involved, vehicle numbers, immediate actions taken..."
          />
        </Card>

        {/* SECTION 4: MEDIA & EVIDENCE ATTACHMENTS */}
        <Card style={styles.formCard}>
          <AppText size="xs" weight="bold" style={styles.cardSectionHeading}>
            MEDIA & EVIDENCE ATTACHMENTS ({attachments.length})
          </AppText>
          <View style={styles.dividerLine} />

          <View style={styles.attachBtnRow}>
            <TouchableOpacity style={styles.attachPillBtn} onPress={() => handleAddAttachment('image')}>
              <NavIcon name="incidents" size={16} color="#4F46E5" />
              <AppText size="xs" weight="bold" style={{ color: '#4F46E5', marginLeft: 4 }}>+ Add Photo</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachPillBtn} onPress={() => handleAddAttachment('video')}>
              <NavIcon name="incidents" size={16} color="#4F46E5" />
              <AppText size="xs" weight="bold" style={{ color: '#4F46E5', marginLeft: 4 }}>+ Add Video</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachPillBtn} onPress={() => handleAddAttachment('document')}>
              <NavIcon name="incidents" size={16} color="#4F46E5" />
              <AppText size="xs" weight="bold" style={{ color: '#4F46E5', marginLeft: 4 }}>+ Document</AppText>
            </TouchableOpacity>
          </View>

          {attachments.map((att, idx) => (
            <View key={att.id} style={styles.attachmentItem}>
              <AppText size="xs" weight="bold" color="primary">{att.name}</AppText>
              <TouchableOpacity onPress={() => setAttachments(attachments.filter(a => a.id !== att.id))}>
                <AppText size="xs" weight="bold" style={{ color: '#DC2626' }}>Remove</AppText>
              </TouchableOpacity>
            </View>
          ))}
        </Card>

        {/* SUBMIT BUTTON */}
        <Button
          title={submitting ? "Submitting Incident Report..." : "Submit Official Incident Report"}
          variant="primary"
          size="large"
          fullWidth
          disabled={submitting}
          onPress={handleSubmit}
          style={{ height: 54, backgroundColor: '#4F46E5', marginTop: 4 }}
        />

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  headerBlock: {
    marginBottom: 4,
  },
  formCard: {
    padding: 18,
  },
  cardSectionHeading: {
    color: '#64748B',
    letterSpacing: 0.5,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  gridContainer: {
    gap: 12,
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
  labelWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshGpsBtn: {
    padding: 4,
  },
  gpsDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  selectorScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  activePill: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  inactivePill: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  severityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginTop: 4,
  },
  attachBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  attachPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
  },
});
