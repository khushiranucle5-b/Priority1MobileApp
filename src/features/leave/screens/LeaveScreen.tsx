import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { LeaveBalanceCard } from '../components/LeaveBalanceCard';
import { LeaveForm } from '../components/LeaveForm';
import { LeaveHistory } from '../components/LeaveHistory';

export const LeaveScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Apply' | 'History'>('Apply');
  const { colors, borderRadius } = useTheme();

  return (
    <ScreenLayout>
      <PageHeader title="Leave Management" showBack />
      
      <LeaveBalanceCard />

      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Apply' && { backgroundColor: colors.primary[50], borderRadius: borderRadius.md }]} 
          onPress={() => setActiveTab('Apply')}
        >
          <AppText weight={activeTab === 'Apply' ? 'bold' : 'medium'} color={activeTab === 'Apply' ? 'primary' : 'secondary'}>Apply Leave</AppText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'History' && { backgroundColor: colors.primary[50], borderRadius: borderRadius.md }]} 
          onPress={() => setActiveTab('History')}
        >
          <AppText weight={activeTab === 'History' ? 'bold' : 'medium'} color={activeTab === 'History' ? 'primary' : 'secondary'}>My Leave History</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'Apply' ? <LeaveForm /> : <LeaveHistory />}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  }
});
