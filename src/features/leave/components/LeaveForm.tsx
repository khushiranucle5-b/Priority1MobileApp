import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Modal, ScrollView, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { pick, keepLocalCopy, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { Button } from '../../../components/Button';
import { AppText } from '../../../components/typography/Text';
import { NavIcon } from '../../../components/NavIcon';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, LeaveAttachment, LeaveRequest } from '../../../store/useGuardStore';
import { Input } from '../../../components/Input';
import { FilterBottomSheet } from '../../../components/FilterBottomSheet';
import { getHolidayInfoForDate, checkDateRangeForHolidays } from '../../holidays/data/holidaysData';

// Helper to format date nicely
const formatDateString = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`; // e.g. "20 Aug 2026"
};

const toMachineDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

interface LeaveFormProps {
  editingLeave?: LeaveRequest | null;
  onFinishedEdit?: () => void;
}

export const LeaveForm: React.FC<LeaveFormProps> = ({ editingLeave, onFinishedEdit }) => {
  const navigation = useNavigation<any>();
  const { colors, spacing, borderRadius } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 600;

  const applyLeave = useGuardStore((state) => state.applyLeave);
  const updateLeave = useGuardStore((state) => state.updateLeave);
  const leaveBalances = useGuardStore((state) => state.leaveBalances);

  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<LeaveAttachment | null>(null);
  const [durationDays, setDurationDays] = useState(0);

  // Pre-fill form if editing an existing leave or reset if null
  useEffect(() => {
    if (editingLeave) {
      setLeaveType(editingLeave.type || 'Annual Leave');
      if (editingLeave.fromDate) {
        const p = editingLeave.fromDate.split('-').map(Number);
        if (p.length === 3) {
          setFromDate(new Date(p[0], p[1] - 1, p[2]));
        }
      }
      if (editingLeave.toDate) {
        const p = editingLeave.toDate.split('-').map(Number);
        if (p.length === 3) {
          setToDate(new Date(p[0], p[1] - 1, p[2]));
        }
      }
      setIsHalfDay(editingLeave.days === 0.5);
      setReason(editingLeave.reason || '');
      setAttachment(editingLeave.attachment || null);
      setErrors({});
    } else {
      setLeaveType('Annual Leave');
      setFromDate(null);
      setToDate(null);
      setIsHalfDay(false);
      setReason('');
      setAttachment(null);
      setErrors({});
    }
  }, [editingLeave]);

  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [pickingTarget, setPickingTarget] = useState<'from' | 'to'>('from');

  // Calendar states
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date().getMonth());
  const [currentCalendarYear, setCurrentCalendarYear] = useState(new Date().getFullYear());

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Available balance getter
  const getAvailableBalance = (typeStr: string): number | string => {
    const s = typeStr.toLowerCase();
    if (s.includes('annual')) return leaveBalances?.annual ?? 12;
    if (s.includes('sick')) return leaveBalances?.sick ?? 5;
    if (s.includes('unpaid')) return 'Unlimited';
    return 0;
  };

  const currentAvailableBal = getAvailableBalance(leaveType);

  // When editing, account for the days already reserved by this leave
  const reservedDaysForThisLeave = (editingLeave && editingLeave.type.toLowerCase() === leaveType.toLowerCase())
    ? (editingLeave.days || 0)
    : 0;

  const effectiveAvailableBal = typeof currentAvailableBal === 'number'
    ? currentAvailableBal + reservedDaysForThisLeave
    : currentAvailableBal;

  const getOptionBalance = (optType: string) => {
    const bal = getAvailableBalance(optType);
    if (typeof bal === 'number') {
      const reserved = (editingLeave && editingLeave.type.toLowerCase() === optType.toLowerCase())
        ? (editingLeave.days || 0)
        : 0;
      return bal + reserved;
    }
    return bal;
  };

  // Leave types configuration with live balance
  const LEAVE_TYPE_OPTIONS = [
    { type: 'Annual Leave', balance: getOptionBalance('Annual Leave'), exhausted: typeof getOptionBalance('Annual Leave') === 'number' && (getOptionBalance('Annual Leave') as number) <= 0 },
    { type: 'Sick Leave', balance: getOptionBalance('Sick Leave'), exhausted: typeof getOptionBalance('Sick Leave') === 'number' && (getOptionBalance('Sick Leave') as number) <= 0 },
    { type: 'Unpaid Leave', balance: 'Unlimited', exhausted: false },
  ];

  // Auto calculate duration in days
  useEffect(() => {
    if (fromDate && toDate) {
      if (isHalfDay) {
        setDurationDays(0.5);
      } else {
        const diffTime = toDate.getTime() - fromDate.getTime();
        if (diffTime >= 0) {
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          setDurationDays(diffDays);
        } else {
          setDurationDays(0);
        }
      }
    } else if (fromDate && isHalfDay) {
      setDurationDays(0.5);
    } else {
      setDurationDays(0);
    }
  }, [fromDate, toDate, isHalfDay]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!leaveType) {
      newErrors.leaveType = 'Leave Type is required.';
    }

    if (!fromDate) {
      newErrors.fromDate = 'Start Date is required.';
    }

    if (!toDate && !isHalfDay) {
      newErrors.toDate = 'End Date is required.';
    }

    const effectiveToDate = toDate || fromDate;

    if (fromDate && effectiveToDate && fromDate > effectiveToDate) {
      newErrors.toDate = 'End Date cannot be before Start Date.';
    }

    // HOLIDAY VALIDATIONS (Strict Business Rule)
    if (fromDate) {
      const fromHoliday = getHolidayInfoForDate(fromDate);
      if (fromHoliday.isHoliday) {
        newErrors.fromDate = `Leave cannot be applied for a holiday. (${fromHoliday.holidayName})`;
      }
    }

    if (effectiveToDate) {
      const toHoliday = getHolidayInfoForDate(effectiveToDate);
      if (toHoliday.isHoliday) {
        newErrors.toDate = `Leave cannot be applied for a holiday. (${toHoliday.holidayName})`;
      }
    }

    if (fromDate && effectiveToDate && !newErrors.fromDate && !newErrors.toDate) {
      const rangeHoliday = checkDateRangeForHolidays(fromDate, effectiveToDate);
      if (rangeHoliday.hasHoliday) {
        newErrors.general = `Your selected leave period includes a holiday (${rangeHoliday.holidayName} on ${rangeHoliday.holidayDateStr}). Please select different dates.`;
      }
    }

    // Leave Balance Validation
    if (typeof effectiveAvailableBal === 'number' && durationDays > effectiveAvailableBal) {
      newErrors.leaveType = `Insufficient leave balance. Available balance is ${effectiveAvailableBal} day(s).`;
    }

    if (!reason.trim()) {
      newErrors.reason = 'Reason / Description is required.';
    }

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

  const handleResetForm = () => {
    setLeaveType('Annual Leave');
    setFromDate(null);
    setToDate(null);
    setIsHalfDay(false);
    setReason('');
    setAttachment(null);
    setErrors({});
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const startDateStr = toMachineDate(fromDate!);
      const endDateStr = toDate ? toMachineDate(toDate!) : startDateStr;

      if (editingLeave) {
        await updateLeave(editingLeave.id, {
          type: leaveType,
          fromDate: startDateStr,
          toDate: endDateStr,
          days: durationDays,
          reason,
          attachment: attachment || undefined,
        });
        handleResetForm();
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIsSubmitting(false);
          if (onFinishedEdit) onFinishedEdit();
        }, 1200);
      } else {
        await applyLeave({
          type: leaveType,
          fromDate: startDateStr,
          toDate: endDateStr,
          days: durationDays,
          reason,
          attachment: attachment || undefined,
        });

        handleResetForm();
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIsSubmitting(false);
          if (onFinishedEdit) {
            onFinishedEdit();
          } else {
            navigation.navigate('Leave');
          }
        }, 1200);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      console.error('[LeaveForm] Submission error:', err);
      Alert.alert(
        'Error',
        editingLeave
          ? 'Unable to update leave application. Please try again.'
          : 'Unable to submit leave application. Please try again.'
      );
    }
  };

  const handleSelectDay = (day: number) => {
    const selected = new Date(currentCalendarYear, currentCalendarMonth, day);
    const holidayCheck = getHolidayInfoForDate(selected);

    if (holidayCheck.isHoliday) {
      Alert.alert(
        'Holiday Selected',
        `Selected date (${formatDateString(selected)}) is an official holiday: ${holidayCheck.holidayName}.\n\nLeave cannot be applied for a holiday.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (pickingTarget === 'from') {
      setFromDate(selected);
      setErrors((prev) => ({ ...prev, fromDate: '', general: '' }));
      if (toDate && selected > toDate) {
        setToDate(selected);
      }
    } else {
      if (fromDate && selected < fromDate) {
        Alert.alert('Invalid Date Range', 'End Date cannot be before Start Date.');
        return;
      }
      setToDate(selected);
      setErrors((prev) => ({ ...prev, toDate: '', general: '' }));
    }
    setIsDatePickerVisible(false);
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();

    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.calendarCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentCellDate = new Date(currentCalendarYear, currentCalendarMonth, day);
      const holidayCheck = getHolidayInfoForDate(currentCellDate);

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
            isSelected && { backgroundColor: colors.primary[600] || '#8b5cf6', borderRadius: 20 },
            holidayCheck.isHoliday && !isSelected && { backgroundColor: '#fff7ed', borderColor: '#ea580c', borderWidth: 1, borderRadius: 20 },
            isDisabled && { opacity: 0.25 },
          ]}
          onPress={() => handleSelectDay(day)}
        >
          <AppText
            size="xs"
            weight={isSelected || holidayCheck.isHoliday ? 'bold' : 'medium'}
            style={{
              color: isSelected ? '#FFFFFF' : holidayCheck.isHoliday ? '#c2410c' : isDisabled ? colors.textDisabled : colors.text
            }}
          >
            {day}
          </AppText>
          {holidayCheck.isHoliday && !isSelected && (
            <AppText size="xs" style={{ fontSize: 7, color: '#c2410c', marginTop: -2 }}>
              Holiday
            </AppText>
          )}
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
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      {/* Main Leave Application Details Card */}
      <View style={[styles.mainCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <AppText size="md" weight="bold" color="primary" style={styles.headerTitle}>
            {editingLeave ? 'EDIT LEAVE APPLICATION DETAILS' : 'LEAVE APPLICATION DETAILS'}
          </AppText>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.formBody}>
          {/* Error Banner if any */}
          {errors.general && (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorLight || '#fee2e2', borderRadius: borderRadius.md }]}>
              <AppText size="sm" color="error" weight="bold">
                {errors.general}
              </AppText>
            </View>
          )}

          {/* Date Picker Row */}
          <View style={[styles.fieldRow, isDesktop ? styles.rowHorizontal : styles.rowVertical]}>
            {/* Start Date */}
            <View style={[styles.fieldCol, isDesktop && { marginRight: 8 }]}>
              <AppText size="sm" weight="bold" color="primary" style={styles.fieldLabel}>
                Start Date <AppText size="sm" style={{ color: colors.error }}>*</AppText>
              </AppText>
              <TouchableOpacity
                style={[
                  styles.inputTrigger,
                  { borderColor: errors.fromDate ? colors.error : colors.borderStrong || '#cbd5e1', borderRadius: borderRadius.md, backgroundColor: colors.background || '#f8fafc' }
                ]}
                onPress={() => {
                  setPickingTarget('from');
                  if (fromDate) {
                    setCurrentCalendarMonth(fromDate.getMonth());
                    setCurrentCalendarYear(fromDate.getFullYear());
                  }
                  setIsDatePickerVisible(true);
                }}
                activeOpacity={0.7}
              >
                <AppText size="base" weight="semibold" style={{ color: fromDate ? colors.text : colors.textSecondary }}>
                  {fromDate ? formatDateString(fromDate) : 'Select start date'}
                </AppText>
                <NavIcon name="calendar" size={22} color={colors.textSecondary || '#64748b'} />
              </TouchableOpacity>
              {errors.fromDate && <AppText size="xs" color="error" style={styles.errorText}>{errors.fromDate}</AppText>}
            </View>

            {/* End Date */}
            <View style={[styles.fieldCol, isDesktop && { marginLeft: 8 }]}>
              <AppText size="sm" weight="bold" color="primary" style={styles.fieldLabel}>
                End Date <AppText size="sm" style={{ color: colors.error }}>*</AppText>
              </AppText>
              <TouchableOpacity
                style={[
                  styles.inputTrigger,
                  { borderColor: errors.toDate ? colors.error : colors.borderStrong || '#cbd5e1', borderRadius: borderRadius.md, backgroundColor: colors.background || '#f8fafc' }
                ]}
                onPress={() => {
                  setPickingTarget('to');
                  if (toDate) {
                    setCurrentCalendarMonth(toDate.getMonth());
                    setCurrentCalendarYear(toDate.getFullYear());
                  } else if (fromDate) {
                    setCurrentCalendarMonth(fromDate.getMonth());
                    setCurrentCalendarYear(fromDate.getFullYear());
                  }
                  setIsDatePickerVisible(true);
                }}
                activeOpacity={0.7}
              >
                <AppText size="base" weight="semibold" style={{ color: toDate ? colors.text : colors.textSecondary }}>
                  {toDate ? formatDateString(toDate) : 'Select end date'}
                </AppText>
                <NavIcon name="calendar" size={22} color={colors.textSecondary || '#64748b'} />
              </TouchableOpacity>
              {errors.toDate && <AppText size="xs" color="error" style={styles.errorText}>{errors.toDate}</AppText>}
            </View>
          </View>

          {/* Half-Day Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsHalfDay(!isHalfDay)}
            activeOpacity={0.8}
          >
            <View style={[
              styles.checkboxBox,
              { borderColor: isHalfDay ? (colors.primary[600] || '#8b5cf6') : colors.borderStrong || '#cbd5e1' },
              isHalfDay && { backgroundColor: colors.primary[600] || '#8b5cf6' }
            ]}>
              {isHalfDay && <AppText size="sm" weight="bold" style={{ color: '#FFFFFF' }}>✓</AppText>}
            </View>
            <AppText size="base" weight="semibold" color="primary" style={styles.checkboxLabel}>
              Apply for half day only
            </AppText>
          </TouchableOpacity>

          {/* Duration Badge if dates selected */}
          {durationDays > 0 && (
            <View style={[styles.durationContainer, { backgroundColor: colors.primary[50] || '#f3e8ff', borderRadius: borderRadius.md }]}>
              <AppText size="sm" weight="bold" color="primary">
                Calculated Duration: {durationDays} Day(s) {isHalfDay ? '(Half-Day)' : ''}
              </AppText>
            </View>
          )}

          {/* Leave Type + Available Paid Balance & Attachments Row */}
          <View style={[styles.fieldRow, isDesktop ? styles.rowHorizontal : styles.rowVertical]}>
            {/* Leave Type Dropdown */}
            <View style={[styles.fieldCol, isDesktop && { marginRight: 8 }]}>
              <View style={styles.labelWithBalanceRow}>
                <AppText size="sm" weight="bold" color="primary">
                  Leave Type <AppText size="sm" style={{ color: colors.error }}>*</AppText>
                </AppText>
                <AppText size="xs" weight="bold" color="secondary">
                  Available: {effectiveAvailableBal} {typeof effectiveAvailableBal === 'number' ? 'days' : ''}
                </AppText>
              </View>

              <TouchableOpacity
                style={[
                  styles.inputTrigger,
                  { borderColor: errors.leaveType ? colors.error : colors.borderStrong || '#cbd5e1', borderRadius: borderRadius.md, backgroundColor: colors.background || '#f8fafc' }
                ]}
                onPress={() => setIsTypeModalVisible(true)}
                activeOpacity={0.7}
              >
                <AppText size="base" weight="semibold" style={{ color: leaveType ? colors.text : colors.textSecondary }}>
                  {leaveType || 'Select Leave Type'}
                </AppText>
                <AppText size="xs" color="secondary">▼</AppText>
              </TouchableOpacity>
              {errors.leaveType && <AppText size="xs" color="error" style={styles.errorText}>{errors.leaveType}</AppText>}
            </View>

            {/* Attachments */}
            <View style={[styles.fieldCol, isDesktop && { marginLeft: 8 }]}>
              <AppText size="sm" weight="bold" color="primary" style={styles.fieldLabel}>
                Attachment
              </AppText>
              <TouchableOpacity
                style={[
                  styles.attachmentTrigger,
                  { borderColor: colors.borderStrong || '#cbd5e1', borderRadius: borderRadius.md, backgroundColor: colors.background || '#f8fafc' }
                ]}
                onPress={handlePickDocument}
                activeOpacity={0.7}
              >
                <View style={[styles.chooseFileBtn, { backgroundColor: colors.primary[600] || '#2563eb' }]}>
                  <AppText size="xs" weight="bold" style={{ color: '#FFFFFF' }}>+ Add Attachment</AppText>
                </View>
                <AppText size="xs" color="secondary" numberOfLines={1} style={styles.fileNameText}>
                  {attachment ? attachment.name : 'No file chosen'}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reason / Description Textarea */}
          <View style={styles.fieldCol}>
            <AppText size="sm" weight="bold" color="primary" style={styles.fieldLabel}>
              Reason / Description <AppText size="sm" style={{ color: colors.error }}>*</AppText>
            </AppText>
            <Input
              value={reason}
              onChangeText={(val) => { setReason(val); setErrors((prev) => ({ ...prev, reason: '' })); }}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholder="Enter reason or detailed description for leave application..."
              error={errors.reason}
              style={styles.textArea}
            />
          </View>

          <View style={[styles.bottomDivider, { backgroundColor: colors.border }]} />

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.borderStrong || '#cbd5e1', borderRadius: borderRadius.md }]}
              onPress={() => {
                handleResetForm();
                if (editingLeave && onFinishedEdit) onFinishedEdit();
              }}
              activeOpacity={0.7}
            >
              <AppText size="base" weight="bold" color="secondary">Cancel</AppText>
            </TouchableOpacity>

            <Button
              title={
                isSubmitting
                  ? (editingLeave ? "Updating..." : "Submitting...")
                  : (editingLeave ? "UPDATE LEAVE" : "SUBMIT LEAVE")
              }
              disabled={isSubmitting}
              variant="primary"
              size="large"
              onPress={handleSubmit}
              style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
            />
          </View>
        </View>
      </View>

      {/* Leave Type Selector Bottom Sheet */}
      <FilterBottomSheet
        visible={isTypeModalVisible}
        onClose={() => setIsTypeModalVisible(false)}
        title="Select Leave Type"
        options={LEAVE_TYPE_OPTIONS.map((opt) => ({
          label: `${opt.type} (${opt.balance})${opt.exhausted ? ' — Exhausted' : ''}`,
          value: opt.type,
          disabled: opt.exhausted,
        }))}
        selectedValue={leaveType}
        onSelect={(typeVal) => {
          setLeaveType(typeVal);
          setErrors((prev) => ({ ...prev, leaveType: '' }));
        }}
      />

      {/* Date Picker Modal with Holiday Visual Indicators */}
      <Modal visible={isDatePickerVisible} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsDatePickerVisible(false)}>
          <View style={[styles.calendarSheet, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]} onStartShouldSetResponder={() => true}>
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
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <View key={`label-${day}`} style={styles.calendarCell}>
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
        </TouchableOpacity>
      </Modal>

      {showSuccess && (
        <View style={[styles.snackbar, { backgroundColor: colors.success || '#16a34a' }]}>
          <AppText color="surface" weight="semibold" size="base">
            {editingLeave ? 'Leave Application Updated Successfully!' : 'Leave Request Submitted Successfully!'}
          </AppText>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  mainCard: {
    borderWidth: 1.5,
    paddingVertical: 18,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    letterSpacing: 0.5,
  },
  divider: {
    height: 1.5,
    marginBottom: 16,
  },
  formBody: {
    paddingHorizontal: 20,
  },
  errorBanner: {
    padding: 14,
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: 16,
  },
  fieldRow: {
    marginBottom: 16,
  },
  rowHorizontal: {
    flexDirection: 'row',
  },
  rowVertical: {
    flexDirection: 'column',
    gap: 16,
  },
  fieldCol: {
    flex: 1,
  },
  fieldLabel: {
    marginBottom: 8,
  },
  labelWithBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputTrigger: {
    borderWidth: 2,
    paddingHorizontal: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attachmentTrigger: {
    borderWidth: 2,
    paddingHorizontal: 8,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chooseFileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  fileNameText: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    minHeight: 48,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxLabel: {
    letterSpacing: 0.2,
  },
  durationContainer: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  errorText: {
    marginTop: 6,
    fontWeight: '600',
  },
  bottomDivider: {
    height: 1.5,
    marginTop: 20,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 14,
  },
  cancelBtn: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderWidth: 1.5,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 60,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownCard: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1.5,
    padding: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E0E0E0',
  },
  dropdownOption: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    minHeight: 52,
    justifyContent: 'center',
  },
  optionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarSheet: {
    padding: 18,
    width: '100%',
    maxWidth: 380,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navArrow: {
    padding: 10,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelDateBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    minHeight: 52,
    justifyContent: 'center',
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
});
