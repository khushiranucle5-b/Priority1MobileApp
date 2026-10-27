import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { visitorService } from '../services/visitor.service';
import { VehicleExpenseClaim, ExpenseStatus } from '../types/visitor.types';
import { formatAmountK } from './VehicleExpenseScreen';
import {
  Receipt,
  Car,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Edit2,
  Calendar,
  Building2,
  DollarSign,
  Tag,
  RotateCcw,
} from 'lucide-react-native';

export const ExpenseClaimDetailsScreen: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();

  const claimId = route.params?.claimId;
  const [claim, setClaim] = useState<VehicleExpenseClaim | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClaim = async () => {
      if (!claimId) return;
      try {
        const found = await visitorService.getExpenseClaimById(claimId);
        setClaim(found);
      } catch (e) {
        console.error('Failed to load claim details', e);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      loadClaim();
    }
  }, [claimId, isFocused]);

  const renderStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case 'Changes Requested by Supervisor':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }]}>
            <RotateCcw size={14} color="#1D4ED8" />
            <AppText size="xs" weight="bold" style={{ color: '#1D4ED8', marginLeft: 4 }}>
              CHANGES REQUESTED
            </AppText>
          </View>
        );
      case 'Approved':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7', borderColor: '#22C55E' }]}>
            <CheckCircle2 size={14} color="#15803D" />
            <AppText size="xs" weight="bold" style={{ color: '#15803D', marginLeft: 4 }}>
              APPROVED
            </AppText>
          </View>
        );
      case 'Rejected':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
            <AlertCircle size={14} color="#DC2626" />
            <AppText size="xs" weight="bold" style={{ color: '#DC2626', marginLeft: 4 }}>
              REJECTED
            </AppText>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <Clock size={14} color="#B45309" />
            <AppText size="xs" weight="bold" style={{ color: '#B45309', marginLeft: 4 }}>
              PENDING APPROVAL
            </AppText>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <ScreenLayout activeRoute="VehicleExpense">
        <PageHeader title="Expense Claim Details" showBack={true} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </View>
      </ScreenLayout>
    );
  }

  if (!claim) {
    return (
      <ScreenLayout activeRoute="VehicleExpense">
        <PageHeader title="Expense Claim Details" showBack={true} />
        <View style={styles.centerContainer}>
          <Receipt size={48} color={colors.textTertiary} />
          <Heading level="h4" style={{ marginTop: 12 }}>Claim Not Found</Heading>
          <AppText size="sm" style={{ color: colors.textSecondary, marginTop: 4 }}>
            The requested expense claim could not be located.
          </AppText>
          <Button title="Back to Claims" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
        </View>
      </ScreenLayout>
    );
  }

  const canEdit = claim.status === 'Changes Requested by Supervisor';
  const totalAmt = claim.claimedAmount ?? claim.amount ?? 0;

  return (
    <ScreenLayout activeRoute="VehicleExpense">
      <PageHeader
        title={`Claim #${claim.id}`}
        showBack={true}
        onBack={() => navigation.navigate('VehicleExpense')}
        rightComponent={
          canEdit ? (
            <TouchableOpacity
              style={[styles.headerEditBtn, { borderColor: colors.primary[600], backgroundColor: colors.primary[50] }]}
              onPress={() => navigation.navigate('ExpenseClaimForm', { claimId: claim.id, isEditing: true })}
            >
              <Edit2 size={14} color={colors.primary[600]} />
              <AppText size="xs" weight="bold" style={{ color: colors.primary[600], marginLeft: 4 }}>
                Edit & Resubmit
              </AppText>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Highlight Card: Amount & Status */}
        <Card style={[styles.summaryCard, { borderColor: colors.border }]}>
          <View style={styles.summaryTopRow}>
            <View style={{ flex: 1 }}>
              <AppText size="xs" style={{ color: colors.textTertiary }}>TOTAL CLAIMED AMOUNT</AppText>
              <Heading level="h2" style={{ color: colors.primary[700], marginTop: 2 }}>
                {formatAmountK(totalAmt)}
              </Heading>
              {claim.salesTaxAmount !== undefined && (
                <AppText size="xs" style={{ color: colors.textSecondary, marginTop: 2 }}>
                  Includes ${claim.salesTaxAmount.toFixed(2)} Sales Tax
                </AppText>
              )}
            </View>
            {renderStatusBadge(claim.status)}
          </View>
        </Card>

        {/* Supervisor Change Request Banner */}
        {claim.supervisorNotes && (
          <View style={[styles.supervisorNotesBox, { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' }]}>
            <RotateCcw size={18} color="#1D4ED8" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <AppText size="xs" weight="bold" style={{ color: '#1D4ED8' }}>
                Supervisor Notes:
              </AppText>
              <AppText size="xs" style={{ color: '#1E40AF', marginTop: 2 }}>
                {claim.supervisorNotes}
              </AppText>
            </View>
          </View>
        )}

        {/* Expense Details */}
        <Card style={[styles.sectionCard, { borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Tag size={16} color={colors.primary[600]} />
            <Heading level="h4" style={{ color: colors.text, marginLeft: 8 }}>
              Expense Details
            </Heading>
          </View>

          <View style={styles.infoRow}>
            <AppText size="xs" style={styles.infoLabel}>Purpose:</AppText>
            <AppText size="sm" weight="semibold" style={[styles.infoValue, { color: colors.text }]}>
              {claim.businessPurpose || claim.remarks || 'Expense'}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText size="xs" style={styles.infoLabel}>Category:</AppText>
            <AppText size="xs" weight="bold" style={[styles.infoValue, { color: colors.primary[600] }]}>
              {claim.expenseCategory || 'General'}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText size="xs" style={styles.infoLabel}>Payment Method:</AppText>
            <AppText size="xs" style={[styles.infoValue, { color: colors.text }]}>
              {claim.expenseType || 'Employee Reimbursement'}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText size="xs" style={styles.infoLabel}>Merchant / Vendor:</AppText>
            <AppText size="xs" weight="semibold" style={[styles.infoValue, { color: colors.text }]}>
              {claim.merchantName || 'Vendor'}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText size="xs" style={styles.infoLabel}>Date:</AppText>
            <AppText size="xs" style={[styles.infoValue, { color: colors.text }]}>
              {claim.expenseDate || new Date(claim.dateTime).toLocaleDateString()}
            </AppText>
          </View>

          {claim.detailedDescription && (
            <View style={styles.descriptionRow}>
              <AppText size="xs" style={styles.infoLabel}>Notes:</AppText>
              <AppText size="xs" style={[styles.descriptionContent, { color: colors.textSecondary }]}>
                {claim.detailedDescription}
              </AppText>
            </View>
          )}
        </Card>

        {/* Supervisor Approval Sign-Off */}
        {claim.approvedBy && (
          <View style={[styles.approvedNotice, { backgroundColor: '#DCFCE7', borderColor: '#22C55E' }]}>
            <CheckCircle2 size={18} color="#15803D" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <AppText size="xs" weight="bold" style={{ color: '#15803D' }}>
                Approved by {claim.approvedBy.userName}
              </AppText>
              <AppText size="xs" style={{ color: '#166534', marginTop: 2 }}>
                Approved on {new Date(claim.approvedBy.at).toLocaleString()}
              </AppText>
            </View>
          </View>
        )}

        {/* Bottom Actions */}
        <View style={styles.bottomButtonsRow}>
          <Button
            title="Back to Claims"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{ flex: 1, marginRight: canEdit ? 8 : 0 }}
          />
          {canEdit && (
            <Button
              title="Edit & Resubmit"
              onPress={() => navigation.navigate('ExpenseClaimForm', { claimId: claim.id, isEditing: true })}
              style={{ flex: 1.5, marginLeft: 8, backgroundColor: colors.primary[600] }}
            />
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  sectionCard: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  vehicleCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    color: '#64748B',
    flex: 1,
  },
  infoValue: {
    flex: 1.5,
    textAlign: 'right',
  },
  descriptionRow: {
    paddingTop: 8,
  },
  descriptionContent: {
    marginTop: 4,
    lineHeight: 18,
  },
  receiptContainer: {
    alignItems: 'center',
    marginTop: 6,
  },
  receiptImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  approvedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  supervisorNotesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
  },
});
