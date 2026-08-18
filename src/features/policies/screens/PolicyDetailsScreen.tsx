import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { useRoute } from '@react-navigation/native';
import { mockPolicies } from './PoliciesScreen';

export const PolicyDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const policyId = route.params?.policyId || 'p-1';
  const policy = mockPolicies.find(p => p.id === policyId) || mockPolicies[0];

  return (
    <ScreenLayout activeRoute="Policies">
      <PageHeader title={policy.category} showBack />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Heading level="h3" color="primary">{policy.title}</Heading>
          <AppText size="xs" color="secondary" style={styles.updatedText}>
            Last Revised: {policy.updatedDate} • Priority One Compliance
          </AppText>

          <View style={styles.divider} />

          <Heading level="h4" style={styles.sectionHeader}>Policy Overview</Heading>
          <AppText size="sm" color="secondary" style={styles.summaryText}>
            {policy.summary}
          </AppText>

          <Heading level="h4" style={styles.sectionHeader}>Mandatory Directives & Rules</Heading>
          {policy.content.map((rule, idx) => (
            <View key={idx} style={styles.ruleItem}>
              <AppText size="sm" color="primary" style={styles.ruleText}>
                {rule}
              </AppText>
            </View>
          ))}
        </Card>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 20,
  },
  updatedText: {
    marginTop: 6,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 8,
  },
  summaryText: {
    lineHeight: 20,
    marginBottom: 16,
  },
  ruleItem: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
  },
  ruleText: {
    lineHeight: 20,
  },
});
