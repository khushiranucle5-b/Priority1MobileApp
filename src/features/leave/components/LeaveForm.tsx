import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
// @ts-ignore
import DocumentPicker, { types } from '@react-native-documents/picker';
import { Button } from '../../../components/Button';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, LeaveAttachment } from '../../../store/useGuardStore';

import { Input } from '../../../components/Input';

export const LeaveForm: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const applyLeave = useGuardStore((state) => state.applyLeave);
  
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<LeaveAttachment | null>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!leaveType.trim()) newErrors.leaveType = 'Leave Type is required';
    if (!fromDate.trim()) newErrors.fromDate = 'From Date is required';
    if (!toDate.trim()) newErrors.toDate = 'To Date is required';
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      newErrors.toDate = 'End Date cannot be before Start Date';
    }
    if (!reason.trim()) newErrors.reason = 'Reason is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [types.pdf, types.images, types.doc, types.docx],
      });
      
      if (res.size && res.size > 10 * 1024 * 1024) {
        Alert.alert('File too large', 'Maximum file size is 10 MB.');
        return;
      }
      
      setAttachment({
        name: res.name || 'document',
        type: res.type || 'unknown',
        size: res.size || 0,
        uri: res.uri,
      });
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleSubmit = () => {
    if (!validate()) return;

    applyLeave({
      type: leaveType,
      fromDate,
      toDate,
      days: 2, // Mock calculation
      reason,
      attachment: attachment || undefined,
    });
    
    setLeaveType('Annual Leave');
    setFromDate('');
    setToDate('');
    setReason('');
    setAttachment(null);
    setErrors({});
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <View style={styles.container}>
      <Input
        label="Leave Type"
        value={leaveType}
        onChangeText={(val) => { setLeaveType(val); setErrors({...errors, leaveType: ''}); }}
        error={errors.leaveType}
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Input
            label="From Date (YYYY-MM-DD)"
            value={fromDate}
            placeholder="e.g. 2026-08-20"
            onChangeText={(val) => { setFromDate(val); setErrors({...errors, fromDate: ''}); }}
            error={errors.fromDate}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Input
            label="To Date (YYYY-MM-DD)"
            value={toDate}
            placeholder="e.g. 2026-08-21"
            onChangeText={(val) => { setToDate(val); setErrors({...errors, toDate: ''}); }}
            error={errors.toDate}
          />
        </View>
      </View>

      <Input
        label="Reason"
        value={reason}
        onChangeText={(val) => { setReason(val); setErrors({...errors, reason: ''}); }}
        multiline
        numberOfLines={4}
        placeholder="Enter reason..."
        error={errors.reason}
        style={styles.textArea}
      />

      <View style={styles.field}>
        <AppText
          size="base"
          weight="medium"
          style={[styles.label, { color: colors.text, marginBottom: spacing.xs }]}
        >
          Attachment (Max 10MB)
        </AppText>
        {!attachment ? (
          <TouchableOpacity 
            style={[
              styles.attachmentBox, 
              { 
                borderColor: colors.border, 
                borderRadius: borderRadius.md, 
                borderStyle: 'dashed',
                backgroundColor: colors.surfaceSecondary,
              }
            ]}
            onPress={handlePickDocument}
            activeOpacity={0.7}
          >
            <AppText size="sm" color="primary" weight="medium">Tap to upload file</AppText>
            <AppText size="xs" color="secondary" style={{marginTop: 4}}>PDF, JPG, PNG, DOC, DOCX</AppText>
          </TouchableOpacity>
        ) : (
          <View style={[styles.attachedFile, { borderColor: colors.border, borderRadius: borderRadius.md, backgroundColor: colors.surface }]}>
            <View style={styles.attachedFileInfo}>
              <AppText size="base" weight="semibold" numberOfLines={1}>{attachment.name}</AppText>
              <AppText size="xs" color="secondary">{attachment.type.split('/').pop()?.toUpperCase()} • {formatSize(attachment.size)}</AppText>
            </View>
            <View style={styles.attachedFileActions}>
              <TouchableOpacity onPress={() => setAttachment(null)} style={{marginRight: 16}}>
                <AppText size="sm" color="error" weight="medium">Remove</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePickDocument}>
                <AppText size="sm" color="primary" weight="medium">Replace</AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <Button title="Submit Request" variant="primary" size="large" fullWidth onPress={handleSubmit} style={styles.btn} />

      {showSuccess && (
        <View style={[styles.snackbar, { backgroundColor: colors.success }]}>
          <AppText color="surface" weight="semibold">Leave Submitted Successfully</AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  attachmentBox: {
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  attachedFile: {
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachedFileInfo: {
    flex: 1,
    marginRight: 8,
  },
  attachedFileActions: {
    flexDirection: 'row',
  },
  errorText: {
    marginTop: 4,
  },
  btn: {
    marginTop: 8,
  },
  snackbar: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  }
});
