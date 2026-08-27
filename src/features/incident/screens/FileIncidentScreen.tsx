import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGuardStore } from '../../../store/useGuardStore';
import { useTheme } from '../../../providers/ThemeProvider';
import { insertRow, updateRow, getTable, DBIncident } from '../../../services/db';
import { NavIcon } from '../../../components/NavIcon';
import { FilterBottomSheet } from '../../../components/FilterBottomSheet';
import { AttachmentPreviewModal, AttachmentItem } from '../../../components/AttachmentPreviewModal';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';

export const FileIncidentScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { guardName, guardId, assignedSite, reportIncident } = useGuardStore();

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Form State
  const [existingIncident, setExistingIncident] = useState<DBIncident | null>(null);
  const [title, setTitle] = useState(route.params?.prefillTitle || '');
  const [category, setCategory] = useState('Security Breach');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [incidentDate, setIncidentDate] = useState(dateStr);
  const [incidentTime, setIncidentTime] = useState(timeStr);
  const [description, setDescription] = useState('');
  const [observations, setObservations] = useState('');
  const [dropdownCategoryOpen, setDropdownCategoryOpen] = useState(false);
  const [dropdownSeverityOpen, setDropdownSeverityOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(!!route.params?.incidentId);
  const [attachments, setAttachments] = useState<{ id: string; name: string; type: 'image' | 'video' | 'document'; url: string }[]>([]);
  const [selectedAttachmentForPreview, setSelectedAttachmentForPreview] = useState<AttachmentItem | null>(null);

  useEffect(() => {
    const loadIncident = async () => {
      const incidentId = route.params?.incidentId;
      if (incidentId) {
        try {
          const all = await getTable<DBIncident>('incidents');
          const inc = all.find(i => i.id === incidentId);
          if (inc) {
            setExistingIncident(inc);
            setTitle(inc.title || '');
            setCategory(inc.category || 'Security Breach');
            if (['Low', 'Medium', 'High', 'Critical'].includes(inc.severity)) {
              setSeverity(inc.severity as any);
            }
            setIncidentDate(inc.date || dateStr);
            setIncidentTime(inc.exactTime || timeStr);
            setDescription(inc.details || '');
            setObservations(inc.observations || inc.details || '');
            if (inc.attachments) setAttachments(inc.attachments);
          }
        } catch (err) {
          console.error('Failed to load incident for editing', err);
        }
      }
      setLoadingInitial(false);
    };
    loadIncident();
  }, [route.params?.incidentId]);

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

  const handleAddAttachment = async (type: 'camera' | 'image' | 'video' | 'document') => {
    try {
      if (type === 'camera') {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "Camera Permission",
              message: "App needs camera permission to capture incident photos.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert("Permission Denied", "Camera permission is required to take photos.");
            return;
          }
        }
        const result = await launchCamera({
          mediaType: 'photo',
          saveToPhotos: true,
        });

        if (result.didCancel || !result.assets || result.assets.length === 0) return;

        const asset = result.assets[0];
        setAttachments(prev => [
          ...prev,
          {
            id: `att-${Date.now()}`,
            name: asset.fileName || `Captured_image`,
            type: 'image',
            url: asset.uri || '',
          },
        ]);
      } else if (type === 'image' || type === 'video') {
        const result = await launchImageLibrary({
          mediaType: type === 'image' ? 'photo' : 'video',
          selectionLimit: 1,
        });

        if (result.didCancel || !result.assets || result.assets.length === 0) return;

        const asset = result.assets[0];
        setAttachments(prev => [
          ...prev,
          {
            id: `att-${Date.now()}`,
            name: asset.fileName || `Selected_${type}`,
            type: type === 'image' ? 'image' : 'video',
            url: asset.uri || '',
          },
        ]);
      } else if (type === 'document') {
        const result = await pick({
          type: [types.allFiles],
          allowMultiSelection: false,
        });

        if (!result || result.length === 0) return;

        setAttachments(prev => [
          ...prev,
          {
            id: `att-${Date.now()}`,
            name: result[0].name || 'Selected_document',
            type,
            url: result[0].uri,
          },
        ]);
      }
    } catch (err: any) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      console.error('Failed to pick attachment:', err);
      Alert.alert('Error', 'Could not select the file.');
    }
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
      const isEditing = !!existingIncident;

      if (isEditing && existingIncident) {
        // Edit mode
        const updates: Partial<DBIncident> = {
          title: title.trim(),
          category,
          severity,
          date: incidentDate,
          exactTime: incidentTime,
          details: description.trim(),
          observations: observations.trim() || description.trim(),
          attachments,
        };
        await updateRow('incidents', existingIncident.id, updates);

        Alert.alert('Incident Updated', `Incident report ${existingIncident.incidentCode || existingIncident.id} updated successfully!`, [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        // Create mode
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
      }
    } catch (err) {
      console.error('Failed to save incident', err);
      Alert.alert('Error', 'Failed to save incident report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!existingIncident;

  if (loadingInitial) {
    return (
      <ScreenLayout activeRoute="Incident">
        <PageHeader title="Edit Incident Report" showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout activeRoute="Incident">
      <PageHeader title={isEditing ? "Edit Incident Report" : "File Incident Report"} showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header Block */}
        <View style={styles.headerBlock}>
          <Heading level="h2" color="primary">{isEditing ? "Edit Incident" : "File New Incident"}</Heading>
          <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
            {isEditing ? "Update the information for this incident report." : "Complete the form below to submit an official security incident report."}
          </AppText>
        </View>

        {/* SECTION 1: INCIDENT DETAILS & CATEGORY */}
        <Card style={styles.formCard}>
          <AppText size="xs" weight="bold" style={styles.cardSectionHeading}>
            INCIDENT CLASSIFICATION & TIME
          </AppText>
          <View style={styles.dividerLine} />

          {/* Incident Category */}
          <AppText size="xs" weight="bold" color="primary" style={{ marginBottom: 6 }}>
            Incident Category / Type *
          </AppText>
          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() => setDropdownCategoryOpen(true)}
            activeOpacity={0.7}
          >
            <AppText size="base" style={{ color: '#0F172A' }}>
              {category}
            </AppText>
            <AppText size="xs" color="secondary">▼</AppText>
          </TouchableOpacity>

          {/* Threat Severity */}
          <AppText size="xs" weight="bold" color="primary" style={{ marginTop: 14, marginBottom: 6 }}>
            Threat Severity Level *
          </AppText>
          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() => setDropdownSeverityOpen(true)}
            activeOpacity={0.7}
          >
            <AppText size="base" style={{ color: '#0F172A' }}>
              {severity}
            </AppText>
            <AppText size="xs" color="secondary">▼</AppText>
          </TouchableOpacity>

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
            <TouchableOpacity style={styles.attachPillBtn} onPress={() => handleAddAttachment('camera')}>
              <NavIcon name="camera" size={16} color="#4F46E5" />
              <AppText size="xs" weight="bold" style={{ color: '#4F46E5', marginLeft: 4 }}>+ Camera</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachPillBtn} onPress={() => handleAddAttachment('image')}>
              <NavIcon name="camera" size={16} color="#4F46E5" />
              <AppText size="xs" weight="bold" style={{ color: '#4F46E5', marginLeft: 4 }}>+ Gallery</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachPillBtn} onPress={() => handleAddAttachment('video')}>
              <NavIcon name="camera" size={16} color="#4F46E5" />
              <AppText size="xs" weight="bold" style={{ color: '#4F46E5', marginLeft: 4 }}>+ Add Video</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachPillBtn} onPress={() => handleAddAttachment('document')}>
              <NavIcon name="camera" size={16} color="#4F46E5" />
              <AppText size="xs" weight="bold" style={{ color: '#4F46E5', marginLeft: 4 }}>+ Document</AppText>
            </TouchableOpacity>
          </View>

          {attachments.map((att) => (
            <View key={att.id} style={styles.attachmentItem}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}
                onPress={() => setSelectedAttachmentForPreview(att)}
                activeOpacity={0.7}
              >
                <NavIcon name={att.type === 'document' ? 'incidents' : 'camera'} size={18} color="#4F46E5" />
                <AppText size="sm" weight="semibold" color="primary" style={{ marginLeft: 8 }} numberOfLines={1}>
                  {att.name}
                </AppText>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TouchableOpacity
                  onPress={() => setSelectedAttachmentForPreview(att)}
                  style={styles.viewBtn}
                  activeOpacity={0.7}
                >
                  <AppText size="xs" weight="bold" style={{ color: '#4F46E5' }}>👁️ View</AppText>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setAttachments(attachments.filter(a => a.id !== att.id))} style={styles.removeBtn}>
                  <NavIcon name="delete" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>

        {/* SUBMIT BUTTON */}
        <Button
          title={submitting ? "Saving..." : (isEditing ? "SAVE INCIDENT UPDATES" : "SUBMIT REPORT")}
          variant="primary"
          size="large"
          fullWidth
          disabled={submitting}
          onPress={handleSubmit}
          style={{ height: 60, marginTop: 4 }}
        />

      </ScrollView>

      {/* Category Bottom Sheet */}
      <FilterBottomSheet
        visible={dropdownCategoryOpen}
        onClose={() => setDropdownCategoryOpen(false)}
        title="Select Category"
        options={categories}
        selectedValue={category}
        onSelect={(cat) => setCategory(cat)}
      />

      {/* Severity Bottom Sheet */}
      <FilterBottomSheet
        visible={dropdownSeverityOpen}
        onClose={() => setDropdownSeverityOpen(false)}
        title="Select Severity"
        options={severities}
        selectedValue={severity}
        onSelect={(sev) => setSeverity(sev as any)}
      />

      {/* Media & Document Evidence Attachment Preview Modal */}
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
    padding: 6,
    minHeight: 48,
    justifyContent: 'center',
  },
  gpsDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 52,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionActive: {
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 0,
  },
  removeBtn: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  viewBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    marginTop: 4,
    minHeight: 52,
  },
  attachBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  attachPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
  attachmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    minHeight: 48,
  },
});
