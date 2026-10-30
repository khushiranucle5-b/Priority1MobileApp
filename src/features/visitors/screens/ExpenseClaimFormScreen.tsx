import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { visitorService } from '../services/visitor.service';
import {
  ExpenseCategory,
  ExpensePaymentType,
  STANDARD_EXPENSE_CATEGORIES,
  STANDARD_EXPENSE_PAYMENT_TYPES,
} from '../types/visitor.types';
import {
  ChevronDown,
  Check,
  Tag,
  DollarSign,
  X,
  RotateCcw,
  Calendar,
  Camera,
  Image as ImageIcon,
  FileText,
  Trash2,
  Paperclip,
  Eye,
  Upload,
} from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';

export const ExpenseClaimFormScreen: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { guardName, guardId } = useGuardStore();

  const claimId = route.params?.claimId;
  const isEditing = !!claimId || route.params?.isEditing;

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [businessPurpose, setBusinessPurpose] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>(
    route.params?.preselectedCategory || 'Travel & Parking'
  );
  const [selectedPaymentType, setSelectedPaymentType] = useState<ExpensePaymentType>(
    'Employee Reimbursement'
  );
  const [merchantName, setMerchantName] = useState('');
  const [expenseDate, setExpenseDate] = useState('10/26/2026');
  const [claimedAmount, setClaimedAmount] = useState('');
  const [salesTaxAmount, setSalesTaxAmount] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [supervisorFeedback, setSupervisorFeedback] = useState<string | null>(null);

  // Receipt / Bill Attachment State
  const [receiptPhotoUri, setReceiptPhotoUri] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [receiptFileType, setReceiptFileType] = useState<'image' | 'pdf' | 'document' | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  // Picker Modals
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [paymentTypePickerOpen, setPaymentTypePickerOpen] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (claimId) {
          // Editing existing claim
          const claim = await visitorService.getExpenseClaimById(claimId);
          if (claim) {
            if (claim.status !== 'Changes Requested by Supervisor') {
              Alert.alert(
                'Editing Locked',
                'This expense claim is locked. Claims can only be revised when a supervisor requests changes.',
                [{ text: 'Go Back', onPress: () => navigation.goBack() }]
              );
              return;
            }

            setSupervisorFeedback(claim.supervisorNotes || null);
            setBusinessPurpose(claim.businessPurpose || claim.remarks || '');
            setSelectedCategory((claim.expenseCategory as ExpenseCategory) || 'Travel & Parking');
            setSelectedPaymentType((claim.expenseType as ExpensePaymentType) || 'Employee Reimbursement');
            setMerchantName(claim.merchantName || '');
            setExpenseDate(claim.expenseDate || '10/26/2026');
            setClaimedAmount(String(claim.claimedAmount ?? claim.amount ?? ''));
            setSalesTaxAmount(claim.salesTaxAmount ? String(claim.salesTaxAmount) : '');
            setDetailedDescription(claim.detailedDescription || claim.remarks || '');

            if (claim.receiptPhotoUri) {
              setReceiptPhotoUri(claim.receiptPhotoUri);
              setReceiptFileName(claim.receiptFileName || 'receipt_document');
              setReceiptFileType(
                claim.receiptFileType ||
                  (claim.receiptPhotoUri.toLowerCase().includes('.pdf') ? 'pdf' : 'image')
              );
            }
          }
        } else {
          // New Claim creation
          const today = new Date();
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          const yyyy = today.getFullYear();
          setExpenseDate(`${mm}/${dd}/${yyyy}`);
        }
      } catch (e) {
        console.error('Failed to initialize expense form', e);
      } finally {
        setLoadingInitial(false);
      }
    };

    initializeData();
  }, [claimId, guardId, route.params]);

  // Pick receipt via Camera, Photo Gallery, or Document / PDF
  const handlePickReceipt = () => {
    Alert.alert(
      'Attach Receipt / Bill',
      'Choose receipt upload source:',
      [
        {
          text: 'Take Photo (Camera)',
          onPress: async () => {
            try {
              const res = await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
                saveToPhotos: false,
              });
              if (res.assets && res.assets[0]?.uri) {
                const asset = res.assets[0];
                setReceiptPhotoUri(asset.uri);
                setReceiptFileName(asset.fileName || `receipt_${Date.now()}.jpg`);
                setReceiptFileType('image');
              }
            } catch (e) {
              Alert.alert('Camera Error', 'Unable to access camera.');
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const res = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                selectionLimit: 1,
              });
              if (res.assets && res.assets[0]?.uri) {
                const asset = res.assets[0];
                setReceiptPhotoUri(asset.uri);
                setReceiptFileName(asset.fileName || `receipt_${Date.now()}.jpg`);
                setReceiptFileType('image');
              }
            } catch (e) {
              Alert.alert('Gallery Error', 'Unable to access photos.');
            }
          },
        },
        {
          text: 'Upload PDF / File',
          onPress: async () => {
            try {
              const result = await pick({
                type: [types.pdf, types.images, types.allFiles],
                allowMultiSelection: false,
              });
              const file = result[0];
              if (file && file.uri) {
                const isPdf =
                  (file.type || '').includes('pdf') ||
                  (file.name || '').toLowerCase().endsWith('.pdf');
                const isImg =
                  (file.type || '').includes('image') ||
                  /\.(jpg|jpeg|png|webp)$/i.test(file.name || '');

                setReceiptPhotoUri(file.uri);
                setReceiptFileName(file.name || (isPdf ? 'receipt.pdf' : 'receipt.jpg'));
                setReceiptFileType(isPdf ? 'pdf' : isImg ? 'image' : 'document');
              }
            } catch (err) {
              if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                // User cancelled selection
              } else {
                console.warn('Document picker error:', err);
              }
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Remove receipt
  const handleRemoveReceipt = () => {
    Alert.alert(
      'Remove Receipt',
      'Are you sure you want to remove this attached receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setReceiptPhotoUri(null);
            setReceiptFileName(null);
            setReceiptFileType(null);
          },
        },
      ]
    );
  };

  // Submit / Save
  const handleSave = async () => {
    if (!businessPurpose.trim()) {
      Alert.alert('Required', 'Please enter the expense purpose.');
      return;
    }

    const numAmount = parseFloat(claimedAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (!merchantName.trim()) {
      Alert.alert('Required', 'Please enter the merchant or vendor.');
      return;
    }

    const numTax = salesTaxAmount.trim() ? parseFloat(salesTaxAmount) : undefined;

    setSaving(true);

    if (claimId) {
      // Update and resubmit back to Pending Supervisor Approval
      const res = await visitorService.updateExpenseClaim(claimId, {
        status: 'Pending Supervisor Approval',
        businessPurpose: businessPurpose.trim(),
        expenseCategory: selectedCategory,
        expenseType: selectedPaymentType,
        merchantName: merchantName.trim(),
        expenseDate: expenseDate.trim() || '10/26/2026',
        claimedAmount: numAmount,
        amount: numAmount,
        salesTaxAmount: numTax,
        detailedDescription: detailedDescription.trim() || undefined,
        currency: '$',
        receiptPhotoUri: receiptPhotoUri || undefined,
        receiptFileName: receiptFileName || undefined,
        receiptFileType: receiptFileType || undefined,
      });

      setSaving(false);

      if (res.success && res.claim) {
        Alert.alert('Claim Updated', `Expense claim ${res.claim.id} updated successfully with receipt attached.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', res.error || 'Failed to update expense claim.');
      }
    } else {
      // Create
      const res = await visitorService.submitExpenseClaim(
        {
          businessPurpose: businessPurpose.trim(),
          expenseCategory: selectedCategory,
          expenseType: selectedPaymentType,
          merchantName: merchantName.trim(),
          expenseDate: expenseDate.trim() || '10/26/2026',
          claimedAmount: numAmount,
          amount: numAmount,
          salesTaxAmount: numTax,
          detailedDescription: detailedDescription.trim() || undefined,
          currency: '$',
          receiptPhotoUri: receiptPhotoUri || undefined,
          receiptFileName: receiptFileName || undefined,
          receiptFileType: receiptFileType || undefined,
        },
        { guardId: guardId || 'guard-1', guardName: guardName || 'Khushi Rani' }
      );

      setSaving(false);

      if (res.success && res.claim) {
        Alert.alert(
          'Expense Claim Submitted',
          `Claim ${res.claim.id} for $${numAmount.toFixed(2)} submitted for supervisor approval.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', res.error || 'Failed to submit expense claim.');
      }
    }
  };

  return (
    <ScreenLayout activeRoute="VehicleExpense">
      <PageHeader
        title={isEditing ? 'Edit Expense Claim' : 'New Expense Claim'}
        showBack={true}
        onBack={() => navigation.navigate('VehicleExpense')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Supervisor Feedback Banner when revising */}
        {supervisorFeedback && (
          <View style={[styles.supervisorFeedbackBox, { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' }]}>
            <RotateCcw size={18} color="#1D4ED8" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <AppText size="xs" weight="bold" style={{ color: '#1D4ED8' }}>
                Supervisor Requested Changes:
              </AppText>
              <AppText size="xs" style={{ color: '#1E40AF', marginTop: 2, lineHeight: 18 }}>
                {supervisorFeedback}
              </AppText>
            </View>
          </View>
        )}
        {/* ========================================================
            EXPENSE DETAILS
        ======================================================== */}
        <View style={styles.formSectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Tag size={18} color={colors.primary[600]} />
            <Heading level="h4" style={{ color: colors.text, marginLeft: 8 }}>
              Expense Details
            </Heading>
          </View>

          {/* Purpose * */}
          <View style={[styles.formField, { marginTop: 12 }]}>
            <AppText size="xs" weight="bold" style={styles.formLabel}>
              Purpose *
            </AppText>
            <TextInput
              style={[styles.inputBox, { color: colors.text, borderColor: colors.border }]}
              value={businessPurpose}
              onChangeText={setBusinessPurpose}
            />
          </View>

          {/* Category * */}
          <View style={styles.formField}>
            <AppText size="xs" weight="bold" style={styles.formLabel}>
              Category *
            </AppText>
            <TouchableOpacity
              style={[styles.dropdownTrigger, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => setCategoryPickerOpen(true)}
              activeOpacity={0.8}
            >
              <Tag size={16} color={colors.primary[600]} />
              <AppText size="sm" weight="semibold" style={{ color: colors.text, marginLeft: 8, flex: 1 }}>
                {selectedCategory}
              </AppText>
              <ChevronDown size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Payment Method * */}
          <View style={styles.formField}>
            <AppText size="xs" weight="bold" style={styles.formLabel}>
              Payment Method *
            </AppText>
            <TouchableOpacity
              style={[styles.dropdownTrigger, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => setPaymentTypePickerOpen(true)}
              activeOpacity={0.8}
            >
              <DollarSign size={16} color={colors.primary[600]} />
              <AppText size="sm" weight="semibold" style={{ color: colors.text, marginLeft: 8, flex: 1 }}>
                {selectedPaymentType}
              </AppText>
              <ChevronDown size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Merchant / Vendor * */}
          <View style={styles.formField}>
            <AppText size="xs" weight="bold" style={styles.formLabel}>
              Merchant / Vendor *
            </AppText>
            <TextInput
              style={[styles.inputBox, { color: colors.text, borderColor: colors.border }]}
              value={merchantName}
              onChangeText={setMerchantName}
            />
          </View>

          {/* Date * */}
          <View style={styles.formField}>
            <AppText size="xs" weight="bold" style={styles.formLabel}>
              Date *
            </AppText>
            <View style={[styles.inputWithIcon, { borderColor: colors.border }]}>
              <Calendar size={16} color={colors.textTertiary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.inputInner, { color: colors.text }]}
                value={expenseDate}
                onChangeText={setExpenseDate}
              />
            </View>
          </View>

          {/* Amounts Row */}
          <View style={styles.amountsRow}>
            <View style={[styles.formField, { flex: 1, marginRight: 8 }]}>
              <AppText size="xs" weight="bold" style={styles.formLabel}>
                Amount ($) *
              </AppText>
              <TextInput
                style={[styles.inputBox, styles.boldInput, { color: colors.text, borderColor: colors.border }]}
                keyboardType="numeric"
                value={claimedAmount}
                onChangeText={setClaimedAmount}
              />
            </View>

            <View style={[styles.formField, { flex: 1, marginLeft: 8 }]}>
              <AppText size="xs" weight="bold" style={styles.formLabel}>
                Tax ($)
              </AppText>
              <TextInput
                style={[styles.inputBox, { color: colors.text, borderColor: colors.border }]}
                keyboardType="numeric"
                value={salesTaxAmount}
                onChangeText={setSalesTaxAmount}
              />
            </View>
          </View>

          {/* ========================================================
              RECEIPT / BILL UPLOAD SECTION
          ======================================================== */}
          <View style={styles.formField}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <AppText size="xs" weight="bold" style={styles.formLabel}>
                Receipt / Tax Invoice
              </AppText>
              {receiptPhotoUri && (
                <TouchableOpacity onPress={handlePickReceipt}>
                  <AppText size="xs" weight="bold" style={{ color: colors.primary[600] }}>
                    Change
                  </AppText>
                </TouchableOpacity>
              )}
            </View>

            {receiptPhotoUri ? (
              <View style={[styles.receiptCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <View style={styles.receiptCardRow}>
                  {receiptFileType === 'image' ? (
                    <TouchableOpacity onPress={() => setPreviewModalVisible(true)} activeOpacity={0.8} style={styles.thumbWrapper}>
                      <Image source={{ uri: receiptPhotoUri }} style={styles.receiptThumb} />
                      <View style={styles.thumbZoomIcon}>
                        <Eye size={12} color="#FFF" />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.pdfIconBox}>
                      <FileText size={24} color="#DC2626" />
                    </View>
                  )}

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText size="sm" weight="semibold" style={{ color: colors.text }} numberOfLines={1}>
                      {receiptFileName || 'Attached Receipt'}
                    </AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <View
                        style={[
                          styles.receiptBadge,
                          { backgroundColor: receiptFileType === 'image' ? '#EFF6FF' : '#FEF2F2' },
                        ]}
                      >
                        <AppText
                          size="xs"
                          weight="bold"
                          style={{ color: receiptFileType === 'image' ? '#1D4ED8' : '#DC2626' }}
                        >
                          {receiptFileType === 'image' ? 'IMAGE / PHOTO' : 'DOCUMENT / PDF'}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {receiptFileType === 'image' && (
                      <TouchableOpacity
                        style={[styles.receiptActionBtn, { backgroundColor: '#F1F5F9', marginRight: 8 }]}
                        onPress={() => setPreviewModalVisible(true)}
                        accessibilityLabel="Preview Receipt"
                      >
                        <Eye size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.receiptActionBtn, { backgroundColor: '#FEE2E2' }]}
                      onPress={handleRemoveReceipt}
                      accessibilityLabel="Remove Receipt"
                    >
                      <Trash2 size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.uploadDottedBox,
                  { borderColor: colors.primary[400] || '#93C5FD', backgroundColor: colors.surface },
                ]}
                onPress={handlePickReceipt}
                activeOpacity={0.7}
              >
                <View style={[styles.uploadIconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Camera size={22} color={colors.primary[600]} />
                </View>
                <AppText size="sm" weight="bold" style={{ color: colors.text, marginTop: 8 }}>
                  Attach Receipt / Bill
                </AppText>
                <AppText size="xs" style={{ color: colors.textTertiary, marginTop: 2, textAlign: 'center' }}>
                  Camera photo, gallery image, or PDF document
                </AppText>
                <View
                  style={[
                    styles.uploadPillBtn,
                    { backgroundColor: colors.primary[50], borderColor: colors.primary[200] },
                  ]}
                >
                  <Paperclip size={13} color={colors.primary[700]} />
                  <AppText size="xs" weight="bold" style={{ color: colors.primary[700], marginLeft: 6 }}>
                    Upload Receipt
                  </AppText>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Notes */}
          <View style={styles.formField}>
            <AppText size="xs" weight="bold" style={styles.formLabel}>
              Notes
            </AppText>
            <TextInput
              style={[styles.inputBox, styles.multilineInput, { color: colors.text, borderColor: colors.border }]}
              value={detailedDescription}
              onChangeText={setDetailedDescription}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Buttons Row */}
        <View style={styles.actionsBtnRow}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title={saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Submit Claim'}
            onPress={handleSave}
            disabled={saving}
            style={{ flex: 1.5, marginLeft: 8, backgroundColor: colors.primary[600] }}
          />
        </View>
      </ScrollView>

      {/* ========================================================
          PICKER MODAL: EXPENSE CATEGORY
      ======================================================== */}
      <Modal visible={categoryPickerOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryPickerOpen(false)}
        >
          <View style={[styles.selectBox, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
            <View style={styles.selectHeader}>
              <Tag size={18} color={colors.primary[600]} />
              <Heading level="h4" style={{ marginLeft: 8, flex: 1, color: colors.text }}>
                Select Category
              </Heading>
              <TouchableOpacity onPress={() => setCategoryPickerOpen(false)}>
                <X size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 12, maxHeight: 380 }}>
              {STANDARD_EXPENSE_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.selectOption,
                    selectedCategory === category && { backgroundColor: '#EEF2FF', borderColor: colors.primary[600] },
                  ]}
                  onPress={() => {
                    setSelectedCategory(category);
                    setCategoryPickerOpen(false);
                  }}
                >
                  <AppText
                    size="sm"
                    weight={selectedCategory === category ? 'bold' : 'regular'}
                    style={{ color: selectedCategory === category ? colors.primary[700] : colors.text, flex: 1 }}
                  >
                    {category}
                  </AppText>
                  {selectedCategory === category && <Check size={18} color={colors.primary[600]} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========================================================
          PICKER MODAL: PAYMENT METHOD
      ======================================================== */}
      <Modal visible={paymentTypePickerOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPaymentTypePickerOpen(false)}
        >
          <View style={[styles.selectBox, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
            <View style={styles.selectHeader}>
              <DollarSign size={18} color={colors.primary[600]} />
              <Heading level="h4" style={{ marginLeft: 8, flex: 1, color: colors.text }}>
                Select Payment Method
              </Heading>
              <TouchableOpacity onPress={() => setPaymentTypePickerOpen(false)}>
                <X size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 12 }}>
              {STANDARD_EXPENSE_PAYMENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.selectOption,
                    selectedPaymentType === type && { backgroundColor: '#EEF2FF', borderColor: colors.primary[600] },
                  ]}
                  onPress={() => {
                    setSelectedPaymentType(type);
                    setPaymentTypePickerOpen(false);
                  }}
                >
                  <AppText
                    size="sm"
                    weight={selectedPaymentType === type ? 'bold' : 'regular'}
                    style={{ color: selectedPaymentType === type ? colors.primary[700] : colors.text, flex: 1 }}
                  >
                    {type}
                  </AppText>
                  {selectedPaymentType === type && <Check size={18} color={colors.primary[600]} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========================================================
          FULLSCREEN RECEIPT PREVIEW MODAL
      ======================================================== */}
      <Modal visible={previewModalVisible} transparent animationType="fade">
        <View style={styles.imagePreviewOverlay}>
          <TouchableOpacity
            style={styles.closePreviewBtn}
            onPress={() => setPreviewModalVisible(false)}
          >
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          {receiptPhotoUri && (
            <Image
              source={{ uri: receiptPhotoUri }}
              style={styles.fullscreenReceiptImage}
              resizeMode="contain"
            />
          )}
          <AppText size="xs" style={{ color: '#E2E8F0', marginTop: 12, textAlign: 'center' }}>
            {receiptFileName || 'Receipt Attachment'}
          </AppText>
        </View>
      </Modal>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  supervisorFeedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  formSectionContainer: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  receiptCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  receiptCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbWrapper: {
    position: 'relative',
  },
  receiptThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  thumbZoomIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    padding: 2,
  },
  pdfIconBox: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  receiptActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadDottedBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  closePreviewBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  fullscreenReceiptImage: {
    width: '100%',
    height: '75%',
  },
  attachDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  receiptCompactBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  receiptTinyThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  pdfIconWrapSmall: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeReceiptBtn: {
    padding: 8,
  },
  formField: {
    marginBottom: 14,
  },
  formLabel: {
    color: '#334155',
    marginBottom: 6,
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  boldInput: {
    fontWeight: 'bold',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  inputInner: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  amountsRow: {
    flexDirection: 'row',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  vehicleExplanationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 6,
  },
  actionsBtnRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  selectBox: {
    padding: 16,
    marginHorizontal: 10,
  },
  selectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
});
