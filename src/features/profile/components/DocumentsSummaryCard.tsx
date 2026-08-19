import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

import * as DocumentPicker from '@react-native-documents/picker';
import { useGuardStore, DBEmployeeDocument } from '../../../store/useGuardStore';
import { Button } from '../../../components/Button';

export const DocumentsSummaryCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const documents = useGuardStore((state) => state.documents);
  const uploadDocument = useGuardStore((state) => state.uploadDocument);
  const [isUploading, setIsUploading] = React.useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return colors.success;
      case 'Pending': return colors.warning;
      case 'Expired': return colors.error;
      default: return colors.primary[500];
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Verified': return colors.successLight;
      case 'Pending': return colors.surfaceSecondary; // Warning bg if available, otherwise surface
      case 'Expired': return colors.errorLight;
      default: return colors.primary[50];
    }
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        allowMultiSelection: false,
      });
      const res = result[0];
      
      if (res && res.uri) {
        await uploadDocument({
          name: res.name || 'Uploaded Document',
          type: 'General',
          uri: res.uri,
          fileName: res.name || 'document',
          mimeType: res.type || 'application/octet-stream',
        });
      }
    } catch (err) {
      if (DocumentPicker.isErrorWithCode(err) && err.code === DocumentPicker.errorCodes.OPERATION_CANCELED) {
        // User cancelled
      } else {
        console.error('Document picker error:', err);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.headerRow}>
        <Heading level="h4" style={styles.title}>Documents</Heading>
        <Button 
          title={isUploading ? "Uploading..." : "Upload"} 
          onPress={handleUpload} 
          variant="outline" 
          size="small" 
          disabled={isUploading}
        />
      </View>
      
      <View style={[styles.list, { marginTop: spacing.sm }]}>
        {documents.length === 0 ? (
          <AppText size="sm" color="secondary" style={{ paddingVertical: 12 }}>No documents uploaded yet.</AppText>
        ) : (
          documents.map((doc: DBEmployeeDocument, index: number) => (
            <View key={doc.id} style={[styles.row, index !== documents.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <AppText size="sm" weight="medium" numberOfLines={1}>{doc.name}</AppText>
              </View>
              <View style={[styles.badge, { backgroundColor: getStatusBgColor(doc.status), borderRadius: borderRadius.full }]}>
                <AppText size="xs" color={getStatusColor(doc.status)} weight="medium">{doc.status}</AppText>
              </View>
            </View>
          ))
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  }
});
