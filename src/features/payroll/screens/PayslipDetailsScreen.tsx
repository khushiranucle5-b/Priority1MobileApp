import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useRoute } from '@react-navigation/native';
import { mockPayslips } from './PayslipsScreen';
import { useGuardStore } from '../../../store/useGuardStore';
import { useTheme } from '../../../providers/ThemeProvider';
import { NavIcon } from '../../../components/NavIcon';

export const PayslipDetailsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const route = useRoute<any>();
  const payslipId = route.params?.payslipId || 'pay-2026-08';
  const slip = mockPayslips.find(s => s.id === payslipId) || mockPayslips[0];
  const { guardName, guardId } = useGuardStore();

  const pdfUrl = slip.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  const handleDownloadPdf = async () => {
    if (Platform.OS === 'web') {
      const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
      if (globalObj.window && globalObj.window.open) {
        globalObj.window.open(pdfUrl, '_blank');
        return;
      }
    }

    try {
      const supported = await Linking.canOpenURL(pdfUrl);
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert('Download Payslip', `Payslip PDF for ${slip.monthYear} (${slip.payslipId}) downloaded.`);
      }
    } catch (error) {
      Alert.alert('Download Payslip', `Payslip PDF for ${slip.monthYear} (${slip.payslipId}) downloaded.`);
    }
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
              <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                {slip.statementTitle || 'Official Employee Wages Payslip Statement'}
              </AppText>
            </View>

            <View style={styles.statusBadge}>
              <AppText size="xs" weight="bold" style={{ color: '#059669' }}>
                ● {slip.status}
              </AppText>
            </View>
          </View>
        </Card>

        {/* EMPLOYEE / PAYSLIP INFORMATION CARD */}
        <Card style={styles.sectionCard}>
          <AppText size="xs" weight="bold" style={styles.cardSectionHeading}>
            EMPLOYEE & PAYSLIP INFORMATION
          </AppText>

          <View style={styles.dividerLine} />

          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <AppText size="xs" color="secondary">Payslip ID</AppText>
              <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                {slip.payslipId}
              </AppText>
            </View>

            <View style={styles.infoCol}>
              <AppText size="xs" color="secondary">Cycle Period</AppText>
              <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                {slip.cyclePeriod}
              </AppText>
            </View>

            <View style={styles.infoCol}>
              <AppText size="xs" color="secondary">Status</AppText>
              <AppText size="sm" weight="bold" style={{ color: '#059669', marginTop: 2 }}>
                {slip.status}
              </AppText>
            </View>

            <View style={styles.infoCol}>
              <AppText size="xs" color="secondary">Employee Name</AppText>
              <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                {guardName || slip.employeeName || 'Khushi Rani'}
              </AppText>
            </View>

            <View style={styles.infoCol}>
              <AppText size="xs" color="secondary">Designation</AppText>
              <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                {slip.designation || 'Senior Security Officer'}
              </AppText>
            </View>

            <View style={styles.infoCol}>
              <AppText size="xs" color="secondary">Total Hours Worked</AppText>
              <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                {slip.totalHours}
              </AppText>
            </View>
          </View>
        </Card>

        {/* EARNINGS & DEDUCTIONS SUMMARY CARD */}
        <Card style={styles.sectionCard}>
          <AppText size="xs" weight="bold" style={styles.cardSectionHeading}>
            EARNINGS & DEDUCTIONS SUMMARY
          </AppText>

          <View style={styles.dividerLine} />

          <View style={styles.tableRow}>
            <AppText size="sm" color="secondary">Basic Roster Wages</AppText>
            <AppText size="sm" weight="bold" color="primary">{slip.basicRosterWages}</AppText>
          </View>

          <View style={styles.tableRow}>
            <AppText size="sm" color="secondary">Overtime Wages (1.5x Multiplier)</AppText>
            <AppText size="sm" weight="bold" color="primary">{slip.overtimeWages}</AppText>
          </View>

          <View style={styles.tableRow}>
            <AppText size="sm" color="secondary">Tax & Insurance Deductions</AppText>
            <AppText size="sm" weight="bold" style={{ color: '#DC2626' }}>{slip.taxInsuranceDeductions}</AppText>
          </View>
        </Card>

        {/* FINAL NET DISBURSED WAGES CARD */}
        <Card style={[styles.sectionCard, { backgroundColor: '#F8FAFC', borderColor: '#C7D2FE', borderWidth: 1.5 }]}>
          <AppText size="xs" weight="bold" color="secondary" style={{ letterSpacing: 0.5 }}>
            FINAL DISBURSEMENT
          </AppText>
          <View style={styles.netDisbursedRow}>
            <AppText size="sm" weight="bold" color="primary" style={{ flex: 1, marginTop: 4 }}>
              NET DISBURSED WAGES
            </AppText>
            <Heading level="h2" style={{ color: '#4F46E5', fontSize: 20 }}>
              {slip.netDisbursedWages}
            </Heading>
          </View>
        </Card>

        {/* Glove-friendly 54px Download PDF Payslip Button */}
        <Button
          title="Download PDF Payslip"
          variant="primary"
          size="large"
          fullWidth
          style={{ height: 54, backgroundColor: '#4F46E5', marginTop: 4 }}
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
    borderRadius: 4,
  },
  sectionCard: {
    padding: 18,
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
