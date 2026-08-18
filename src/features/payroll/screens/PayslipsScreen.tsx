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
import { NavIcon } from '../../../components/NavIcon';

export interface PayslipItem {
  id: string;
  companyName: string;
  statementTitle: string;
  payslipId: string;
  monthYear: string;
  cyclePeriod: string;
  status: string;
  employeeName?: string;
  designation: string;
  totalHours: string;
  basicRosterWages: string;
  overtimeWages: string;
  taxInsuranceDeductions: string;
  netDisbursedWages: string;
  pdfUrl?: string;
}

export const mockPayslips: PayslipItem[] = [
  {
    id: 'pay-2026-08',
    companyName: 'ACME SECURITY SERVICES',
    statementTitle: 'Official Employee Wages Payslip Statement',
    payslipId: 'PAY-2026-08',
    monthYear: 'August 2026',
    cyclePeriod: 'Aug 01, 2026 - Aug 31, 2026',
    status: 'Disbursed & Finalized',
    designation: 'Senior Security Officer',
    totalHours: '176 hrs',
    basicRosterWages: '₹24,000.00',
    overtimeWages: '₹4,500.00',
    taxInsuranceDeductions: '₹2,500.00',
    netDisbursedWages: '₹26,000.00',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'pay-2026-07',
    companyName: 'ACME SECURITY SERVICES',
    statementTitle: 'Official Employee Wages Payslip Statement',
    payslipId: 'PAY-2026-07',
    monthYear: 'July 2026',
    cyclePeriod: 'Jul 01, 2026 - Jul 31, 2026',
    status: 'Disbursed & Finalized',
    designation: 'Senior Security Officer',
    totalHours: '168 hrs',
    basicRosterWages: '₹22,000.00',
    overtimeWages: '₹4,500.00',
    taxInsuranceDeductions: '₹2,100.00',
    netDisbursedWages: '₹24,400.00',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'pay-2026-06',
    companyName: 'ACME SECURITY SERVICES',
    statementTitle: 'Official Employee Wages Payslip Statement',
    payslipId: 'PAY-2026-06',
    monthYear: 'June 2026',
    cyclePeriod: 'Jun 01, 2026 - Jun 30, 2026',
    status: 'Disbursed & Finalized',
    designation: 'Senior Security Officer',
    totalHours: '160 hrs',
    basicRosterWages: '₹22,000.00',
    overtimeWages: '₹3,800.00',
    taxInsuranceDeductions: '₹2,000.00',
    netDisbursedWages: '₹23,800.00',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
];

export const PayslipsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { guardName, guardId, assignedSite } = useGuardStore();

  return (
    <ScreenLayout activeRoute="Payslips">
      <PageHeader title="My Payslips" showBack />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Employee Identity Summary Header */}
        <Card style={styles.guardHeaderCard}>
          <View style={styles.guardRow}>
            <View style={styles.avatar}>
              <NavIcon name="payslips" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Heading level="h4" color="primary">{guardName || 'Khushi Rani'}</Heading>
              <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                {guardId || 'GRD-1024'} • Senior Security Officer
              </AppText>
            </View>
            <View style={styles.payrollBadge}>
              <AppText size="xs" weight="bold" style={{ color: '#059669' }}>● Payroll Active</AppText>
            </View>
          </View>
        </Card>

        <Heading level="h4" style={styles.sectionTitle}>Pay Statements ({mockPayslips.length})</Heading>

        {mockPayslips.map((slip) => (
          <TouchableOpacity
            key={slip.id}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PayslipDetails', { payslipId: slip.id })}
          >
            <Card style={styles.payslipCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Heading level="h3" color="primary">{slip.monthYear}</Heading>
                  <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                    ID: {slip.payslipId} • {slip.cyclePeriod}
                  </AppText>
                </View>

                <View style={styles.paidTag}>
                  <AppText size="xs" weight="bold" style={{ color: '#059669' }}>
                    ● {slip.status}
                  </AppText>
                </View>
              </View>

              <View style={styles.payGrid}>
                <View style={styles.payBox}>
                  <AppText size="xs" color="secondary">Basic Wages</AppText>
                  <AppText size="sm" weight="bold" color="primary">{slip.basicRosterWages}</AppText>
                </View>

                <View style={styles.payBox}>
                  <AppText size="xs" color="secondary">Overtime (1.5x)</AppText>
                  <AppText size="sm" weight="bold" color="primary">{slip.overtimeWages}</AppText>
                </View>

                <View style={styles.payBox}>
                  <AppText size="xs" color="secondary">Net Disbursed</AppText>
                  <AppText size="base" weight="bold" style={{ color: '#4F46E5' }}>{slip.netDisbursedWages}</AppText>
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payrollBadge: {
    backgroundColor: '#D1FAE5',
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
    backgroundColor: '#D1FAE5',
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
