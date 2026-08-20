import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useAuthStore } from '../../../store/useAuthStore';
import { updateRow, DBEmployee } from '../../../services/db';
import { Button } from '../../../components/Button';

export const ProfileSettingsScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { user, checkSession } = useAuthStore();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const updates: Partial<DBEmployee> = { name };
      if (phone) updates.phone = phone;

      const result = await updateRow<DBEmployee>('employees', user.id, updates);
      
      if (result) {
        await checkSession();
        Alert.alert('Success', 'Profile updated successfully', [
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
            value={user?.email || ''}
            editable={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label} color="secondary">Phone Number</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            placeholderTextColor={colors.secondary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={{ marginTop: spacing.xl }}>
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  readOnly: {
    opacity: 0.7,
  }
});
