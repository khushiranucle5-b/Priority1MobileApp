import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import {
  ProfileHeaderCard,
  PersonalInformationCard,
  EmploymentInformationCard,
  EmergencyContactCard,
  SettingsSection,
  DocumentsSummaryCard,
  ApplicationInformationCard,
  LogoutSection,
  EmptyProfileState
} from '../components';

export const ProfileScreen: React.FC = () => {
  // Mock state to toggle empty state vs populated state
  const [hasProfile] = useState(true);

  return (
    <ScreenLayout>
      <PageHeader title="My Profile" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hasProfile ? (
          <>
            <ProfileHeaderCard />
            <PersonalInformationCard />
            <EmploymentInformationCard />
            <EmergencyContactCard />
            <SettingsSection />
            <DocumentsSummaryCard />
            <ApplicationInformationCard />
            <LogoutSection />
          </>
        ) : (
          <EmptyProfileState />
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
