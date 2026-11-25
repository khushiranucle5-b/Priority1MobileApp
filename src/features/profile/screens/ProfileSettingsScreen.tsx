import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  ChevronDown,
  Calendar as CalendarIcon,
  Check,
  X,
} from 'lucide-react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useAuthStore } from '../../../store/useAuthStore';
import { useGuardStore } from '../../../store/useGuardStore';
import { updateRow, DBEmployee } from '../../../services/db';
import { Button } from '../../../components/Button';
import {
  CountryCode,
  parsePhoneWithCountry,
} from '../../../constants/countryCodes';
import { CountryCodePickerModal } from '../../../components/CountryCodePickerModal';
import { CalendarPickerModal } from '../../../components/CalendarPickerModal';
import { typography } from '../../../theme/tokens/typography';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const ProfileSettingsScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { user, checkSession } = useAuthStore();
  const guardStore = useGuardStore();

  const initialParsed = parsePhoneWithCountry(guardStore.phone);
  const [profilePic, setProfilePic] = useState(guardStore.profilePic || 'https://i.pravatar.cc/150?img=11');
  const [name, setName] = useState(guardStore.guardName || user?.name || '');
  const [country, setCountry] = useState<CountryCode>(initialParsed.country);
  const [phone, setPhone] = useState(initialParsed.digits.slice(0, 10));
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);

  const [dateOfBirth, setDateOfBirth] = useState(guardStore.dateOfBirth || '');
  const [dobModalVisible, setDobModalVisible] = useState(false);

  const [gender, setGender] = useState(guardStore.gender || '');
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  const [bloodGroup, setBloodGroup] = useState(guardStore.bloodGroup || '');
  const [bloodGroupModalVisible, setBloodGroupModalVisible] = useState(false);

  const [address, setAddress] = useState(guardStore.address || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setProfilePic(guardStore.profilePic || 'https://i.pravatar.cc/150?img=11');
    setName(guardStore.guardName || user?.name || '');
    const parsed = parsePhoneWithCountry(guardStore.phone);
    setCountry(parsed.country);
    setPhone(parsed.digits.slice(0, 10));
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
    user,
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

    // 1. Mandatory Full Name
    const cleanName = name.trim();
    if (!cleanName) {
      Alert.alert('Required Field', 'Please enter your Full Name.');
      return;
    }

    // 2. Mandatory Mobile Number (Strictly 10 digits)
    const cleanPhone = phone.replace(/\D/g, '').trim();
    if (!cleanPhone) {
      Alert.alert('Required Field', 'Please enter your 10-digit mobile number.');
      return;
    }
    if (cleanPhone.length !== 10) {
      Alert.alert(
        'Invalid Mobile Number',
        `Mobile number must be exactly 10 digits (currently ${cleanPhone.length} digits). Please enter a 10-digit number.`
      );
      return;
    }
    const fullPhone = `${country.dialCode} ${cleanPhone}`;

    // 3. Mandatory Date of Birth
    const cleanDob = dateOfBirth.trim();
    if (!cleanDob) {
      Alert.alert('Required Field', 'Please select your Date of Birth.');
      return;
    }

    // 4. Mandatory Gender
    const cleanGender = gender.trim();
    if (!cleanGender) {
      Alert.alert('Required Field', 'Please select your Gender.');
      return;
    }

    // 5. Mandatory Blood Group
    const cleanBloodGroup = bloodGroup.trim();
    if (!cleanBloodGroup) {
      Alert.alert('Required Field', 'Please select your Blood Group.');
      return;
    }

    // 6. Mandatory Address
    const cleanAddress = address.trim();
    if (!cleanAddress) {
      Alert.alert('Required Field', 'Please enter your residential Address.');
      return;
    }

    setIsLoading(true);
    try {
      const updates: Partial<DBEmployee> = {
        name: cleanName,
        phone: fullPhone,
        dateOfBirth: cleanDob,
        gender: cleanGender,
        bloodGroup: cleanBloodGroup,
        address: cleanAddress,
        profilePic,
      };

      const result = await updateRow<DBEmployee>('employees', empId, updates);

      if (result) {
        useGuardStore.setState({
          guardName: cleanName,
          phone: fullPhone,
          dateOfBirth: cleanDob,
          gender: cleanGender,
          bloodGroup: cleanBloodGroup,
          address: cleanAddress,
          profilePic,
        });

        if (user) {
          useAuthStore.setState({
            user: {
              ...user,
              name: cleanName,
            },
          });
        }

        await checkSession();
        if (guardStore.loadGuardData && user?.email) {
          await guardStore.loadGuardData(empId, user.email);
        }
        Alert.alert('Success', 'Personal information updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
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
            style={[styles.avatarPreview, { borderColor: colors.primary[600] }]}
          />
          <TouchableOpacity
            style={[styles.changePhotoBtn, { backgroundColor: colors.primary[600] }]}
            onPress={handleSelectPhoto}
            activeOpacity={0.8}
          >
            <AppText size="base" weight="bold" style={[styles.changePhotoText, { color: colors.surface }]}>
              Change Photo
            </AppText>
          </TouchableOpacity>
        </View>

        <AppText style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          PERSONAL INFORMATION
        </AppText>

        {/* 1. Full Name (Mandatory) */}
        <View style={styles.inputGroup}>
          <AppText style={styles.label}>
            Full Name <AppText style={styles.requiredStar}>*</AppText>
          </AppText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: name.trim() ? colors.border : '#EF4444',
                borderRadius: borderRadius.md,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
            placeholderTextColor={colors.secondary}
          />
        </View>

        {/* 2. Mobile Number (Mandatory, strictly 10 digits) */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <AppText style={styles.label}>
              Mobile Number <AppText style={styles.requiredStar}>*</AppText>
            </AppText>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCountryPickerVisible(true)}
              style={styles.labelCountryBtn}
            >
              <AppText style={[styles.labelCountryText, { color: colors.primary[600] }]}>
                {country.flag} {country.name} ({country.dialCode}) ▾
              </AppText>
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.phoneInputWrap,
              {
                backgroundColor: colors.surface,
                borderColor: phone.length === 10 ? '#16A34A' : colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCountryPickerVisible(true)}
              style={[styles.countryCodePickerBtn, { borderRightColor: colors.border }]}
            >
              <AppText style={styles.countryFlagText}>{country.flag}</AppText>
              <AppText style={[styles.countryDialText, { color: colors.text }]}>{country.dialCode}</AppText>
              <ChevronDown size={14} color={colors.secondary} />
            </TouchableOpacity>
            <TextInput
              style={[styles.phoneInputBox, { color: colors.text }]}
              value={phone}
              onChangeText={(val) => setPhone(val.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              placeholderTextColor={colors.secondary}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <View style={styles.phoneDigitsBadge}>
              <AppText
                size="xs"
                weight="bold"
                style={{ color: phone.length === 10 ? '#16A34A' : colors.secondary }}
              >
                {phone.length}/10
              </AppText>
            </View>
          </View>
        </View>

        {/* 3. Email Address (Read-only) */}
        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Email Address (Read-only)</AppText>
          <TextInput
            style={[
              styles.input,
              styles.readOnly,
              {
                backgroundColor: colors.background,
                color: colors.secondary,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
            value={user?.email || guardStore.guardEmail || ''}
            editable={false}
          />
        </View>

        {/* 4. Date of Birth (Mandatory, with Interactive Calendar Picker) */}
        <View style={styles.inputGroup}>
          <AppText style={styles.label}>
            Date of Birth <AppText style={styles.requiredStar}>*</AppText>
          </AppText>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setDobModalVisible(true)}
            style={[
              styles.simpleDropdownTrigger,
              {
                backgroundColor: colors.surface,
                borderColor: dateOfBirth ? colors.border : '#EF4444',
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <AppText
              style={[
                styles.simpleDropdownText,
                {
                  color: dateOfBirth ? colors.text : colors.secondary,
                },
              ]}
            >
              {dateOfBirth || 'Select Date of Birth'}
            </AppText>
            <CalendarIcon size={18} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* 5. Gender (Mandatory, Normal Simple Dropdown) */}
        <View style={styles.inputGroup}>
          <AppText style={styles.label}>
            Gender <AppText style={styles.requiredStar}>*</AppText>
          </AppText>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setGenderModalVisible(true)}
            style={[
              styles.simpleDropdownTrigger,
              {
                backgroundColor: colors.surface,
                borderColor: gender ? colors.border : '#EF4444',
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <AppText
              style={[
                styles.simpleDropdownText,
                {
                  color: gender ? colors.text : colors.secondary,
                },
              ]}
            >
              {gender || 'Select Gender'}
            </AppText>
            <ChevronDown size={18} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* 6. Blood Group (Mandatory, Normal Simple Dropdown) */}
        <View style={styles.inputGroup}>
          <AppText style={styles.label}>
            Blood Group <AppText style={styles.requiredStar}>*</AppText>
          </AppText>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setBloodGroupModalVisible(true)}
            style={[
              styles.simpleDropdownTrigger,
              {
                backgroundColor: colors.surface,
                borderColor: bloodGroup ? colors.border : '#EF4444',
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <AppText
              style={[
                styles.simpleDropdownText,
                {
                  color: bloodGroup ? colors.text : colors.secondary,
                },
              ]}
            >
              {bloodGroup || 'Select Blood Group'}
            </AppText>
            <ChevronDown size={18} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* 7. Residential Address (Mandatory) */}
        <View style={styles.inputGroup}>
          <AppText style={styles.label}>
            Address <AppText style={styles.requiredStar}>*</AppText>
          </AppText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: address.trim() ? colors.border : '#EF4444',
                borderRadius: borderRadius.md,
                minHeight: 80,
                textAlignVertical: 'top',
              },
            ]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter residential address"
            placeholderTextColor={colors.secondary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Save Button */}
        <View style={{ marginTop: spacing.xl, marginBottom: 30 }}>
          <Button
            title={isLoading ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={isLoading}
            size="large"
            fullWidth
            style={{ minHeight: 60 }}
          />
        </View>
      </ScrollView>

      {/* Country Code Picker Modal */}
      <CountryCodePickerModal
        visible={countryPickerVisible}
        onClose={() => setCountryPickerVisible(false)}
        selectedDialCode={country.dialCode}
        onSelect={(selected) => setCountry(selected)}
      />

      {/* Date of Birth Calendar Picker Modal */}
      <CalendarPickerModal
        visible={dobModalVisible}
        onClose={() => setDobModalVisible(false)}
        initialDate={dateOfBirth}
        onSelectDate={(date) => setDateOfBirth(date)}
        title="Select Date of Birth"
      />

      {/* Gender Simple Dropdown Modal */}
      <Modal
        visible={genderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setGenderModalVisible(false)}
          />
          <View
            style={[
              styles.simpleModalCard,
              { backgroundColor: colors.surface, borderRadius: borderRadius.lg || 12 },
            ]}
          >
            <View style={[styles.simpleModalHeader, { borderBottomColor: colors.border }]}>
              <Heading level="h4" style={{ color: colors.text }}>
                Select Gender
              </Heading>
              <TouchableOpacity
                onPress={() => setGenderModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.simpleOptionsContainer}>
              {GENDER_OPTIONS.map((opt, index) => {
                const isSelected = gender === opt;
                const isLast = index === GENDER_OPTIONS.length - 1;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.simpleOptionItem,
                      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                      isSelected && { backgroundColor: '#EEF2FF' },
                    ]}
                    onPress={() => {
                      setGender(opt);
                      setGenderModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <AppText
                      size="base"
                      weight={isSelected ? 'bold' : 'regular'}
                      style={{ color: isSelected ? '#4F46E5' : colors.text, flex: 1 }}
                    >
                      {opt}
                    </AppText>
                    {isSelected && <Check size={18} color="#4F46E5" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Blood Group Simple Dropdown Modal */}
      <Modal
        visible={bloodGroupModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBloodGroupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setBloodGroupModalVisible(false)}
          />
          <View
            style={[
              styles.simpleModalCard,
              { backgroundColor: colors.surface, borderRadius: borderRadius.lg || 12 },
            ]}
          >
            <View style={[styles.simpleModalHeader, { borderBottomColor: colors.border }]}>
              <Heading level="h4" style={{ color: colors.text }}>
                Select Blood Group
              </Heading>
              <TouchableOpacity
                onPress={() => setBloodGroupModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }} bounces={false}>
              <View style={styles.simpleOptionsContainer}>
                {BLOOD_GROUPS.map((bg, index) => {
                  const isSelected = bloodGroup === bg;
                  const isLast = index === BLOOD_GROUPS.length - 1;
                  return (
                    <TouchableOpacity
                      key={bg}
                      style={[
                        styles.simpleOptionItem,
                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                        isSelected && { backgroundColor: '#EEF2FF' },
                      ]}
                      onPress={() => {
                        setBloodGroup(bg);
                        setBloodGroupModalVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <AppText
                        size="base"
                        weight={isSelected ? 'bold' : 'regular'}
                        style={{ color: isSelected ? '#4F46E5' : colors.text, flex: 1 }}
                      >
                        {bg}
                      </AppText>
                      {isSelected && <Check size={18} color="#4F46E5" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    marginBottom: 12,
  },
  changePhotoBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  changePhotoText: {
    ...typography.presets.label,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 14,
    ...typography.presets.sectionHeading,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelCountryBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  labelCountryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    marginBottom: 6,
    ...typography.presets.label,
  },
  requiredStar: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
    ...typography.presets.body,
    includeFontPadding: false,
  },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: 56,
    overflow: 'hidden',
  },
  countryCodePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    borderRightWidth: 1,
    gap: 4,
  },
  countryFlagText: {
    fontSize: 18,
  },
  countryDialText: {
    ...typography.presets.body,
    fontWeight: '700',
    marginRight: 2,
  },
  phoneInputBox: {
    flex: 1,
    paddingHorizontal: 14,
    minHeight: 56,
    ...typography.presets.body,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  phoneDigitsBadge: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  simpleDropdownText: {
    ...typography.presets.body,
    includeFontPadding: false,
  },
  readOnly: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  simpleModalCard: {
    width: '100%',
    maxWidth: 340,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  simpleModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  simpleOptionsContainer: {
    paddingVertical: 4,
  },
  simpleOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
});
