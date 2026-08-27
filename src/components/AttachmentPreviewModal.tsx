import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Image, Linking, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from './typography/Text';
import { Heading } from './typography/Heading';
import { Button } from './Button';
import { useTheme } from '../providers/ThemeProvider';

export interface AttachmentItem {
  id?: string;
  name: string;
  type: 'image' | 'video' | 'document' | string;
  url: string;
  size?: string;
}

interface AttachmentPreviewModalProps {
  visible: boolean;
  attachment: AttachmentItem | null;
  onClose: () => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  visible,
  attachment,
  onClose,
}) => {
  const { colors, borderRadius } = useTheme();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!attachment) return null;

  const isImage = attachment.type === 'image' || (attachment.url && (attachment.url.endsWith('.jpg') || attachment.url.endsWith('.png') || attachment.url.endsWith('.jpeg')));
  const isVideo = attachment.type === 'video' || (attachment.url && (attachment.url.endsWith('.mp4') || attachment.url.endsWith('.mov')));
  const isDoc = attachment.type === 'document' || !isImage && !isVideo;

  const handleOpenExternal = async () => {
    try {
      if (attachment.url) {
        const canOpen = await Linking.canOpenURL(attachment.url);
        if (canOpen) {
          await Linking.openURL(attachment.url);
        } else {
          await Linking.openURL(attachment.url).catch(() => {
            console.log('Cannot open URL directly:', attachment.url);
          });
        }
      }
    } catch (err) {
      console.error('Failed to open attachment externally:', err);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
            {/* Modal Header */}
            <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
              <View style={styles.headerTitleGroup}>
                <AppText size="xl" style={{ marginRight: 8 }}>
                  {isImage ? '🖼️' : isVideo ? '🎥' : '📄'}
                </AppText>
                <View style={{ flex: 1 }}>
                  <Heading level="h4" color="primary" numberOfLines={1}>
                    {attachment.name || 'Attachment Preview'}
                  </Heading>
                  <AppText size="xs" color="secondary">
                    {isImage ? 'Image Evidence' : isVideo ? 'Video Evidence' : 'Document File'} {attachment.size ? `• ${attachment.size}` : ''}
                  </AppText>
                </View>
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <AppText size="lg" weight="bold" color="secondary">✕</AppText>
              </TouchableOpacity>
            </View>

            {/* Modal Content View */}
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
              {isImage ? (
                <View style={styles.mediaFrame}>
                  {imageLoading && !imageError && (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator size="large" color="#4F46E5" />
                      <AppText size="xs" color="secondary" style={{ marginTop: 8 }}>Loading image preview...</AppText>
                    </View>
                  )}
                  {imageError ? (
                    <View style={styles.errorBox}>
                      <AppText style={{ fontSize: 36 }}>🖼️</AppText>
                      <AppText size="sm" weight="bold" style={{ color: '#DC2626', marginTop: 8 }}>Image Cannot Be Rendered Directly</AppText>
                      <AppText size="xs" color="secondary" style={{ textAlign: 'center', marginTop: 4 }}>
                        Local URI / File link format: {attachment.url}
                      </AppText>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: attachment.url }}
                      style={styles.imagePreview}
                      resizeMode="contain"
                      onLoadStart={() => {
                        setImageLoading(true);
                        setImageError(false);
                      }}
                      onLoadEnd={() => setImageLoading(false)}
                      onError={() => {
                        setImageLoading(false);
                        setImageError(true);
                      }}
                    />
                  )}
                </View>
              ) : isVideo ? (
                <View style={styles.videoFrame}>
                  <View style={styles.videoPlaceholder}>
                    <AppText style={{ fontSize: 48 }}>🎥</AppText>
                    <Heading level="h4" style={{ color: '#FFFFFF', marginTop: 12 }}>Video Evidence Preview</Heading>
                    <AppText size="xs" style={{ color: '#94A3B8', marginTop: 4, textAlign: 'center', paddingHorizontal: 20 }}>
                      File: {attachment.name}
                    </AppText>

                    <TouchableOpacity style={styles.playOverlayBtn} onPress={handleOpenExternal} activeOpacity={0.8}>
                      <AppText size="xl" style={{ color: '#FFFFFF', marginRight: 6 }}>▶️</AppText>
                      <AppText size="sm" weight="bold" style={{ color: '#FFFFFF' }}>Play in Media Player</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.docFrame}>
                  <View style={styles.docIconBox}>
                    <AppText style={{ fontSize: 40 }}>📄</AppText>
                  </View>
                  <Heading level="h3" color="primary" style={{ marginTop: 12, textAlign: 'center' }}>
                    {attachment.name}
                  </Heading>
                  <AppText size="sm" color="secondary" style={{ marginTop: 4 }}>
                    Document / Report Attachment
                  </AppText>

                  <View style={styles.docInfoCard}>
                    <AppText size="xs" weight="bold" color="secondary" style={{ marginBottom: 6 }}>FILE DETAILS</AppText>
                    <AppText size="xs" color="primary">• Format: PDF / Office Document</AppText>
                    <AppText size="xs" color="primary" style={{ marginTop: 2 }}>• Location: Incident Evidence Store</AppText>
                    <AppText size="xs" color="primary" style={{ marginTop: 2 }}>• Path: {attachment.url}</AppText>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Actions */}
            <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
              {attachment.url ? (
                <Button
                  title="Open External File"
                  variant="outline"
                  size="medium"
                  onPress={handleOpenExternal}
                  style={{ flex: 1, marginRight: 10 }}
                />
              ) : null}
              <Button
                title="Close"
                variant="primary"
                size="medium"
                onPress={onClose}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeContainer: {
    width: '92%',
    maxHeight: '90%',
    justifyContent: 'center',
  },
  modalCard: {
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    maxHeight: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  contentContainer: {
    padding: 16,
    alignItems: 'center',
  },
  mediaFrame: {
    width: '100%',
    minHeight: 280,
    maxHeight: 400,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imagePreview: {
    width: '100%',
    height: 320,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  videoFrame: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    backgroundColor: '#0F172A',
    paddingVertical: 36,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 10,
  },
  playOverlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 20,
  },
  docFrame: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  docIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  docInfoCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  footerRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
});
