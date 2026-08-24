import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText } from '../../../components/typography/Text';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import {
  ProfileHeaderCard,
  PersonalInformationCard,
  EmploymentInformationCard,
  EmergencyContactCard,
  DocumentsSummaryCard,
  ApplicationInformationCard,
  LogoutSection,
  EmptyProfileState
} from '../components';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  // Mock state to toggle empty state vs populated state
  const [hasProfile] = useState(true);

  return (
    <ScreenLayout>
      <PageHeader
        title="My Profile"
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.gearButton}>
            <AppText style={styles.gearIcon}>⚙️</AppText>
          </TouchableOpacity>
        }
      />
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
            <DocumentsSummaryCard />
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
  gearButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearIcon: {
    fontSize: 28,
  }
});
