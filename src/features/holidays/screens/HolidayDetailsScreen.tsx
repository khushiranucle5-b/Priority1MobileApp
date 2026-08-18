import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { useRoute, useNavigation } from '@react-navigation/native';
import { mockHolidays, HolidayData } from './HolidaysScreen';
import { useTheme } from '../../../providers/ThemeProvider';

export const HolidayDetailsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const holidayId = route.params?.holidayId || '1';
  const holiday = mockHolidays.find((h: HolidayData) => h.id === holidayId) || mockHolidays[0];

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'Company Holiday':
        return { bg: '#EEF2FF', text: '#4F46E5' };
      case 'Festival Holiday':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'National Holiday':
        return { bg: '#E0E7FF', text: '#3730A3' };
      case 'Public':
      case 'Public Holiday':
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    return status === 'Past'
      ? { bg: '#F1F5F9', text: '#64748B' }
      : { bg: '#D1FAE5', text: '#059669' };
  };

  const typeColors = getTypeBadgeStyle(holiday.type);
  const statusColors = getStatusBadgeStyle(holiday.status);

  return (
    <ScreenLayout activeRoute="Holidays">
      <PageHeader title="View Holiday" showBack />
      
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Breadcrumb Row */}
        

        {/* Title Header */}
        <View style={styles.headerBlock}>
          <Heading level="h2" color="primary">View Holiday</Heading>
          <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
            View the details and configuration of the selected holiday.
          </AppText>
        </View>

        {/* HOLIDAY INFORMATION CARD */}
        <Card style={styles.infoCard}>
          <AppText size="xs" weight="bold" style={styles.cardSectionHeading}>
            HOLIDAY INFORMATION
          </AppText>

          <View style={styles.dividerLine} />

          <View style={styles.gridContainer}>
            {/* Row 1: Holiday Name & Date */}
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Holiday Name</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {holiday.name}
                </AppText>
              </View>

              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Date</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {holiday.dateStr}
                </AppText>
              </View>
            </View>

            {/* Row 2: Type & Status */}
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Type</AppText>
                <View style={[styles.badge, { backgroundColor: typeColors.bg }]}>
                  <AppText size="xs" weight="bold" style={{ color: typeColors.text }}>
                    {holiday.type}
                  </AppText>
                </View>
              </View>

              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Status</AppText>
                <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
                  <AppText size="xs" weight="bold" style={{ color: statusColors.text }}>
                    {holiday.status}
                  </AppText>
                </View>
              </View>
            </View>

            {/* Row 3: Holiday ID */}
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="xs" color="secondary">Holiday ID</AppText>
                <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {holiday.holidayCode}
                </AppText>
              </View>
            </View>
          </View>
        </Card>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerBlock: {
    marginBottom: 4,
  },
  infoCard: {
    padding: 20,
  },
  cardSectionHeading: {
    color: '#64748B',
    letterSpacing: 0.5,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  gridContainer: {
    gap: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCol: {
    width: '48%',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
});
