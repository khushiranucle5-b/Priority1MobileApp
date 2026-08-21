import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { LeaveBalanceCard } from '../components/LeaveBalanceCard';
import { LeaveForm } from '../components/LeaveForm';
import { LeaveHistory } from '../components/LeaveHistory';

import { LeaveRequest } from '../../../store/useGuardStore';

export const LeaveScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Apply' | 'History'>('Apply');
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);
  const { colors, borderRadius } = useTheme();

  const handleEditLeave = (leave: LeaveRequest) => {
    setEditingLeave(leave);
    setActiveTab('Apply');
  };

  const handleFinishedEdit = () => {
    setEditingLeave(null);
    setActiveTab('History');
  };

  return (
    <ScreenLayout>
      <PageHeader title="Leave Management" showBack />
      
      <LeaveBalanceCard />

      <View style={[styles.tabContainer, { backgroundColor: colors.surfaceSecondary || '#f1f5f9', borderRadius: borderRadius.lg }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Apply' && { backgroundColor: colors.primary[600] || '#2563eb', borderRadius: borderRadius.md }]} 
          onPress={() => setActiveTab('Apply')}
          activeOpacity={0.8}
        >
          <AppText size="base" weight="bold" style={{ color: activeTab === 'Apply' ? '#FFFFFF' : colors.textSecondary }}>
            {editingLeave ? 'EDIT LEAVE' : 'APPLY LEAVE'}
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'History' && { backgroundColor: colors.primary[600] || '#2563eb', borderRadius: borderRadius.md }]} 
          onPress={() => {
            setEditingLeave(null);
            setActiveTab('History');
          }}
          activeOpacity={0.8}
        >
          <AppText size="base" weight="bold" style={{ color: activeTab === 'History' ? '#FFFFFF' : colors.textSecondary }}>
            MY HISTORY
          </AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'Apply' ? (
          <LeaveForm editingLeave={editingLeave} onFinishedEdit={handleFinishedEdit} />
        ) : (
          <LeaveHistory onEditLeave={handleEditLeave} />
        )}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 6,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  tab: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  }
});
