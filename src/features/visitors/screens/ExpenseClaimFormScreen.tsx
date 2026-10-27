import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
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
} from 'lucide-react-native';

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
      });

      setSaving(false);

      if (res.success && res.claim) {
        Alert.alert('Claim Updated', `Expense claim ${res.claim.id} updated successfully.`, [
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
