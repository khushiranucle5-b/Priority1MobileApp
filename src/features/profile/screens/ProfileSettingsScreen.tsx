import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Alert, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useAuthStore } from '../../../store/useAuthStore';
import { useGuardStore } from '../../../store/useGuardStore';
import { updateRow, DBEmployee } from '../../../services/db';
import { Button } from '../../../components/Button';

import { typography } from '../../../theme/tokens/typography';

export const ProfileSettingsScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { user, checkSession } = useAuthStore();
  const guardStore = useGuardStore();

  const [profilePic, setProfilePic] = useState(guardStore.profilePic || 'https://i.pravatar.cc/150?img=11');
  const [name, setName] = useState(guardStore.guardName || user?.name || '');
  const [phone, setPhone] = useState(guardStore.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(guardStore.dateOfBirth || '');
  const [gender, setGender] = useState(guardStore.gender || '');
  const [bloodGroup, setBloodGroup] = useState(guardStore.bloodGroup || '');
  const [address, setAddress] = useState(guardStore.address || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setProfilePic(guardStore.profilePic || 'https://i.pravatar.cc/150?img=11');
    setName(guardStore.guardName || user?.name || '');
    setPhone(guardStore.phone || '');
    setDateOfBirth(guardStore.dateOfBirth || 'Oct 12, 1990');
    setGender(guardStore.gender || 'Male');
    setBloodGroup(guardStore.bloodGroup || 'O+');
    setAddress(guardStore.address || '');
  }, [
    guardStore.profilePic,
    guardStore.guardName,
    guardStore.phone,
    guardStore.dateOfBirth,
    guardStore.gender,
    guardStore.bloodGroup,
    guardStore.address,
    user
  ]);

  const handleSelectPhoto = () => {
    Alert.alert(
      'Update Profile Picture',
      'Choose an option to update your profile photo',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              const res = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: true });
              if (res.assets && res.assets[0]?.uri) {
                const newUri = res.assets[0].uri;
                setProfilePic(newUri);
                await autoSaveProfilePic(newUri);
              }
            } catch (e) {
              Alert.alert('Error', 'Failed to access camera.');
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
              if (res.assets && res.assets[0]?.uri) {
                const newUri = res.assets[0].uri;
                setProfilePic(newUri);
                await autoSaveProfilePic(newUri);
              }
            } catch (e) {
              Alert.alert('Error', 'Failed to access photo gallery.');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const autoSaveProfilePic = async (newPicUri: string) => {
    const empId = user?.id || guardStore.guardId;
    if (!empId) return;
    try {
      const result = await updateRow<DBEmployee>('employees', empId, { profilePic: newPicUri });
      if (result) {
        useGuardStore.setState({ profilePic: newPicUri });
        if (guardStore.loadGuardData && user?.email) {
          await guardStore.loadGuardData(empId, user.email);
        }
      }
    } catch (e) {
      console.error('Failed to auto-save profile pic', e);
    }
  };

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
        dateOfBirth,
        gender,
        bloodGroup,
        address,
        profilePic,
      };

      const result = await updateRow<DBEmployee>('employees', empId, updates);
      
      if (result) {
        useGuardStore.setState({
          guardName: name,
          phone,
          dateOfBirth,
          gender,
          bloodGroup,
          address,
          profilePic,
        });

        if (user) {
          useAuthStore.setState({
            user: {
              ...user,
              name,
            },
          });
        }

        await checkSession();
        if (guardStore.loadGuardData && user?.email) {
          await guardStore.loadGuardData(empId, user.email);
        }
        Alert.alert('Success', 'Personal information updated successfully', [
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
        
        {/* Profile Picture Edit Section */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: profilePic || 'https://i.pravatar.cc/150?img=11' }}
            style={styles.avatarPreview}
          />
          <TouchableOpacity style={styles.changePhotoBtn} onPress={handleSelectPhoto} activeOpacity={0.8}>
            <AppText size="base" weight="bold" style={styles.changePhotoText}>Change Photo</AppText>
          </TouchableOpacity>
        </View>

        <AppText style={styles.sectionHeader}>PERSONAL INFORMATION</AppText>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Full Name</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
            placeholderTextColor={colors.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Mobile Number</AppText>
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
          <AppText style={styles.label}>Email Address (Read-only)</AppText>
          <TextInput
            style={[styles.input, styles.readOnly, { backgroundColor: colors.background, color: colors.secondary, borderColor: colors.border, borderRadius: borderRadius.md }]}
            value={user?.email || guardStore.guardEmail || ''}
            editable={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Date of Birth</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md }]}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="e.g. Oct 12, 1990"
            placeholderTextColor={colors.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Gender</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md }]}
            value={gender}
            onChangeText={setGender}
            placeholder="e.g. Male, Female, Other"
            placeholderTextColor={colors.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Blood Group</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md }]}
            value={bloodGroup}
            onChangeText={setBloodGroup}
            placeholder="e.g. O+, A+, B+, AB+"
            placeholderTextColor={colors.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Address</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: borderRadius.md }]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter residential address"
            placeholderTextColor={colors.secondary}
            multiline
          />
        </View>

        <View style={{ marginTop: spacing.xl, marginBottom: 30 }}>
          <Button title={isLoading ? "Saving..." : "Save Changes"} onPress={handleSave} disabled={isLoading} size="large" fullWidth style={{ minHeight: 60 }} />
        </View>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#2563EB',
    marginBottom: 12,
  },
  changePhotoBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  changePhotoText: {
    color: '#FFFFFF',
    ...typography.presets.label,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 14,
    ...typography.presets.sectionHeading,
    color: '#475569',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    ...typography.presets.label,
    color: '#334155',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
    ...typography.presets.body,
    includeFontPadding: false,
  },
  readOnly: {
    opacity: 0.7,
  }
});
