import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { TaskRecord } from '../types/task.types';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { NavIcon } from '../../../components/NavIcon';
import { useTheme } from '../../../providers/ThemeProvider';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

interface TaskStatusModalProps {
  visible: boolean;
  task: TaskRecord;
  mode: 'progress' | 'complete';
  onClose: () => void;
  onSubmit: (progress: number, notes: string, photos: string[]) => Promise<void>;
}

export const TaskStatusModal: React.FC<TaskStatusModalProps> = ({
  visible,
  task,
  mode,
  onClose,
  onSubmit,
}) => {
  const { colors, borderRadius, spacing } = useTheme();
  const [progress, setProgress] = useState(mode === 'complete' ? 100 : task.progress || 50);
  const [notes, setNotes] = useState(task.completionNotes || '');
  const [photos, setPhotos] = useState<string[]>(task.completionPhotos || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickPhoto = () => {
    Alert.alert('Attach Task Photo', 'Choose an option to attach verification photo:', [
      {
        text: 'Take Photo',
        onPress: async () => {
          try {
            const res = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: true });
            if (res.assets && res.assets[0]?.uri) {
              setPhotos((prev) => [...prev, res.assets![0].uri!]);
            }
          } catch (e) {
            console.warn('Camera error:', e);
          }
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          try {
            const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
            if (res.assets && res.assets[0]?.uri) {
              setPhotos((prev) => [...prev, res.assets![0].uri!]);
            }
          } catch (e) {
            console.warn('Gallery error:', e);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (mode === 'complete' && !notes.trim()) {
      Alert.alert('Required', 'Please enter completion notes.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(progress, notes, photos);
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to submit task update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSignOffRequired = task.requiresSignOff;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <AppText style={[styles.subRef, { color: colors.primary[600] }]}>{task.taskReference}</AppText>
              <Heading level="h4" style={{ color: colors.text }}>
                {mode === 'complete' ? 'Submit Task' : 'Update Progress'}
              </Heading>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <NavIcon name="close" size={24} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Sign-off banner if completing and supervisor required */}
            {mode === 'complete' && isSignOffRequired && (
              <View style={[styles.signOffBanner, { backgroundColor: colors.warningLight, borderColor: colors.warningBorder, borderRadius: borderRadius.md }]}>
                <AppText style={[styles.signOffBannerTitle, { color: colors.warningDark }]}>
                  ⚠️ Supervisor Sign-Off Required
                </AppText>
                <AppText style={[styles.signOffBannerText, { color: colors.textSecondary }]}>
                  This task requires supervisor review. Once submitted, it will be marked "Under Review" pending sign-off from {task.supervisorName || 'your supervisor'}.
                </AppText>
              </View>
            )}

            {/* Progress Selector */}
            <View style={styles.section}>
              <View style={styles.rowBetween}>
                <AppText style={[styles.sectionTitle, { color: colors.text }]}>Progress</AppText>
                <AppText style={[styles.progressNumber, { color: colors.primary[600] }]}>{progress}%</AppText>
              </View>

              <View style={styles.progressChipsRow}>
                {[25, 50, 75, 100].map((val) => {
                  const isSelected = progress === val;
                  return (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary[600] : colors.surfaceSecondary,
                          borderColor: isSelected ? colors.primary[600] : colors.border,
                          borderRadius: borderRadius.md,
                        },
                      ]}
                      onPress={() => setProgress(val)}
                      activeOpacity={0.7}
                    >
                      <AppText
                        style={[
                          styles.chipText,
                          { color: isSelected ? colors.textInverse : colors.text },
                        ]}
                      >
                        {val}%
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Completion Notes */}
            <View style={styles.section}>
              <AppText style={[styles.sectionTitle, { color: colors.text }]}>
                {mode === 'complete' ? 'Completion Notes *' : 'Remarks (Optional)'}
              </AppText>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.text,
                    borderRadius: borderRadius.md,
                  },
                ]}
                placeholder={
                  mode === 'complete'
                    ? 'Enter completion notes...'
                    : 'Enter status remarks...'
                }
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Photos */}
            <View style={styles.section}>
              <View style={styles.rowBetween}>
                <AppText style={[styles.sectionTitle, { color: colors.text }]}>Photos (Optional)</AppText>
                <TouchableOpacity onPress={handlePickPhoto} style={styles.addPhotoBtn} activeOpacity={0.7}>
                  <NavIcon name="camera" size={16} color={colors.primary[600]} />
                  <AppText style={[styles.addPhotoText, { color: colors.primary[600] }]}>+ Add Photo</AppText>
                </TouchableOpacity>
              </View>

              {photos.length === 0 ? (
                <TouchableOpacity
                  style={[styles.emptyPhotoBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderRadius: borderRadius.md }]}
                  onPress={handlePickPhoto}
                  activeOpacity={0.7}
                >
                  <NavIcon name="camera" size={26} color={colors.textTertiary} />
                  <AppText style={[styles.emptyPhotoText, { color: colors.textTertiary }]}>
                    Tap to attach photos
                  </AppText>
                </TouchableOpacity>
              ) : (
                <View style={styles.photosGrid}>
                  {photos.map((uri, idx) => (
                    <View key={idx} style={styles.photoThumbWrapper}>
                      <Image source={{ uri }} style={[styles.photoThumb, { borderRadius: borderRadius.md }]} />
                      <TouchableOpacity
                        style={styles.deletePhotoBadge}
                        onPress={() => handleRemovePhoto(idx)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <AppText style={styles.deletePhotoText}>✕</AppText>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button
              title="Cancel"
              variant="outline"
              size="medium"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title={mode === 'complete' ? (isSignOffRequired ? 'Submit for Review' : 'Mark Completed') : 'Save Progress'}
              variant="primary"
              size="medium"
              isLoading={isSubmitting}
              onPress={handleSubmit}
              style={{ flex: 1.6 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1.5,
  },
  subRef: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  signOffBanner: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  signOffBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  signOffBannerText: {
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    marginBottom: 18,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressChipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '700',
  },
  textArea: {
    borderWidth: 1.5,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  emptyPhotoBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyPhotoText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoThumbWrapper: {
    position: 'relative',
    width: 76,
    height: 76,
  },
  photoThumb: {
    width: 76,
    height: 76,
  },
  deletePhotoBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#DC2626',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletePhotoText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1.5,
  },
});
