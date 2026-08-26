import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useRoute } from '@react-navigation/native';
import { getPayslipById } from '../services/payslipService';
import { downloadPayslipPdf } from '../services/payslipPdfGenerator';
import { useGuardStore } from '../../../store/useGuardStore';
import { useTheme } from '../../../providers/ThemeProvider';
import { NavIcon } from '../../../components/NavIcon';

export const PayslipDetailsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const route = useRoute<any>();
  const payslipId = route.params?.payslipId || 'pay-2026-08';
  const { guardName, guardId } = useGuardStore();
  const slip = getPayslipById(payslipId, { guardName, guardId });

  const handleDownloadPdf = async () => {
    await downloadPayslipPdf(slip);
  };

  return (
    <ScreenLayout activeRoute="Payslips">
      <PageHeader title="Payslip Statement" showBack />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* HEADER SECTION CARD */}
        <Card style={styles.headerCard}>
          <View style={styles.companyHeaderRow}>
            <View style={{ flex: 1 }}>
              <Heading level="h2" color="primary">{slip.companyName || 'ACME SECURITY SERVICES'}</Heading>
              <AppText size="sm" color="secondary" style={{ marginTop: 4 }}>
                {slip.statementTitle || 'Official Employee Wages Payslip Statement'}
              </AppText>
            </View>

            <View style={styles.statusBadge}>
              <AppText size="sm" weight="bold" style={{ color: '#059669' }}>
                ● {slip.status}
              </AppText>
            </View>
          </View>
        </Card>

        {/* EMPLOYEE / PAYSLIP INFORMATION CARD */}
        <Card style={styles.sectionCard}>
          <AppText size="sm" weight="bold" style={styles.cardSectionHeading}>
            EMPLOYEE & PAYSLIP INFORMATION
          </AppText>

          <View style={styles.dividerLine} />

          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <AppText size="sm" color="secondary">Payslip ID</AppText>
              <AppText size="base" weight="bold" color="primary" style={{ marginTop: 3 }}>
                {slip.payslipId}
              </AppText>
            </View>

            <View style={styles.infoCol}>
              <AppText size="sm" color="secondary">Cycle Period</AppText>
              <AppText size="base" weight="bold" color="primary" style={{ marginTop: 3 }}>
                {slip.cyclePeriod}
              </AppText>
            </View>

            <View style={styles.infoCol}>
              <AppText size="sm" color="secondary">Status</AppText>
              <AppText size="base" weight="bold" style={{ color: '#059669', marginTop: 3 }}>
                {slip.status}
              </AppText>
            </View>

            <View style={styles.infoCol}>
              <AppText size="sm" color="secondary">Employee Name</AppText>
              <AppText size="base" weight="bold" color="primary" style={{ marginTop: 3 }}>
                {guardName || slip.employeeName || 'Khushi Rani'}
              </AppText>
            </View>

            <View style={styles.infoCol}>
              <AppText size="sm" color="secondary">Designation</AppText>
              <AppText size="base" weight="bold" color="primary" style={{ marginTop: 3 }}>
                {slip.designation || 'Senior Security Officer'}
              </AppText>
            </View>

            <View style={styles.infoCol}>
              <AppText size="sm" color="secondary">Total Hours Worked</AppText>
              <AppText size="base" weight="bold" color="primary" style={{ marginTop: 3 }}>
                {slip.totalHours}
              </AppText>
            </View>
          </View>
        </Card>

        {/* EARNINGS & DEDUCTIONS SUMMARY CARD */}
        <Card style={styles.sectionCard}>
          <AppText size="sm" weight="bold" style={styles.cardSectionHeading}>
            EARNINGS & DEDUCTIONS SUMMARY
          </AppText>

          <View style={styles.dividerLine} />

          <View style={styles.tableRow}>
            <AppText size="base" color="secondary">Basic Roster Wages</AppText>
            <AppText size="base" weight="bold" color="primary">{slip.basicRosterWages}</AppText>
          </View>

          <View style={styles.tableRow}>
            <AppText size="base" color="secondary">Overtime Wages (1.5x Multiplier)</AppText>
            <AppText size="base" weight="bold" color="primary">{slip.overtimeWages}</AppText>
          </View>

          <View style={styles.tableRow}>
            <AppText size="base" color="secondary">Tax & Insurance Deductions</AppText>
            <AppText size="base" weight="bold" style={{ color: '#DC2626' }}>{slip.taxInsuranceDeductions}</AppText>
          </View>
        </Card>

        {/* FINAL NET DISBURSED WAGES CARD */}
        <Card style={[styles.sectionCard, { backgroundColor: '#F8FAFC', borderColor: '#C7D2FE', borderWidth: 1.5, borderRadius: 12 }]}>
          <AppText size="sm" weight="bold" color="secondary" style={{ letterSpacing: 0.5 }}>
            FINAL DISBURSEMENT
          </AppText>
          <View style={styles.netDisbursedRow}>
            <AppText size="base" weight="bold" color="primary" style={{ flex: 1, marginTop: 4 }}>
              NET DISBURSED WAGES
            </AppText>
            <Heading level="h2" style={{ color: '#4F46E5', fontSize: 24 }}>
              {slip.netDisbursedWages}
            </Heading>
          </View>
        </Card>

        {/* Download PDF Payslip Button */}
        <Button
          title="Download PDF Payslip"
          variant="primary"
          size="medium"
          fullWidth
          leftIcon={<NavIcon name="download" size={20} color="#FFFFFF" />}
          style={{ backgroundColor: '#4F46E5', marginTop: 4 }}
          onPress={handleDownloadPdf}
        />

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  headerCard: {
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  companyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  sectionCard: {
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  cardSectionHeading: {
    color: '#64748B',
    letterSpacing: 0.5,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14,
  },
  infoCol: {
    width: '50%',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  netDisbursedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
});
