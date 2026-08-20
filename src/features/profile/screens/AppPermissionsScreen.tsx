import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { Button } from '../../../components/Button';

export const AppPermissionsScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  return (
    <ScreenLayout>
      <PageHeader title="App Permissions" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <AppText size="lg" weight="bold" style={styles.title}>Required Permissions</AppText>
          
          <View style={styles.detailRow}>
            <AppText weight="medium">Location (GPS)</AppText>
            <AppText color="secondary" style={styles.descText}>Used for attendance and patrol geofencing.</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText weight="medium">Camera</AppText>
            <AppText color="secondary" style={styles.descText}>Used for incident reporting and selfie clock-ins.</AppText>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <AppText weight="medium">Notifications</AppText>
            <AppText color="secondary" style={styles.descText}>Used for shift reminders and urgent broadcast messages.</AppText>
          </View>

          <View style={{ marginTop: 24, width: '100%' }}>
            <Button title="Manage in Device Settings" onPress={() => Linking.openSettings()} variant="primary" />
          </View>
        </View>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  title: {
    marginBottom: 20,
  },
  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  descText: {
    marginTop: 4,
    fontSize: 13,
  }
});
