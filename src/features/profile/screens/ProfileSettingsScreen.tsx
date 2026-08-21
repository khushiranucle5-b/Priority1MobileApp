import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useAuthStore } from '../../../store/useAuthStore';
import { useGuardStore } from '../../../store/useGuardStore';
import { updateRow, DBEmployee } from '../../../services/db';
import { Button } from '../../../components/Button';

export const ProfileSettingsScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { user, checkSession } = useAuthStore();
  const guardStore = useGuardStore();

  const [name, setName] = useState(guardStore.guardName || user?.name || '');
  const [phone, setPhone] = useState(guardStore.phone || '');
  const [address, setAddress] = useState(guardStore.address || '');
  const [emergencyContactName, setEmergencyContactName] = useState(guardStore.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(guardStore.emergencyContactPhone || '');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState(guardStore.emergencyContactRelation || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(guardStore.guardName || user?.name || '');
    setPhone(guardStore.phone || '');
    setAddress(guardStore.address || '');
    setEmergencyContactName(guardStore.emergencyContactName || '');
    setEmergencyContactPhone(guardStore.emergencyContactPhone || '');
    setEmergencyContactRelation(guardStore.emergencyContactRelation || '');
  }, [guardStore.guardName, guardStore.phone, guardStore.address, guardStore.emergencyContactName, guardStore.emergencyContactPhone, guardStore.emergencyContactRelation, user]);

  const handleSave = async () => {
    const empId = user?.id || guardStore.guardId;
    if (!empId) {
      Alert.alert('Error', 'No logged in user session found');
      return;
    }
    
    setIsLoading(true);
    try {
      const updates: Partial<DBEmployee> = {
        name,
        phone,
        address,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation,
      };

      const result = await updateRow<DBEmployee>('employees', empId, updates);
      
      if (result) {
        await checkSession();
        if (guardStore.loadGuardData && user?.email) {
          await guardStore.loadGuardData(empId, user.email);
        }
        Alert.alert('Success', 'Profile information updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error('Failed to update employee record');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <PageHeader title="Profile Settings" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        <Heading level="h4" color="secondary" style={styles.sectionHeader}>PERSONAL DETAILS</Heading>

        <View style={styles.inputGroup}>
          <AppText style={styles.label} color="secondary">Full Name</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
            placeholderTextColor={colors.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label} color="secondary">Email Address (Read-only)</AppText>
          <TextInput
            style={[styles.input, styles.readOnly, { backgroundColor: colors.background, color: colors.secondary, borderColor: colors.border, borderRadius: borderRadius.md }]}
            value={user?.email || guardStore.guardEmail || ''}
            editable={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label} color="secondary">Mobile Number</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter mobile phone number"
            placeholderTextColor={colors.secondary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label} color="secondary">Address</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md }]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter residential address"
            placeholderTextColor={colors.secondary}
          />
        </View>

        <Heading level="h4" color="secondary" style={[styles.sectionHeader, { marginTop: spacing.lg }]}>EMERGENCY CONTACT</Heading>

        <View style={styles.inputGroup}>
          <AppText style={styles.label} color="secondary">Contact Name</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md }]}
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
            placeholder="Enter emergency contact name"
            placeholderTextColor={colors.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label} color="secondary">Contact Phone</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md }]}
            value={emergencyContactPhone}
            onChangeText={setEmergencyContactPhone}
            placeholder="Enter emergency contact phone"
            placeholderTextColor={colors.secondary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label} color="secondary">Relationship</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md }]}
            value={emergencyContactRelation}
            onChangeText={setEmergencyContactRelation}
            placeholder="e.g. Spouse, Parent, Brother"
            placeholderTextColor={colors.secondary}
          />
        </View>

        <View style={{ marginTop: spacing.xl, marginBottom: 20 }}>
          <Button title={isLoading ? "Saving..." : "Save Changes"} onPress={handleSave} disabled={isLoading} />
        </View>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  readOnly: {
    opacity: 0.7,
  }
});
