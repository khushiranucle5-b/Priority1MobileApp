import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useRoute } from '@react-navigation/native';
import { mockPayslips } from './PayslipsScreen';
import { useGuardStore } from '../../../store/useGuardStore';

export const PayslipDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const payslipId = route.params?.payslipId || 'pay-2026-07';
  const slip = mockPayslips.find(s => s.id === payslipId) || mockPayslips[0];
  const { guardName, guardId, assignedSite } = useGuardStore();

  const handleDownload = () => {
    Alert.alert('Download Payslip', `Payslip for ${slip.monthYear} downloaded successfully.`);
  };

  return (
    <ScreenLayout activeRoute="Payslips">
      <PageHeader title={`Payslip - ${slip.monthYear}`} showBack />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Main Payslip Document Card */}
        <Card style={styles.documentCard}>
          <View style={styles.companyHeader}>
            <Heading level="h3" color="primary">Priority One Security</Heading>
            <AppText size="xs" color="secondary">Official Salary Statement</AppText>
          </View>

          <View style={styles.divider} />

          {/* Guard Details Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <AppText size="xs" color="secondary">Employee Name</AppText>
              <AppText size="sm" weight="bold" color="primary">{guardName || 'John Smith'}</AppText>
            </View>
            <View style={styles.infoBox}>
              <AppText size="xs" color="secondary">Employee ID</AppText>
              <AppText size="sm" weight="bold" color="primary">{guardId || 'G-1001'}</AppText>
            </View>
            <View style={styles.infoBox}>
              <AppText size="xs" color="secondary">Designation</AppText>
              <AppText size="sm" weight="bold" color="primary">Security Officer</AppText>
            </View>
            <View style={styles.infoBox}>
              <AppText size="xs" color="secondary">Site</AppText>
              <AppText size="sm" weight="bold" color="primary">{assignedSite || 'Ahmedabad Plant'}</AppText>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Earnings Breakdown */}
          <Heading level="h4" style={styles.sectionHeader}>Earnings</Heading>
          
          <View style={styles.row}>
            <AppText size="sm" color="secondary">Basic Salary</AppText>
            <AppText size="sm" weight="semibold" color="primary">{slip.baseSalary}</AppText>
          </View>

          <View style={styles.row}>
            <AppText size="sm" color="secondary">Overtime Earnings</AppText>
            <AppText size="sm" weight="semibold" color="primary">{slip.overtimePay}</AppText>
          </View>

          <View style={styles.row}>
            <AppText size="sm" color="secondary">Shift & Special Allowance</AppText>
            <AppText size="sm" weight="semibold" color="primary">{slip.allowance}</AppText>
          </View>

          <View style={[styles.subtotalRow, { backgroundColor: '#ECFDF5' }]}>
            <AppText size="sm" weight="bold" style={{ color: '#065F46' }}>Gross Earnings</AppText>
            <AppText size="sm" weight="bold" style={{ color: '#065F46' }}>{slip.grossPay}</AppText>
          </View>

          {/* Deductions Breakdown */}
          <Heading level="h4" style={[styles.sectionHeader, { marginTop: 16 }]}>Deductions</Heading>

          <View style={styles.row}>
            <AppText size="sm" color="secondary">Provident Fund (PF)</AppText>
            <AppText size="sm" weight="semibold" style={{ color: '#EF4444' }}>{slip.pfDeduction}</AppText>
          </View>

          <View style={styles.row}>
            <AppText size="sm" color="secondary">Tax Deducted (TDS)</AppText>
            <AppText size="sm" weight="semibold" style={{ color: '#EF4444' }}>{slip.taxDeduction}</AppText>
          </View>

          <View style={[styles.subtotalRow, { backgroundColor: '#FEF2F2' }]}>
            <AppText size="sm" weight="bold" style={{ color: '#991B1B' }}>Total Deductions</AppText>
            <AppText size="sm" weight="bold" style={{ color: '#991B1B' }}>{slip.deductions}</AppText>
          </View>

          <View style={styles.divider} />

          {/* Net Amount Summary */}
          <View style={styles.netRow}>
            <View>
              <Heading level="h3" color="primary">Net Payable Salary</Heading>
              <AppText size="xs" color="secondary">Disbursed on {slip.payDate}</AppText>
            </View>
            <Heading level="h2" style={{ color: '#4F46E5' }}>{slip.netPay}</Heading>
          </View>

          <Button
            title="📥 Download PDF Payslip"
            variant="primary"
            size="medium"
            fullWidth
            style={{ marginTop: 20 }}
            onPress={handleDownload}
          />
        </Card>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  documentCard: {
    padding: 20,
  },
  companyHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  infoBox: {
    width: '50%',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 6,
    marginVertical: 8,
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
});
