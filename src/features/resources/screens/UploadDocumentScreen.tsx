import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from '@react-native-documents/picker';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';

const documentTypeOptions = [
  'PSARA Security Guard License',
  'Aadhaar Card / Government ID',
  'Police Clearance Certificate',
  'Driving License',
  'Medical Fitness Certificate',
  'Training / Certification',
  'Other Document',
];

export const UploadDocumentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors, borderRadius } = useTheme();
  const { uploadDocument, guardName } = useGuardStore();

  const [selectedType, setSelectedType] = useState<string>('PSARA Security Guard License');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [customDocName, setCustomDocName] = useState<string>('');

  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    mimeType: string;
    fileTypeLabel: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Single unified file picker for both Image and PDF
  const handleChooseFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        allowMultiSelection: false,
      });
      const res = result[0];
      if (res && res.uri) {
        const isPdf = (res.type || '').includes('pdf') || (res.name || '').toLowerCase().endsWith('.pdf');
        setSelectedFile({
          uri: res.uri,
          name: res.name || 'document.pdf',
          mimeType: res.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
          fileTypeLabel: isPdf ? 'PDF Document' : 'Image File',
        });
      }
    } catch (err) {
      if (DocumentPicker.isErrorWithCode(err) && err.code === DocumentPicker.errorCodes.OPERATION_CANCELED) {
        // Cancelled
      } else {
        // Fallback simulated file pick for testing
        const docBase = selectedType === 'Other Document' ? (customDocName || 'Custom_Document') : selectedType.replace(/[^a-zA-Z0-9]/g, '_');
        setSelectedFile({
          uri: 'file://simulated_document.pdf',
          name: `${docBase}.pdf`,
          mimeType: 'application/pdf',
          fileTypeLabel: 'PDF Document (Simulated)',
        });
      }
    }
  };

  const handleSaveAndSubmit = async () => {
    let finalDocName = selectedType;

    // Validation: If "Other Document" is selected, custom name MUST NOT be empty!
    if (selectedType === 'Other Document') {
      if (!customDocName.trim()) {
        Alert.alert(
          'Missing Document Name',
          'Please enter the custom document name when selecting "Other Document".'
        );
        return;
      }
      finalDocName = customDocName.trim();
    }

    if (!selectedFile) {
      Alert.alert(
        'No File Attached',
        'Please choose a PDF or image document before submitting.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await uploadDocument({
        name: finalDocName,
        type: selectedType === 'Other Document' ? 'Custom Document' : selectedType,
        uri: selectedFile.uri,
        fileName: selectedFile.name,
        mimeType: selectedFile.mimeType,
      });

      Alert.alert(
        'Document Submitted',
        `"${finalDocName}" has been uploaded successfully!\n\nStatus: Pending Verification.\n\nIt will update to Approved once verified by supervisor/HR.`,
        [
          {
            text: 'View Documents',
            onPress: () => navigation.navigate('Documents'),
          },
        ]
      );
    } catch (e) {
      Alert.alert('Upload Error', 'Failed to save document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenLayout activeRoute="Documents">
      <PageHeader title="Upload Document" showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Banner Card */}
        <Card variant="outlined" style={[styles.card, { borderRadius: borderRadius.lg }]}>
          <Heading level="h2" color="primary" style={styles.titleText}>
            Upload Document for HR Verification
          </Heading>
          <AppText size="sm" color="secondary" style={{ marginTop: 4 }}>
            Submit official guard documents, government IDs, licenses, or certificates for {guardName || 'Khushi Rani'}.
          </AppText>
        </Card>

        {/* Upload Form Card */}
        <Card variant="outlined" style={[styles.card, { borderRadius: borderRadius.lg }]}>
          <Heading level="h3" color="primary" style={styles.formTitle}>
            DOCUMENT DETAILS
          </Heading>

          {/* Document Type Dropdown */}
          <View style={styles.inputGroup}>
            <AppText size="sm" weight="bold" style={styles.fieldLabel}>
              DOCUMENT TYPE *
            </AppText>

            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              activeOpacity={0.8}
            >
              <AppText size="base" weight="bold" color="primary">
                {selectedType}
              </AppText>
              <AppText size="sm" color="secondary">{dropdownOpen ? '▲' : '▼'}</AppText>
            </TouchableOpacity>

            {/* Dropdown Options */}
            {dropdownOpen && (
              <View style={styles.dropdownMenu}>
                {documentTypeOptions.map((opt) => {
                  const isSel = selectedType === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.dropdownItem, isSel && styles.dropdownItemActive]}
                      onPress={() => {
                        setSelectedType(opt);
                        setDropdownOpen(false);
                      }}
                    >
                      <AppText
                        size="sm"
                        weight={isSel ? 'bold' : 'medium'}
                        style={{ color: isSel ? '#4F46E5' : '#334155' }}
                      >
                        {isSel ? `✓ ${opt}` : opt}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Conditional Name Input for "Other Document" */}
          {selectedType === 'Other Document' && (
            <View style={styles.inputGroup}>
              <AppText size="sm" weight="bold" style={styles.fieldLabel}>
                CUSTOM DOCUMENT NAME *
              </AppText>
              <TextInput
                style={styles.textInput}
                placeholder="Enter document name (e.g. Birth Certificate, Passbook)"
                placeholderTextColor="#94A3B8"
                value={customDocName}
                onChangeText={setCustomDocName}
              />
              {!customDocName.trim() && (
                <AppText size="xs" style={{ color: '#DC2626', marginTop: 2 }}>
                  * Required when selecting "Other Document"
                </AppText>
              )}
            </View>
          )}

          {/* Single Unified File Picker Section */}
          <View style={styles.inputGroup}>
            <AppText size="sm" weight="bold" style={styles.fieldLabel}>
              ATTACH DOCUMENT FILE (IMAGE OR PDF) *
            </AppText>

            <TouchableOpacity
              style={styles.chooseFileBtn}
              onPress={handleChooseFile}
              activeOpacity={0.85}
            >
              <NavIcon name="policies" size={22} color="#FFFFFF" />
              <AppText style={styles.chooseFileBtnText}>
                CHOOSE FILE (PDF OR IMAGE)
              </AppText>
            </TouchableOpacity>

            {/* Selected File Preview Box */}
            {selectedFile ? (
              <View style={styles.filePreviewBox}>
                <View style={{ flex: 1 }}>
                  <AppText size="sm" weight="bold" color="primary">
                    {selectedFile.name}
                  </AppText>
                  <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                    Format: {selectedFile.fileTypeLabel}
                  </AppText>
                </View>

                <TouchableOpacity onPress={() => setSelectedFile(null)} style={{ padding: 6 }}>
                  <AppText size="base" weight="bold" style={{ color: '#EF4444' }}>✕</AppText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyFileBox}>
                <AppText size="xs" color="secondary">
                  No file attached yet. Tap "CHOOSE FILE" above to select a PDF or Image.
                </AppText>
              </View>
            )}
          </View>

          {/* Notice Box */}
          <View style={styles.infoBox}>
            <AppText size="xs" style={{ color: '#D97706', lineHeight: 16 }}>
              Note: Once submitted, the status will show as "Pending Verification" until approved by supervisor/HR.
            </AppText>
          </View>

          {/* Submit Button - Standardized Purple/Indigo #4F46E5 */}
          <Button
            title={isSubmitting ? "SAVING & SUBMITTING..." : "SAVE & SUBMIT TO HR"}
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSaveAndSubmit}
            disabled={isSubmitting}
            style={{ height: 54, backgroundColor: '#4F46E5', marginTop: 10, borderRadius: 10 }}
          />
        </Card>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  inputGroup: {
    gap: 6,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13.5,
    color: '#475569',
    letterSpacing: 0.5,
  },
  dropdownTrigger: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    marginTop: 4,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: '#EEF2FF',
  },
  textInput: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  chooseFileBtn: {
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  chooseFileBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  filePreviewBox: {
    marginTop: 8,
    padding: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyFileBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  infoBox: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 6,
  },
});
