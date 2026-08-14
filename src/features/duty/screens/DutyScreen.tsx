import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import {
  DutyStatusCard,
  ClientInformationCard,
  SiteInformationCard,
  ShiftDetailsCard,
  SupervisorCard,
  DutyInstructionsCard,
  EquipmentCard,
  EmergencyContactsCard,
  AdditionalNotesCard,
  EmptyDutyState
} from '../components';

export const DutyScreen: React.FC = () => {
  // Mock state to toggle empty state vs populated state
  const [hasDuty] = useState(true);

  return (
    <ScreenLayout>
      <PageHeader title="Today's Duty" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hasDuty ? (
          <>
            <DutyStatusCard />
            <ClientInformationCard />
            <SiteInformationCard />
            <ShiftDetailsCard />
            <SupervisorCard />
            <DutyInstructionsCard />
            <EquipmentCard />
            <EmergencyContactsCard />
            <AdditionalNotesCard />
          </>
        ) : (
          <EmptyDutyState />
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
});
