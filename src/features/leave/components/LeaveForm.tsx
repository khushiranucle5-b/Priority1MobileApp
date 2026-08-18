import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Modal, FlatList, ScrollView } from 'react-native';
import { pick, keepLocalCopy, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { Button } from '../../../components/Button';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, LeaveAttachment } from '../../../store/useGuardStore';
import { Input } from '../../../components/Input';

const LEAVE_TYPES = [
  'Annual Leave',
  'Sick Leave',
  'Casual Leave',
  'Emergency Leave',
  'Unpaid Leave',
];

// Helper to format date nicely
const formatDateString = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`; // e.g. "20 Aug 2026"
};

// Helper for standard machine readable format
const toMachineDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export const LeaveForm: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const applyLeave = useGuardStore((state) => state.applyLeave);
  
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<LeaveAttachment | null>(null);
  const [durationDays, setDurationDays] = useState(0);

  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [pickingTarget, setPickingTarget] = useState<'from' | 'to'>('from');

  // Calendar states
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date().getMonth());
  const [currentCalendarYear, setCurrentCalendarYear] = useState(new Date().getFullYear());

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto calculate duration in days
  useEffect(() => {
    if (fromDate && toDate) {
      const diffTime = toDate.getTime() - fromDate.getTime();
      if (diffTime >= 0) {
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDurationDays(diffDays);
      } else {
        setDurationDays(0);
      }
    } else {
      setDurationDays(0);
    }
  }, [fromDate, toDate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!leaveType) newErrors.leaveType = 'Leave Type is required';
    if (!fromDate) newErrors.fromDate = 'From Date is required';
    if (!toDate) newErrors.toDate = 'To Date is required';
    if (fromDate && toDate && fromDate > toDate) {
      newErrors.toDate = 'End Date cannot be before Start Date';
    }
    if (!reason.trim()) newErrors.reason = 'Reason is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickDocument = async () => {
    try {
      const resList = await pick({
        type: [types.pdf, types.images, types.doc, types.docx],
      });
      const res = resList[0];
      
      if (res.size && res.size > 10 * 1024 * 1024) {
        Alert.alert('File too large', 'Maximum file size is 10 MB.');
        return;
      }

      // Copy file to permanent local storage
      const copyResults = await keepLocalCopy({
        files: [{ uri: res.uri, fileName: res.name || 'document' }],
        destination: 'documentDirectory',
      });

      const copyRes = copyResults[0];
      if (copyRes.status === 'error') {
        throw new Error(copyRes.copyError || 'Failed to keep local copy');
      }
      
      setAttachment({
        name: res.name || 'document',
        type: res.type || 'unknown',
        size: res.size || 0,
        uri: copyRes.localUri,
      });
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      console.error('Document copy error:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await applyLeave({
      type: leaveType,
      fromDate: toMachineDate(fromDate!),
      toDate: toMachineDate(toDate!),
      days: durationDays,
      reason,
      attachment: attachment || undefined,
    });
    
    setLeaveType('Annual Leave');
    setFromDate(null);
    setToDate(null);
    setReason('');
    setAttachment(null);
    setErrors({});
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Calendar Helpers
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleSelectDay = (day: number) => {
    const selected = new Date(currentCalendarYear, currentCalendarMonth, day);
    if (pickingTarget === 'from') {
      setFromDate(selected);
      setErrors((prev) => ({ ...prev, fromDate: '' }));
      // Auto adjust To Date if it is now invalid
      if (toDate && selected > toDate) {
        setToDate(null);
      }
    } else {
      if (fromDate && selected < fromDate) {
        Alert.alert('Invalid Range', 'End Date cannot be before Start Date.');
        return;
      }
      setToDate(selected);
      setErrors((prev) => ({ ...prev, toDate: '' }));
    }
    setIsDatePickerVisible(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentCalendarMonth, currentCalendarYear);
    const firstDayIndex = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
    // Adjust for Monday start (0 for Sunday -> shift to index 6, etc)
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const cells = [];
    // Empty cells before start of month
    for (let i = 0; i < adjustedFirstDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.calendarCell} />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentCellDate = new Date(currentCalendarYear, currentCalendarMonth, day);
      const isSelected = pickingTarget === 'from' 
        ? fromDate && currentCellDate.toDateString() === fromDate.toDateString()
        : toDate && currentCellDate.toDateString() === toDate.toDateString();
      const isDisabled = !!(pickingTarget === 'to' && fromDate && currentCellDate < fromDate);

      cells.push(
        <TouchableOpacity
          key={`day-${day}`}
          disabled={isDisabled}
          style={[
            styles.calendarCell,
            isSelected && { backgroundColor: colors.primary[600], borderRadius: 20 },
            isDisabled && { opacity: 0.25 },
          ]}
          onPress={() => handleSelectDay(day)}
        >
          <AppText
            size="base"
            weight={isSelected ? 'bold' : 'medium'}
            style={{ color: isSelected ? '#FFFFFF' : isDisabled ? colors.textSecondary : colors.text }}
          >
            {day}
          </AppText>
        </TouchableOpacity>
      );
    }

    return cells;
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentCalendarMonth === 0) {
        setCurrentCalendarMonth(11);
        setCurrentCalendarYear((prev) => prev - 1);
      } else {
        setCurrentCalendarMonth((prev) => prev - 1);
      }
    } else {
      if (currentCalendarMonth === 11) {
        setCurrentCalendarMonth(0);
        setCurrentCalendarYear((prev) => prev + 1);
      } else {
        setCurrentCalendarMonth((prev) => prev + 1);
      }
    }
  };

  const getMonthName = (monthIndex: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Leave Type Selector Trigger */}
      <View style={styles.field}>
        <AppText size="base" weight="semibold" style={{ color: colors.text, marginBottom: spacing.xs }}>Leave Type</AppText>
        <TouchableOpacity
          style={[
            styles.selectTrigger,
            { borderColor: errors.leaveType ? colors.error : colors.border, borderRadius: borderRadius.md, backgroundColor: colors.surface }
          ]}
          onPress={() => setIsTypeModalVisible(true)}
          activeOpacity={0.7}
        >
          <AppText size="base" style={{ color: leaveType ? colors.text : colors.textSecondary }}>
            {leaveType || 'Select Leave Type'}
          </AppText>
          <AppText size="sm" color="secondary">▼</AppText>
        </TouchableOpacity>
        {errors.leaveType && <AppText size="xs" color="error" style={{ marginTop: 4 }}>{errors.leaveType}</AppText>}
      </View>

      {/* Date Fields row */}
      <View style={styles.row}>
        {/* From Date Trigger */}
        <View style={{ flex: 1, marginRight: 8 }}>
          <AppText size="base" weight="semibold" style={{ color: colors.text, marginBottom: spacing.xs }}>From Date</AppText>
          <TouchableOpacity
            style={[
              styles.selectTrigger,
              { borderColor: errors.fromDate ? colors.error : colors.border, borderRadius: borderRadius.md, backgroundColor: colors.surface }
            ]}
            onPress={() => {
              setPickingTarget('from');
              setIsDatePickerVisible(true);
            }}
            activeOpacity={0.7}
          >
            <AppText size="base" style={{ color: fromDate ? colors.text : colors.textSecondary }}>
              {fromDate ? formatDateString(fromDate) : 'Select Date'}
            </AppText>
            <AppText size="sm">📅</AppText>
          </TouchableOpacity>
          {errors.fromDate && <AppText size="xs" color="error" style={{ marginTop: 4 }}>{errors.fromDate}</AppText>}
        </View>

        {/* To Date Trigger */}
        <View style={{ flex: 1, marginLeft: 8 }}>
          <AppText size="base" weight="semibold" style={{ color: colors.text, marginBottom: spacing.xs }}>To Date</AppText>
          <TouchableOpacity
            style={[
              styles.selectTrigger,
              { borderColor: errors.toDate ? colors.error : colors.border, borderRadius: borderRadius.md, backgroundColor: colors.surface }
            ]}
            onPress={() => {
              setPickingTarget('to');
              setIsDatePickerVisible(true);
            }}
            activeOpacity={0.7}
          >
            <AppText size="base" style={{ color: toDate ? colors.text : colors.textSecondary }}>
              {toDate ? formatDateString(toDate) : 'Select Date'}
            </AppText>
            <AppText size="sm">📅</AppText>
          </TouchableOpacity>
          {errors.toDate && <AppText size="xs" color="error" style={{ marginTop: 4 }}>{errors.toDate}</AppText>}
        </View>
      </View>

      {/* Duration Label */}
      {durationDays > 0 && (
        <View style={[styles.durationBadge, { backgroundColor: colors.primary[50], borderRadius: borderRadius.md }]}>
          <AppText size="base" weight="semibold" color="primary">
            Calculated Duration: {durationDays} Day(s)
          </AppText>
        </View>
      )}

      {/* Reason Field */}
      <View style={styles.field}>
        <Input
          label="Reason"
          value={reason}
          onChangeText={(val) => { setReason(val); setErrors({...errors, reason: ''}); }}
          multiline
          numberOfLines={4}
          placeholder="Enter detailed reason for leave..."
          error={errors.reason}
          style={styles.textArea}
        />
      </View>

      {/* File Upload Field */}
      <View style={styles.field}>
        <AppText size="base" weight="semibold" style={{ color: colors.text, marginBottom: spacing.xs }}>
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
            <AppText size="base" color="primary" weight="bold">Tap to upload file</AppText>
            <AppText size="sm" color="secondary" style={{marginTop: 4}}>PDF, JPG, PNG, DOC, DOCX</AppText>
          </TouchableOpacity>
        ) : (
          <View style={[styles.attachedFile, { borderColor: colors.border, borderRadius: borderRadius.md, backgroundColor: colors.surface }]}>
            <View style={styles.attachedFileInfo}>
              <AppText size="base" weight="semibold" numberOfLines={1}>{attachment.name}</AppText>
              <AppText size="xs" color="secondary">{attachment.type.split('/').pop()?.toUpperCase()} • {formatSize(attachment.size)}</AppText>
            </View>
            <View style={styles.attachedFileActions}>
              <TouchableOpacity onPress={() => setAttachment(null)} style={{marginRight: 16}}>
                <AppText size="base" color="error" weight="bold">Remove</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePickDocument}>
                <AppText size="base" color="primary" weight="bold">Replace</AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Submit Button */}
      <Button 
        title="Submit Request" 
        variant="primary" 
        size="large" 
        fullWidth 
        onPress={handleSubmit} 
        style={styles.btn} 
      />

      <View style={{ height: 40 }} />

      {/* LEAVE TYPE DROPDOWN MODAL */}
      <Modal visible={isTypeModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl }]}>
            <View style={styles.modalHeader}>
              <AppText size="lg" weight="bold">Select Leave Type</AppText>
              <TouchableOpacity onPress={() => setIsTypeModalVisible(false)} style={styles.closeBtn}>
                <AppText size="base" color="primary" weight="bold">Close</AppText>
              </TouchableOpacity>
            </View>
            <FlatList
              data={LEAVE_TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    { borderBottomColor: colors.border },
                    leaveType === item && { backgroundColor: colors.primary[50] }
                  ]}
                  onPress={() => {
                    setLeaveType(item);
                    setErrors((prev) => ({ ...prev, leaveType: '' }));
                    setIsTypeModalVisible(false);
                  }}
                >
                  <AppText size="base" weight={leaveType === item ? 'bold' : 'medium'} color={leaveType === item ? 'primary' : 'primary'}>
                    {item}
                  </AppText>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* DATE PICKER CALENDAR MODAL */}
      <Modal visible={isDatePickerVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.calendarSheet, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.navArrow}>
                <AppText size="lg" weight="bold">◀</AppText>
              </TouchableOpacity>
              <AppText size="base" weight="bold">
                {getMonthName(currentCalendarMonth)} {currentCalendarYear}
              </AppText>
              <TouchableOpacity onPress={() => changeMonth('next')} style={styles.navArrow}>
                <AppText size="lg" weight="bold">▶</AppText>
              </TouchableOpacity>
            </View>
            
            {/* Days of Week label */}
            <View style={styles.daysOfWeekRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <View key={`label-${idx}`} style={styles.calendarCell}>
                  <AppText size="xs" color="secondary" weight="semibold">{day}</AppText>
                </View>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>

            <TouchableOpacity 
              style={[styles.cancelDateBtn, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md }]} 
              onPress={() => setIsDatePickerVisible(false)}
            >
              <AppText size="base" weight="bold">Cancel</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showSuccess && (
        <View style={[styles.snackbar, { backgroundColor: colors.success }]}>
          <AppText color="surface" weight="semibold" size="base">Leave Request Submitted Successfully</AppText>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  selectTrigger: {
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  durationBadge: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  attachmentBox: {
    borderWidth: 1.5,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachedFile: {
    borderWidth: 1.5,
    padding: 16,
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
    alignItems: 'center',
  },
  btn: {
    height: 52,
    justifyContent: 'center',
    marginTop: 8,
  },
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '60%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeBtn: {
    padding: 4,
  },
  typeOption: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  calendarSheet: {
    margin: 20,
    padding: 16,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
    marginTop: 'auto',
    marginBottom: 'auto',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navArrow: {
    padding: 12,
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  calendarCell: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelDateBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  }
});
