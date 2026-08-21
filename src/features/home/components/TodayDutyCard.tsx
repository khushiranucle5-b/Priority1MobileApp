import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { StatusBadge } from '../../../components/StatusBadge';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';

export const TodayDutyCard: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { todayShift, assignedSite } = useGuardStore();

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Duty')}>
      <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
        <View style={styles.header}>
          <Heading level="h3" color="primary" style={styles.headerTitle}>TODAY'S DUTY</Heading>
          <StatusBadge status={todayShift ? todayShift.status : 'Off Duty'} size="md" />
        </View>

        <View style={styles.divider} />
        
        {todayShift ? (
          <View style={styles.details}>
            <View style={styles.itemRow}>
              <NavIcon name="shifts" size={24} color={colors.primary[600] || '#2563eb'} />
              <AppText size="lg" weight="bold" color="primary" style={styles.valueText}>
                {todayShift.title || 'Morning Shift'}
              </AppText>
            </View>

            <View style={styles.itemRow}>
              <NavIcon name="sites" size={24} color={colors.textSecondary || '#64748b'} />
              <AppText size="lg" weight="bold" color="primary" style={styles.valueText}>
                {todayShift.site || assignedSite || 'Ahmedabad Plant'}
              </AppText>
            </View>

            <View style={styles.itemRow}>
              <NavIcon name="attendance" size={24} color={colors.primary[600] || '#2563eb'} />
              <AppText size="lg" weight="bold" style={[styles.valueText, { color: colors.primary[600] || '#2563eb' }]}>
                {todayShift.startTime || '08:00 AM'} – {todayShift.endTime || '04:00 PM'}
              </AppText>
            </View>
          </View>
        ) : (
          <View style={styles.details}>
            <AppText size="lg" color="secondary" weight="semibold" style={styles.valueText}>
              No active shift scheduled for today.
            </AppText>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  details: {
    gap: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
