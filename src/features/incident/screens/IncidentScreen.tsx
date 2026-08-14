import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { IncidentForm } from '../components/IncidentForm';
import { IncidentHistory } from '../components/IncidentHistory';

export const IncidentScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Report' | 'History'>('Report');
  const { colors, borderRadius } = useTheme();

  return (
    <ScreenLayout>
      <PageHeader title="Incident Report" />

      <View style={[styles.tabContainer, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Report' && { backgroundColor: colors.infoLight, borderRadius: borderRadius.md }]} 
          onPress={() => setActiveTab('Report')}
        >
          <AppText weight={activeTab === 'Report' ? 'bold' : 'medium'} color={activeTab === 'Report' ? 'primary' : 'secondary'}>Report Incident</AppText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'History' && { backgroundColor: colors.infoLight, borderRadius: borderRadius.md }]} 
          onPress={() => setActiveTab('History')}
        >
          <AppText weight={activeTab === 'History' ? 'bold' : 'medium'} color={activeTab === 'History' ? 'primary' : 'secondary'}>Report History</AppText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'Report' ? <IncidentForm /> : <IncidentHistory />}
      </ScrollView>
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
    paddingVertical: 10,
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  }
});
