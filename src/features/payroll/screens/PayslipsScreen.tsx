import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { useTheme } from '../../../providers/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { useGuardStore } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';

import { getPayslipList, ExtendedPayslipItem } from '../services/payslipService';
import { downloadPayslipPdf } from '../services/payslipPdfGenerator';

export type PayslipItem = ExtendedPayslipItem;
export const mockPayslips = getPayslipList();

export const PayslipsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { guardName, guardId, assignedSite } = useGuardStore();

  const payslips = getPayslipList({ guardName, guardId });

  const handleDownloadPdf = async (slip: ExtendedPayslipItem) => {
    await downloadPayslipPdf(slip);
  };

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

        <Heading level="h4" style={styles.sectionTitle}>Pay Statements ({payslips.length})</Heading>

        {payslips.map((slip) => (
          <Card key={slip.id} style={styles.payslipCard}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('PayslipDetails', { payslipId: slip.id })}
            >
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
            </TouchableOpacity>

            <View style={styles.viewRow}>
              <TouchableOpacity
                style={styles.iconActionBtnView}
                onPress={() => navigation.navigate('PayslipDetails', { payslipId: slip.id })}
                activeOpacity={0.7}
                accessibilityLabel="View payslip details"
              >
                <NavIcon name="eye" size={24} color="#4F46E5" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickDownloadBtn}
                onPress={() => handleDownloadPdf(slip)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Download payslip PDF"
              >
                <NavIcon name="download" size={22} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </Card>
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
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 4,
  },
  iconActionBtnView: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickDownloadBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
