import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { useTheme } from '../../../providers/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { useGuardStore } from '../../../store/useGuardStore';

export interface PayslipItem {
  id: string;
  monthYear: string;
  payDate: string;
  grossPay: string;
  deductions: string;
  netPay: string;
  status: 'Paid' | 'Processing';
  baseSalary: string;
  overtimePay: string;
  allowance: string;
  pfDeduction: string;
  taxDeduction: string;
}

export const mockPayslips: PayslipItem[] = [
  {
    id: 'pay-2026-07',
    monthYear: 'July 2026',
    payDate: 'Aug 01, 2026',
    grossPay: '₹28,500',
    deductions: '₹2,100',
    netPay: '₹26,400',
    status: 'Paid',
    baseSalary: '₹22,000',
    overtimePay: '₹4,500',
    allowance: '₹2,000',
    pfDeduction: '₹1,500',
    taxDeduction: '₹600',
  },
  {
    id: 'pay-2026-06',
    monthYear: 'June 2026',
    payDate: 'Jul 01, 2026',
    grossPay: '₹27,800',
    deductions: '₹2,000',
    netPay: '₹25,800',
    status: 'Paid',
    baseSalary: '₹22,000',
    overtimePay: '₹3,800',
    allowance: '₹2,000',
    pfDeduction: '₹1,400',
    taxDeduction: '₹600',
  },
  {
    id: 'pay-2026-05',
    monthYear: 'May 2026',
    payDate: 'Jun 01, 2026',
    grossPay: '₹26,500',
    deductions: '₹1,900',
    netPay: '₹24,600',
    status: 'Paid',
    baseSalary: '₹22,000',
    overtimePay: '₹2,500',
    allowance: '₹2,000',
    pfDeduction: '₹1,300',
    taxDeduction: '₹600',
  },
];

export const PayslipsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { guardName, guardId } = useGuardStore();

  return (
    <ScreenLayout activeRoute="Payslips">
      <PageHeader title="My Payslips" showBack />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Guard Info Card */}
        <Card style={styles.guardHeaderCard}>
          <View style={styles.guardRow}>
            <View style={styles.avatar}>
              <AppText style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>
                {guardName ? guardName.charAt(0).toUpperCase() : 'G'}
              </AppText>
            </View>
            <View style={{ flex: 1 }}>
              <Heading level="h4" color="primary">{guardName || 'John Smith'}</Heading>
              <AppText size="xs" color="secondary">{guardId || 'G-1001'} • Security Officer</AppText>
            </View>
            <View style={styles.payrollBadge}>
              <AppText size="xs" weight="bold" style={{ color: '#10B981' }}>● Payroll Active</AppText>
            </View>
          </View>
        </Card>

        <Heading level="h4" style={styles.sectionTitle}>Recent Pay Statements</Heading>

        {mockPayslips.map((slip) => (
          <TouchableOpacity
            key={slip.id}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PayslipDetails', { payslipId: slip.id })}
          >
            <Card style={styles.payslipCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Heading level="h3" color="primary">{slip.monthYear}</Heading>
                  <AppText size="xs" color="secondary">Pay Date: {slip.payDate}</AppText>
                </View>
                <View style={styles.paidTag}>
                  <AppText size="xs" weight="bold" style={{ color: '#10B981' }}>{slip.status}</AppText>
                </View>
              </View>

              <View style={styles.payGrid}>
                <View style={styles.payBox}>
                  <AppText size="xs" color="secondary">Gross Pay</AppText>
                  <AppText size="sm" weight="semibold" color="primary">{slip.grossPay}</AppText>
                </View>

                <View style={styles.payBox}>
                  <AppText size="xs" color="secondary">Deductions</AppText>
                  <AppText size="sm" weight="semibold" style={{ color: '#EF4444' }}>{slip.deductions}</AppText>
                </View>

                <View style={styles.payBox}>
                  <AppText size="xs" color="secondary">Net Pay</AppText>
                  <AppText size="base" weight="bold" style={{ color: '#4F46E5' }}>{slip.netPay}</AppText>
                </View>
              </View>

              <View style={styles.viewRow}>
                <AppText size="sm" weight="bold" color="primary">View Payslip Statement</AppText>
                <AppText size="sm" color="primary"> ›</AppText>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  guardHeaderCard: {
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
  },
  guardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payrollBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  payslipCard: {
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  paidTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  payGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  payBox: {
    alignItems: 'flex-start',
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
