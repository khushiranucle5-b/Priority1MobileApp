import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  visitorService,
  VISITOR_ID_TYPES,
} from '../services/visitor.service';
import {
  VisitorCategory,
  STANDARD_VISITOR_CATEGORIES,
  VISITOR_VEHICLE_TYPES,
  UnitResident,
  ResidentMember,
  VisitorProfile,
} from '../types/visitor.types';
import {
  User,
  Building2,
  Phone,
  Shield,
  ChevronDown,
  Camera,
  X,
  Tag,
  Check,
  Plus,
  Home,
  Users,
  Search,
  Sparkles,
  UserCheck,
  Car,
} from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export const RegisterVisitorScreen: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editVisitorId = route.params?.editVisitorId as string | undefined;
  const isEditMode = !!editVisitorId;
  const { guardName, guardId, assignedSite } = useGuardStore();

  // Core Visitor Form Fields
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [selectedVisitorInfo, setSelectedVisitorInfo] = useState<string | null>(null);

  // Category Dropdown
  const [category, setCategory] = useState<VisitorCategory>('Guest / General Visitor');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Destination / Flat & Resident Family Selection
  const [allUnits, setAllUnits] = useState<UnitResident[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string>('B');
  const [unitNumber, setUnitNumber] = useState('B-203');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  // Add new Block / Flat / Member states
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [newBlockInput, setNewBlockInput] = useState('');

  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [newUnitInput, setNewUnitInput] = useState('');
  const [newUnitOwnerInput, setNewUnitOwnerInput] = useState('');
  const [newUnitPhoneInput, setNewUnitPhoneInput] = useState('');

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('Owner');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [hostName, setHostName] = useState('');
  const [hostPhone, setHostPhone] = useState('');
  const [purpose, setPurpose] = useState('');

  // Modals for Destination Dropdowns
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);

  // ID Verification & Photo Capture
  const [idType, setIdType] = useState('NATIONAL_ID');
  const [idTypeModalVisible, setIdTypeModalVisible] = useState(false);
  const [idNumber, setIdNumber] = useState('');
  const [idPhotoUri, setIdPhotoUri] = useState<string | null>(null);

  // Vehicle Information
  const [hasVehicle, setHasVehicle] = useState(false);
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('4-Wheeler (Car / Sedan / SUV)');
  const [vehicleTypeModalVisible, setVehicleTypeModalVisible] = useState(false);

  // Repeat Visitor Matching State (Strictly by Mobile Number only!)
  const [allProfiles, setAllProfiles] = useState<VisitorProfile[]>([]);
  const [matchedProfiles, setMatchedProfiles] = useState<VisitorProfile[]>([]);

  const [loading, setLoading] = useState(false);

  // Load Units and Previous Visitor Profiles
  useEffect(() => {
    (async () => {
      try {
        const [unitsList, profilesList] = await Promise.all([
          visitorService.getUnits(),
          visitorService.getProfiles(),
        ]);
        setAllUnits(unitsList);
        setAllProfiles(profilesList);

        // Pre-select B-203 unit code if default
        const defaultUnit = unitsList.find((u) => u.unitNumber.toUpperCase() === 'B-203');
        if (defaultUnit && !editVisitorId) {
          setSelectedBlock('B');
          setUnitNumber(defaultUnit.unitNumber);
        }
      } catch (err) {
        console.error('Failed to load initial directory:', err);
      }
    })();
  }, [editVisitorId]);

  // Load visitor if editing
  useEffect(() => {
    if (editVisitorId) {
      (async () => {
        const v = await visitorService.getVisitorById(editVisitorId);
        if (v) {
          setVisitorName(v.visitorName);
          setVisitorPhone(v.visitorPhone ? v.visitorPhone.replace(/\D/g, '').slice(-10) : '');
          setCategory((v.category as VisitorCategory) || 'Guest / General Visitor');
          setUnitNumber(v.unitNumber || '');
          if (v.unitNumber && v.unitNumber.includes('-')) {
            setSelectedBlock(v.unitNumber.split('-')[0].toUpperCase());
          }
          setHostName(v.hostName || '');
          setHostPhone(v.hostPhone ? v.hostPhone.replace(/\D/g, '').slice(-10) : '');
          setPurpose(v.purpose || '');
          setIdType(v.idType === 'AADHAAR' ? 'NATIONAL_ID' : v.idType || 'NATIONAL_ID');
          setIdNumber(v.idNumber || '');
          setIdPhotoUri(v.idPhotoUri || null);
          setHasVehicle(!!v.hasVehicle);
          setVehiclePlateNumber(v.vehiclePlateNumber || '');
          setVehicleType(v.vehicleType || '4-Wheeler (Car / Sedan / SUV)');
        }
      })();
    }
  }, [editVisitorId]);

  // Dynamic list of all available blocks (A, B, C, D + any custom blocks)
  const availableBlocks = useMemo(() => {
    const set = new Set<string>();
    ['A', 'B', 'C', 'D'].forEach((b) => set.add(b));
    allUnits.forEach((u) => {
      if (u.block) {
        set.add(u.block.toUpperCase());
      } else if (u.unitNumber.includes('-')) {
        set.add(u.unitNumber.split('-')[0].toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [allUnits]);

  // When unitNumber changes, find current unit's residents
  const currentUnit = useMemo(() => {
    const clean = unitNumber.trim().toUpperCase();
    if (!clean) return null;
    return allUnits.find((u) => u.unitNumber.toUpperCase() === clean) || null;
  }, [unitNumber, allUnits]);

  // Filter units for the selected Block
  const availableUnitsForBlock = useMemo(() => {
    const blk = selectedBlock.toUpperCase();
    return allUnits.filter((u) => {
      if (u.block && u.block.toUpperCase() === blk) return true;
      if (u.unitNumber.toUpperCase().startsWith(`${blk}-`)) return true;
      return false;
    });
  }, [allUnits, selectedBlock]);

  // Find relation of selected member
  const selectedMemberRelation = useMemo(() => {
    if (!currentUnit || !currentUnit.members) return null;
    const m = currentUnit.members.find(
      (mem) => mem.id === selectedMemberId || mem.name.toLowerCase() === hostName.toLowerCase()
    );
    return m ? m.relation : null;
  }, [currentUnit, selectedMemberId, hostName]);

  // Block Selection Handler
  const handleSelectBlock = (blk: string) => {
    setSelectedBlock(blk);
    setBlockModalVisible(false);

    // Auto-select first flat in this block if available
    const blockUnits = allUnits.filter(
      (u) =>
        (u.block && u.block.toUpperCase() === blk.toUpperCase()) ||
        u.unitNumber.toUpperCase().startsWith(`${blk.toUpperCase()}-`)
    );

    if (blockUnits.length > 0) {
      handleSelectUnit(blockUnits[0].unitNumber);
    } else {
      setUnitNumber(`${blk}-101`);
      setSelectedMemberId('');
      setHostName('');
      setHostPhone('');
    }
  };

  // Unit / Flat Selection Handler
  const handleSelectUnit = (unitCode: string) => {
    setUnitNumber(unitCode);
    setUnitModalVisible(false);

    if (unitCode.includes('-')) {
      const blk = unitCode.split('-')[0].toUpperCase();
      setSelectedBlock(blk);
    }

    const found = allUnits.find((u) => u.unitNumber.toUpperCase() === unitCode.toUpperCase());
    if (found && found.members.length > 0) {
      const primary = found.members.find((m) => m.isPrimary) || found.members[0];
      setSelectedMemberId(primary.id);
      setHostName(primary.name);
      setHostPhone(primary.phone);
    } else {
      setSelectedMemberId('');
    }
  };

  // Family Member Selection Handler
  const handleSelectMember = (member: ResidentMember) => {
    setSelectedMemberId(member.id);
    setHostName(member.name);
    setHostPhone(member.phone);
    setMemberModalVisible(false);
  };

  // Add Custom Block Handler
  const handleAddCustomBlock = async () => {
    const blk = newBlockInput.trim().toUpperCase();
    if (!blk) {
      Alert.alert('Invalid Block', 'Please enter a block or wing name (e.g. E, F, Tower-1).');
      return;
    }
    const defaultUnitCode = `${blk}-101`;
    const newUnit: UnitResident = {
      unitNumber: defaultUnitCode,
      block: blk,
      ownerName: 'Resident',
      ownerPhone: '',
      members: [],
    };
    await visitorService.saveOrUpdateUnit(newUnit);
    const updated = await visitorService.getUnits();
    setAllUnits(updated);
    setSelectedBlock(blk);
    setUnitNumber(defaultUnitCode);
    setNewBlockInput('');
    setIsAddingBlock(false);
    setBlockModalVisible(false);
  };

  // Add Custom Unit / Flat Handler
  const handleAddCustomUnit = async () => {
    const rawNum = newUnitInput.trim().toUpperCase();
    if (!rawNum) {
      Alert.alert('Invalid Flat', 'Please enter a flat number (e.g. 501, 102).');
      return;
    }
    const formattedUnit = rawNum.includes('-') ? rawNum : `${selectedBlock.toUpperCase()}-${rawNum}`;
    const blk = formattedUnit.includes('-') ? formattedUnit.split('-')[0] : selectedBlock.toUpperCase();

    const owner = newUnitOwnerInput.trim() || 'Resident';
    const phone = newUnitPhoneInput.trim();

    const newUnit: UnitResident = {
      unitNumber: formattedUnit,
      block: blk,
      ownerName: owner,
      ownerPhone: phone,
      members: owner && owner !== 'Resident' ? [
        {
          id: `m-${Date.now()}`,
          name: owner,
          relation: 'Owner',
          phone: phone,
          isPrimary: true,
        }
      ] : [],
    };

    await visitorService.saveOrUpdateUnit(newUnit);
    const updated = await visitorService.getUnits();
    setAllUnits(updated);
    handleSelectUnit(formattedUnit);
    setNewUnitInput('');
    setNewUnitOwnerInput('');
    setNewUnitPhoneInput('');
    setIsAddingUnit(false);
    setUnitModalVisible(false);
  };

  // Add Custom Family Member Handler
  const handleAddCustomMember = async () => {
    const name = newMemberName.trim();
    if (!name) {
      Alert.alert('Required', 'Please enter resident full name.');
      return;
    }

    const cleanUnit = unitNumber.trim().toUpperCase();
    const existing = allUnits.find(u => u.unitNumber.toUpperCase() === cleanUnit);

    const newMem: ResidentMember = {
      id: `m-${Date.now()}`,
      name: name,
      relation: newMemberRelation || 'Resident',
      phone: newMemberPhone.trim(),
      isPrimary: !existing || !existing.members || existing.members.length === 0,
    };

    const targetUnit: UnitResident = existing ? {
      ...existing,
      ownerName: existing.ownerName || name,
      members: [...existing.members, newMem],
    } : {
      unitNumber: cleanUnit,
      block: selectedBlock.toUpperCase(),
      ownerName: name,
      ownerPhone: newMemberPhone.trim(),
      members: [newMem],
    };

    await visitorService.saveOrUpdateUnit(targetUnit);
    const updated = await visitorService.getUnits();
    setAllUnits(updated);
    handleSelectMember(newMem);
    setNewMemberName('');
    setNewMemberPhone('');
    setIsAddingMember(false);
    setMemberModalVisible(false);
  };

  // Search repeat visitors ONLY when mobile number is entered/typed (NOT for name!)
  useEffect(() => {
    const cleanPhone = visitorPhone.replace(/\D/g, '').trim();

    // Trigger suggestion list under mobile number when 2 or more digits are typed
    if (cleanPhone.length >= 2) {
      const matches = allProfiles.filter((p) => {
        const pPhone = (p.visitorPhone || '').replace(/\D/g, '');
        return pPhone.includes(cleanPhone);
      });
      setMatchedProfiles(matches.slice(0, 4));
    } else {
      setMatchedProfiles([]);
    }
  }, [visitorPhone, allProfiles]);

  // When user taps a visitor from the suggestions list under mobile number
  // Auto-fills only visitor identity; destination ("Where they want to go") remains completely unchanged!
  const handleSelectVisitorProfile = (prof: VisitorProfile) => {
    const cleanP = (prof.visitorPhone || '').replace(/\D/g, '').slice(-10);
    setVisitorPhone(cleanP);
    setVisitorName(prof.visitorName);
    if (prof.category) setCategory(prof.category as VisitorCategory);
    if (prof.idType) setIdType(prof.idType);
    if (prof.idNumber) setIdNumber(prof.idNumber);
    if (prof.idPhotoUri) setIdPhotoUri(prof.idPhotoUri);
    if (prof.hasVehicle) {
      setHasVehicle(true);
      setVehiclePlateNumber(prof.vehiclePlateNumber || '');
      setVehicleType(prof.vehicleType || '4-Wheeler (Car / Sedan / SUV)');
    }
    // Destination (block, flat, resident) is untouched!

    setMatchedProfiles([]);
    setSelectedVisitorInfo(`${prof.visitorName} (${cleanP})`);
  };

  // Camera / Gallery Photo Capture
  const handleCaptureIdPhoto = () => {
    Alert.alert('ID Proof Photo', 'Select capture source:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Camera',
        onPress: async () => {
          try {
            const res = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: true });
            if (res.assets && res.assets[0]?.uri) {
              setIdPhotoUri(res.assets[0].uri);
            }
          } catch (e) {
            Alert.alert('Error', 'Unable to access camera.');
          }
        },
      },
      {
        text: 'Gallery / Files',
        onPress: async () => {
          try {
            const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
            if (res.assets && res.assets[0]?.uri) {
              setIdPhotoUri(res.assets[0].uri);
            }
          } catch (e) {
            Alert.alert('Error', 'Unable to access photo library.');
          }
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    const cleanVisitorName = visitorName.trim();
    if (!cleanVisitorName) {
      Alert.alert('Required Field', 'Please enter the visitor full name (Compulsory).');
      return;
    }

    const cleanVisitorPhone = visitorPhone.replace(/\D/g, '').trim();
    if (!cleanVisitorPhone) {
      Alert.alert('Required Field', 'Please enter the visitor mobile number (Compulsory).');
      return;
    }
    if (cleanVisitorPhone.length !== 10) {
      Alert.alert('Invalid Mobile Number', 'Visitor mobile number must be exactly 10 digits.');
      return;
    }

    const cleanHostName = hostName.trim();
    if (!cleanHostName) {
      Alert.alert('Required Field', 'Please enter the name of the person to meet (Host Name).');
      return;
    }

    const cleanHostPhone = hostPhone.replace(/\D/g, '').trim();
    if (cleanHostPhone && cleanHostPhone.length !== 10) {
      Alert.alert('Invalid Mobile Number', 'Host mobile number must be exactly 10 digits.');
      return;
    }

    if (!purpose.trim()) {
      Alert.alert('Required Field', 'Please enter the visit purpose.');
      return;
    }

    if (hasVehicle && !vehiclePlateNumber.trim()) {
      Alert.alert('License Plate Required', 'Please enter the vehicle license plate.');
      return;
    }

    // Auto-persist new Unit & Resident Member into directory if entered by user
    try {
      const cleanUnit = unitNumber.trim().toUpperCase();
      const cleanBlock = selectedBlock.trim().toUpperCase() || (cleanUnit.includes('-') ? cleanUnit.split('-')[0] : 'A');
      const cleanHost = cleanHostName;
      
      const existingUnit = allUnits.find(u => u.unitNumber.toUpperCase() === cleanUnit);
      if (existingUnit) {
        const hasMember = existingUnit.members.some(m => m.name.toLowerCase() === cleanHost.toLowerCase());
        if (!hasMember && cleanHost) {
          const updatedUnit: UnitResident = {
            ...existingUnit,
            members: [
              ...existingUnit.members,
              {
                id: `m-${Date.now()}`,
                name: cleanHost,
                relation: 'Resident',
                phone: cleanHostPhone,
                isPrimary: false,
              }
            ]
          };
          await visitorService.saveOrUpdateUnit(updatedUnit);
        }
      } else {
        const newUnit: UnitResident = {
          unitNumber: cleanUnit,
          block: cleanBlock,
          ownerName: cleanHost || 'Resident',
          ownerPhone: cleanHostPhone,
          members: cleanHost ? [
            {
              id: `m-${Date.now()}`,
              name: cleanHost,
              relation: 'Resident',
              phone: cleanHostPhone,
              isPrimary: true,
            }
          ] : [],
        };
        await visitorService.saveOrUpdateUnit(newUnit);
      }
    } catch (e) {
      // Non-blocking
    }

    setLoading(true);

    if (isEditMode && editVisitorId) {
      const res = await visitorService.updateVisitor(editVisitorId, {
        visitorName: cleanVisitorName,
        visitorPhone: cleanVisitorPhone,
        unitNumber: unitNumber ? unitNumber.trim().toUpperCase() : 'General',
        category,
        hostName: cleanHostName,
        hostPhone: cleanHostPhone,
        purpose: purpose.trim() || 'General Visit',
        hasVehicle,
        vehiclePlateNumber: hasVehicle ? vehiclePlateNumber.trim().toUpperCase() : undefined,
        vehicleType: hasVehicle ? vehicleType : undefined,
        idType,
        idNumber: idNumber.trim() || undefined,
        idPhotoUri: idPhotoUri || undefined,
      });
      setLoading(false);
      if (res.success) {
        Alert.alert('Visitor Updated', 'Visitor details updated successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', res.error || 'Failed to update visitor.');
      }
      return;
    }

    const res = await visitorService.registerVisitor(
      {
        visitorName: cleanVisitorName,
        visitorPhone: cleanVisitorPhone,
        unitNumber: unitNumber ? unitNumber.trim().toUpperCase() : 'General',
        category,
        hostName: cleanHostName,
        hostPhone: cleanHostPhone,
        purpose: purpose.trim() || 'General Visit',
        hasVehicle,
        vehiclePlateNumber: hasVehicle ? vehiclePlateNumber.trim().toUpperCase() : undefined,
        vehicleType: hasVehicle ? vehicleType : undefined,
        idType,
        idNumber: idNumber.trim() || undefined,
        idPhotoUri: idPhotoUri || undefined,
        instantCheckIn: true,
      },
      {
        guardId: guardId || 'guard-1',
        guardName: guardName || 'Khushi Rani',
        siteName: assignedSite || 'Ahmedabad Plant (Ranucle Zundal)',
      }
    );

    setLoading(false);

    if (res.success && res.visitor) {
      Alert.alert(
        'Visitor Registered',
        `${res.visitor.visitorName} registered successfully. Entry granted.`,
        [
          {
            text: 'View Details',
            onPress: () => {
              navigation.replace('VisitorDetails', { visitorId: res.visitor!.id });
            },
          },
          {
            text: 'Back to Gate List',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      Alert.alert('Registration Failed', res.error || 'Failed to register visitor.');
    }
  };

  return (
    <ScreenLayout activeRoute="RegisterVisitorScreen">
      <PageHeader title={isEditMode ? 'Edit Visitor' : 'Register Visitor'} showBack={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Visitor Details Card (Name First, then Mobile Number not mandatory, then Category) */}
          <Card style={[styles.sectionCard, { borderColor: colors.border }]}>
            <View style={styles.sectionHeaderRow}>
              <User size={18} color={colors.primary[600]} />
              <Heading level="h4" style={styles.sectionTitle}>
                Visitor Details
              </Heading>
            </View>

            {/* 1. Full Name * (Required) */}
            <View style={styles.fieldGroup}>
              <AppText size="xs" weight="bold" style={[styles.fieldLabel, { color: colors.text }]}>
                Full Name *
              </AppText>
              <TextInput
                style={[styles.inputBox, { color: colors.text, borderColor: colors.border }]}
                value={visitorName}
                onChangeText={setVisitorName}
              />
            </View>

            {/* 2. Below Name: Mobile Number * (Compulsory, 10 Digits) */}
            <View style={styles.fieldGroup}>
              <AppText size="xs" weight="bold" style={[styles.fieldLabel, { color: colors.text }]}>
                Mobile Number *
              </AppText>
              <View style={[styles.phoneInputWrap, { backgroundColor: colors.surface, borderColor: visitorPhone.length === 10 ? '#16A34A' : colors.border }]}>
                <View style={styles.countryCodeBadge}>
                  <AppText size="xs" weight="bold" style={{ color: colors.textSecondary }}>
                    +91
                  </AppText>
                </View>
                <TextInput
                  style={[styles.phoneInputBox, { color: colors.text }]}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={visitorPhone}
                  onChangeText={(text) => {
                    const digits = text.replace(/\D/g, '').slice(0, 10);
                    setVisitorPhone(digits);
                    setSelectedVisitorInfo(null);
                  }}
                />
              </View>

              {/* Selected visitor indicator */}
              {selectedVisitorInfo && (
                <View style={styles.selectedPill}>
                  <Check size={14} color="#15803D" />
                  <AppText size="xs" weight="bold" style={{ color: '#15803D', marginLeft: 4 }}>
                    Selected: {selectedVisitorInfo}
                  </AppText>
                </View>
              )}

              {/* Suggestions dropdown list directly below the mobile number input if typed */}
              {matchedProfiles.length > 0 && (
                <View style={[styles.phoneSuggestionsDropdown, { backgroundColor: colors.surface, borderColor: colors.primary[500] }]}>
                  <View style={styles.suggestionsHeader}>
                    <Search size={14} color={colors.primary[600]} />
                    <AppText size="xs" weight="bold" style={{ color: colors.primary[700], marginLeft: 6 }}>
                      Matching Visitors
                    </AppText>
                  </View>
                  {matchedProfiles.map((prof) => (
                    <TouchableOpacity
                      key={prof.id}
                      style={styles.suggestionRow}
                      onPress={() => handleSelectVisitorProfile(prof)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.suggestionAvatar}>
                        <User size={16} color={colors.primary[600]} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <AppText size="sm" weight="bold" style={{ color: colors.text }}>
                            {prof.visitorName}
                          </AppText>
                          <View style={[styles.categoryTag, { backgroundColor: colors.surfaceSecondary }]}>
                            <AppText size="xs" weight="bold" style={{ color: colors.primary[700] }}>
                              {prof.category || 'Guest'}
                            </AppText>
                          </View>
                        </View>
                        <AppText size="xs" style={{ color: colors.textSecondary, marginTop: 2 }}>
                          {prof.visitorPhone} • {prof.totalVisits || 1} past visits
                        </AppText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* 3. Category Dropdown Picker */}
            <View style={styles.fieldGroup}>
              <AppText size="xs" weight="bold" style={[styles.fieldLabel, { color: colors.text }]}>
                Category *
              </AppText>
              <TouchableOpacity
                style={[styles.dropdownTrigger, { borderColor: colors.primary[500], backgroundColor: colors.surface }]}
                onPress={() => setCategoryModalVisible(true)}
                activeOpacity={0.8}
              >
                <Tag size={16} color={colors.primary[600]} />
                <AppText size="sm" weight="bold" style={{ color: colors.text, marginLeft: 8, flex: 1 }}>
                  {category}
                </AppText>
                <ChevronDown size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Section 2: Person to Meet / Host Details (जिसको मिलना है) */}
          <Card style={[styles.sectionCard, { borderColor: colors.border }]}>
            <View style={styles.sectionHeaderRow}>
              <UserCheck size={18} color={colors.primary[600]} />
              <Heading level="h4" style={styles.sectionTitle}>
                Person to Meet (Host Details)
              </Heading>
            </View>

            {/* Person to Meet Name * (Mandatory) */}
            <View style={styles.fieldGroup}>
              <AppText size="xs" weight="bold" style={[styles.fieldLabel, { color: colors.text }]}>
                Person to Meet Name *
              </AppText>
              <TextInput
                style={[styles.inputBox, { color: colors.text, borderColor: colors.border }]}
                value={hostName}
                onChangeText={setHostName}
              />
            </View>

            {/* Person to Meet Mobile Number (Optional, 10 Digits if entered) */}
            <View style={styles.fieldGroup}>
              <AppText size="xs" weight="bold" style={[styles.fieldLabel, { color: colors.text }]}>
                Host Mobile Number
              </AppText>
              <View style={[styles.phoneInputWrap, { backgroundColor: colors.surface, borderColor: hostPhone.length === 10 ? '#16A34A' : colors.border }]}>
                <View style={styles.countryCodeBadge}>
                  <AppText size="xs" weight="bold" style={{ color: colors.textSecondary }}>
                    +91
                  </AppText>
                </View>
                <TextInput
                  style={[styles.phoneInputBox, { color: colors.text }]}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={hostPhone}
                  onChangeText={(text) => {
                    const digits = text.replace(/\D/g, '').slice(0, 10);
                    setHostPhone(digits);
                  }}
                />
              </View>
            </View>

            {/* Destination Unit / Flat */}
            <View style={styles.fieldGroup}>
              <AppText size="xs" weight="bold" style={[styles.fieldLabel, { color: colors.text }]}>
                Destination Unit / Flat
              </AppText>
              <TextInput
                style={[styles.inputBox, { color: colors.text, borderColor: colors.border }]}
                value={unitNumber}
                onChangeText={setUnitNumber}
              />
            </View>

            {/* Purpose of Visit (Whom & why to meet) */}
            <View style={styles.fieldGroup}>
              <AppText size="xs" weight="bold" style={[styles.fieldLabel, { color: colors.text }]}>
                Purpose *
              </AppText>
              <TextInput
                style={[styles.inputBox, { color: colors.text, borderColor: colors.border }]}
                value={purpose}
                onChangeText={setPurpose}
              />
            </View>
          </Card>

          {/* Section: Vehicle Information (Has Vehicle?) */}
          <Card style={[styles.sectionCard, { borderColor: colors.border }]}>
            <View style={styles.sectionHeaderRow}>
              <Car size={18} color={colors.primary[600]} />
              <Heading level="h4" style={styles.sectionTitle}>
                Vehicle Details
              </Heading>
              {hasVehicle && (
                <View style={[styles.vehicleActiveTag, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
                  <Check size={12} color="#15803D" />
                  <AppText size="xs" weight="bold" style={{ color: '#15803D', marginLeft: 3 }}>
                    Vehicle Logged
                  </AppText>
                </View>
              )}
            </View>

            {/* Has Vehicle Button / Segmented Toggle */}
            <View style={styles.fieldGroup}>
              <AppText size="xs" weight="bold" style={[styles.fieldLabel, { color: colors.text }]}>
                Vehicle
              </AppText>
              <View style={styles.vehicleToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.vehicleToggleBtn,
                    !hasVehicle
                      ? [styles.vehicleToggleBtnActive, { backgroundColor: colors.surfaceSecondary, borderColor: colors.primary[600] }]
                      : { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => {
                    setHasVehicle(false);
                    setVehiclePlateNumber('');
                  }}
                  activeOpacity={0.8}
                >
                  <AppText
                    size="sm"
                    weight={!hasVehicle ? 'bold' : 'medium'}
                    style={{ color: !hasVehicle ? colors.primary[700] : colors.textSecondary }}
                  >
                     No Vehicle
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.vehicleToggleBtn,
                    hasVehicle
                      ? [styles.vehicleToggleBtnActive, { backgroundColor: '#F0FDF4', borderColor: '#16A34A' }]
                      : { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => setHasVehicle(true)}
                  activeOpacity={0.8}
                >
                 <AppText
                    size="sm"
                    weight={hasVehicle ? 'bold' : 'medium'}
                    style={{ color: hasVehicle ? '#15803D' : colors.textSecondary, marginLeft: 6 }}
                  >
                     Has Vehicle
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>

            {/* If Has Vehicle is Yes: show License Plate * and Vehicle Type */}
            {hasVehicle && (
              <View style={[styles.vehicleInputsContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                {/* License Plate * */}
                <View style={styles.fieldGroup}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <AppText size="xs" weight="bold" style={[styles.fieldLabel, { color: colors.text, marginBottom: 0 }]}>
                      License Plate *
                    </AppText>
                    <View style={styles.requiredPill}>
                      <AppText size="xs" weight="bold" style={{ color: '#DC2626' }}>
                        Required
                      </AppText>
                    </View>
                  </View>

                  <TextInput
                    style={[styles.inputBox, { color: colors.text, borderColor: colors.border }]}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    value={vehiclePlateNumber}
                    onChangeText={(t) => setVehiclePlateNumber(t.toUpperCase())}
                  />
                </View>

                {/* Vehicle Type Dropdown */}
                <View style={[styles.fieldGroup, { marginTop: 4 }]}>
                  <AppText size="xs" weight="bold" style={[styles.fieldLabel, { color: colors.text }]}>
                    Vehicle Type
                  </AppText>
                  <TouchableOpacity
                    style={[styles.dropdownTrigger, { borderColor: colors.primary[500], backgroundColor: colors.surface }]}
                    onPress={() => setVehicleTypeModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Car size={16} color={colors.primary[600]} />
                    <AppText size="sm" weight="bold" style={{ color: colors.text, marginLeft: 8, flex: 1 }}>
                      {vehicleType}
                    </AppText>
                    <ChevronDown size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>

               
              </View>
            )}
          </Card>

          {/* Section 3: ID Proof Verification & Photo Capture */}
          <Card style={[styles.sectionCard, { borderColor: colors.border }]}>
            <View style={styles.sectionHeaderRow}>
              <Shield size={18} color={colors.primary[600]} />
              <Heading level="h4" style={styles.sectionTitle}>
                ID Proof
              </Heading>
            </View>

            {/* ID Type Dropdown */}
            <View style={styles.fieldGroup}>
              <AppText size="xs" weight="bold" style={[styles.fieldLabel, { color: colors.text }]}>
                ID Type
              </AppText>
              <TouchableOpacity
                style={[styles.dropdownTrigger, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => setIdTypeModalVisible(true)}
                activeOpacity={0.8}
              >
                <AppText size="sm" weight="semibold" style={{ color: colors.text, flex: 1 }}>
                  {VISITOR_ID_TYPES.find((d) => d.code === idType)?.label || idType}
                </AppText>
                <ChevronDown size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldGroup}>
              <AppText size="xs" weight="bold" style={[styles.fieldLabel, { color: colors.text }]}>
                ID Number
              </AppText>
              <TextInput
                style={[styles.inputBox, { color: colors.text, borderColor: colors.border }]}
                value={idNumber}
                onChangeText={setIdNumber}
              />
            </View>

            {/* ID Photo Capture */}
            <View style={styles.fieldGroup}>
              <AppText size="xs" weight="bold" style={[styles.fieldLabel, { color: colors.text }]}>
                ID Photo
              </AppText>

              {idPhotoUri ? (
                <View style={styles.photoPreviewWrap}>
                  <Image source={{ uri: idPhotoUri }} style={styles.idPhotoPreview} />
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => setIdPhotoUri(null)}
                  >
                    <X size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                  <AppText size="xs" weight="semibold" style={{ color: '#15803D', marginLeft: 12 }}>
                    Photo attached
                  </AppText>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.captureBtn, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                  onPress={handleCaptureIdPhoto}
                  activeOpacity={0.8}
                >
                  <Camera size={18} color={colors.primary[600]} />
                  <AppText size="xs" weight="bold" style={{ color: colors.primary[700], marginLeft: 8 }}>
                    Capture or Upload ID Photo
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          </Card>

          {/* Full Length Submit Button */}
          <View style={styles.submitContainer}>
            <Button
              title={
                loading
                  ? 'Saving...'
                  : isEditMode
                  ? 'Save Changes'
                  : 'Register & Grant Entry'
              }
              onPress={handleSubmit}
              disabled={loading}
              style={{ backgroundColor: colors.primary[600], height: 52, width: '100%' }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 1. Block Modal */}
      <Modal visible={blockModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setBlockModalVisible(false)}
        >
          <View style={[styles.modalBox, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
            <View style={styles.modalHeaderRow}>
              <Building2 size={20} color={colors.primary[600]} />
              <Heading level="h4" style={{ marginLeft: 8, flex: 1 }}>
                Select Block
              </Heading>
              <TouchableOpacity onPress={() => setBlockModalVisible(false)}>
                <X size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 14, maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {availableBlocks.map((blk) => {
                const isSelected = selectedBlock.toUpperCase() === blk.toUpperCase();
                const flatsCount = allUnits.filter(
                  (u) => (u.block && u.block.toUpperCase() === blk) || u.unitNumber.toUpperCase().startsWith(`${blk}-`)
                ).length;
                return (
                  <TouchableOpacity
                    key={blk}
                    style={[
                      styles.dropdownItem,
                      isSelected && { backgroundColor: '#EEF2FF', borderColor: colors.primary[600] },
                    ]}
                    onPress={() => handleSelectBlock(blk)}
                  >
                    <View style={[styles.blockBadge, { backgroundColor: isSelected ? colors.primary[600] : colors.surfaceSecondary }]}>
                      <AppText size="sm" weight="bold" style={{ color: isSelected ? '#FFFFFF' : colors.primary[700] }}>
                        {blk}
                      </AppText>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <AppText
                        size="sm"
                        weight={isSelected ? 'bold' : 'regular'}
                        style={{ color: isSelected ? colors.primary[700] : colors.text }}
                      >
                        Block {blk} Wing
                      </AppText>
                      <AppText size="xs" style={{ color: colors.textSecondary }}>
                        {flatsCount > 0 ? `${flatsCount} Flats Available` : 'Residential Wing'}
                      </AppText>
                    </View>
                    {isSelected && <Check size={18} color={colors.primary[600]} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* + Add New Block Section */}
            {isAddingBlock ? (
              <View style={[styles.inlineAddBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <AppText size="xs" weight="bold" style={{ color: colors.text, marginBottom: 6 }}>
                  Add Block Name
                </AppText>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    style={[styles.inlineInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                    value={newBlockInput}
                    onChangeText={setNewBlockInput}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={[styles.inlineAddBtn, { backgroundColor: colors.primary[600] }]}
                    onPress={handleAddCustomBlock}
                  >
                    <AppText size="xs" weight="bold" style={{ color: '#FFFFFF' }}>
                      Add
                    </AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inlineCancelBtn, { borderColor: colors.border }]}
                    onPress={() => {
                      setIsAddingBlock(false);
                      setNewBlockInput('');
                    }}
                  >
                    <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addNewTriggerBtn, { borderColor: colors.primary[600], backgroundColor: '#EEF2FF' }]}
                onPress={() => setIsAddingBlock(true)}
              >
                <Plus size={16} color={colors.primary[700]} />
                <AppText size="xs" weight="bold" style={{ color: colors.primary[700], marginLeft: 6 }}>
                  + Add Block
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 2. Flat / Unit Dropdown Modal (101, 102, 201...) */}
      <Modal visible={unitModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setUnitModalVisible(false)}
        >
          <View style={[styles.modalBox, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, maxHeight: '80%' }]}>
            <View style={styles.modalHeaderRow}>
              <Home size={20} color={colors.primary[600]} />
              <Heading level="h4" style={{ marginLeft: 8, flex: 1 }}>
                Select Flat in Block {selectedBlock}
              </Heading>
              <TouchableOpacity onPress={() => setUnitModalVisible(false)}>
                <X size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 12, maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {availableUnitsForBlock.length > 0 ? (
                availableUnitsForBlock.map((u) => {
                  const isSelected = unitNumber.toUpperCase() === u.unitNumber.toUpperCase();
                  const flatOnly = u.unitNumber.includes('-') ? u.unitNumber.split('-')[1] : u.unitNumber;
                  return (
                    <TouchableOpacity
                      key={u.unitNumber}
                      style={[
                        styles.dropdownItem,
                        isSelected && { backgroundColor: '#EEF2FF', borderColor: colors.primary[600] },
                      ]}
                      onPress={() => handleSelectUnit(u.unitNumber)}
                    >
                      <View style={[styles.unitNumberBox, { backgroundColor: isSelected ? colors.primary[600] : colors.surfaceSecondary }]}>
                        <AppText size="xs" weight="bold" style={{ color: isSelected ? '#FFFFFF' : colors.primary[700] }}>
                          {flatOnly}
                        </AppText>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <AppText
                          size="sm"
                          weight={isSelected ? 'bold' : 'semibold'}
                          style={{ color: isSelected ? colors.primary[700] : colors.text }}
                        >
                          Flat {u.unitNumber}
                        </AppText>
                        <AppText size="xs" style={{ color: colors.textSecondary }}>
                          Owner: {u.ownerName} • {u.members.length} Members
                        </AppText>
                      </View>
                      {isSelected && <Check size={18} color={colors.primary[600]} />}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <AppText size="sm" style={{ color: colors.textSecondary }}>
                    No flats recorded for Block {selectedBlock}.
                  </AppText>
                </View>
              )}
            </ScrollView>

            {/* + Add New Flat Section */}
            {isAddingUnit ? (
              <View style={[styles.inlineAddBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <AppText size="xs" weight="bold" style={{ color: colors.text, marginBottom: 6 }}>
                  Add New Flat in Block {selectedBlock}
                </AppText>
                <TextInput
                  style={[styles.inlineInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 8 }]}
                  value={newUnitInput}
                  onChangeText={setNewUnitInput}
                  autoCapitalize="characters"
                />
                <TextInput
                  style={[styles.inlineInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 8 }]}
                  value={newUnitOwnerInput}
                  onChangeText={setNewUnitOwnerInput}
                />
                <TextInput
                  style={[styles.inlineInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 8 }]}
                  value={newUnitPhoneInput}
                  keyboardType="number-pad"
                  maxLength={10}
                  onChangeText={(val) => setNewUnitPhoneInput(val.replace(/\D/g, '').slice(0, 10))}
                />
                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
                  <TouchableOpacity
                    style={[styles.inlineCancelBtn, { borderColor: colors.border, paddingHorizontal: 12 }]}
                    onPress={() => {
                      setIsAddingUnit(false);
                      setNewUnitInput('');
                      setNewUnitOwnerInput('');
                      setNewUnitPhoneInput('');
                    }}
                  >
                    <AppText size="xs" style={{ color: colors.textSecondary }}>Cancel</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inlineAddBtn, { backgroundColor: colors.primary[600], paddingHorizontal: 14 }]}
                    onPress={handleAddCustomUnit}
                  >
                    <AppText size="xs" weight="bold" style={{ color: '#FFFFFF' }}>Save & Select Flat</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addNewTriggerBtn, { borderColor: colors.primary[600], backgroundColor: '#EEF2FF', marginTop: 10 }]}
                onPress={() => setIsAddingUnit(true)}
              >
                <Plus size={16} color={colors.primary[700]} />
                <AppText size="xs" weight="bold" style={{ color: colors.primary[700], marginLeft: 6 }}>
                  + Add New Flat in Block {selectedBlock}
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 3. Resident / Family Member Dropdown Modal */}
      <Modal visible={memberModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMemberModalVisible(false)}
        >
          <View style={[styles.modalBox, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, maxHeight: '80%' }]}>
            <View style={styles.modalHeaderRow}>
              <Users size={20} color={colors.primary[600]} />
              <Heading level="h4" style={{ marginLeft: 8, flex: 1 }}>
                Select Resident at {unitNumber}
              </Heading>
              <TouchableOpacity onPress={() => setMemberModalVisible(false)}>
                <X size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <AppText size="xs" style={{ color: colors.textSecondary, marginTop: 6, marginBottom: 12 }}>
              Choose the family member visitor is here to meet:
            </AppText>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {currentUnit && currentUnit.members.length > 0 ? (
                currentUnit.members.map((member) => {
                  const isSelected =
                    selectedMemberId === member.id ||
                    hostName.toLowerCase() === member.name.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.dropdownItem,
                        isSelected && { backgroundColor: '#EEF2FF', borderColor: colors.primary[600] },
                      ]}
                      onPress={() => handleSelectMember(member)}
                    >
                      <View style={[styles.radioCircle, isSelected && { borderColor: colors.primary[600] }]}>
                        {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.primary[600] }]} />}
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <AppText size="sm" weight="bold" style={{ color: isSelected ? colors.primary[700] : colors.text }}>
                            {member.name}
                          </AppText>
                          <View style={[styles.relationTag, { backgroundColor: colors.surfaceSecondary, marginLeft: 8 }]}>
                            <AppText size="xs" weight="bold" style={{ color: colors.primary[700] }}>
                              {member.relation}
                            </AppText>
                          </View>
                        </View>
                        <AppText size="xs" style={{ color: colors.textSecondary, marginTop: 2 }}>
                          {member.phone || 'No phone recorded'}
                        </AppText>
                      </View>
                      {isSelected && <Check size={18} color={colors.primary[600]} />}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <AppText size="xs" style={{ color: colors.textSecondary }}>
                    No pre-saved family members for {unitNumber}.
                  </AppText>
                </View>
              )}
            </ScrollView>

            {/* + Add New Resident Member Section */}
            {isAddingMember ? (
              <View style={[styles.inlineAddBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <AppText size="xs" weight="bold" style={{ color: colors.text, marginBottom: 6 }}>
                  Add Resident Member for {unitNumber}
                </AppText>
                <TextInput
                  style={[styles.inlineInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 8 }]}
                  value={newMemberName}
                  onChangeText={setNewMemberName}
                />
                <View style={{ marginBottom: 8 }}>
                  <AppText size="xs" style={{ color: colors.textSecondary, marginBottom: 4 }}>Relation:</AppText>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {['Owner', 'Spouse', 'Son', 'Daughter', 'Parent', 'Tenant'].map((rel) => {
                      const isRelSelected = newMemberRelation === rel;
                      return (
                        <TouchableOpacity
                          key={rel}
                          style={[
                            styles.relationChip,
                            {
                              backgroundColor: isRelSelected ? colors.primary[600] : colors.surface,
                              borderColor: isRelSelected ? colors.primary[700] : colors.border,
                            },
                          ]}
                          onPress={() => setNewMemberRelation(rel)}
                        >
                          <AppText size="xs" weight={isRelSelected ? 'bold' : 'regular'} style={{ color: isRelSelected ? '#FFFFFF' : colors.text }}>
                            {rel}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                <TextInput
                  style={[styles.inlineInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 8 }]}
                  value={newMemberPhone}
                  keyboardType="number-pad"
                  maxLength={10}
                  onChangeText={(val) => setNewMemberPhone(val.replace(/\D/g, '').slice(0, 10))}
                />
                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
                  <TouchableOpacity
                    style={[styles.inlineCancelBtn, { borderColor: colors.border, paddingHorizontal: 12 }]}
                    onPress={() => {
                      setIsAddingMember(false);
                      setNewMemberName('');
                      setNewMemberPhone('');
                    }}
                  >
                    <AppText size="xs" style={{ color: colors.textSecondary }}>Cancel</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inlineAddBtn, { backgroundColor: colors.primary[600], paddingHorizontal: 14 }]}
                    onPress={handleAddCustomMember}
                  >
                    <AppText size="xs" weight="bold" style={{ color: '#FFFFFF' }}>Save & Select Member</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addNewTriggerBtn, { borderColor: colors.primary[600], backgroundColor: '#EEF2FF', marginTop: 10 }]}
                onPress={() => setIsAddingMember(true)}
              >
                <Plus size={16} color={colors.primary[700]} />
                <AppText size="xs" weight="bold" style={{ color: colors.primary[700], marginLeft: 6 }}>
                  + Add New Resident Member for {unitNumber}
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Category Dropdown Modal */}
      <Modal visible={categoryModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
        >
          <View style={[styles.modalBox, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
            <View style={styles.modalHeaderRow}>
              <Tag size={20} color={colors.primary[600]} />
              <Heading level="h4" style={{ marginLeft: 8, flex: 1 }}>
                Select Category
              </Heading>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <X size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 12 }}>
              {STANDARD_VISITOR_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.dropdownItem,
                    category === cat && { backgroundColor: '#EEF2FF', borderColor: colors.primary[600] },
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setCategoryModalVisible(false);
                  }}
                >
                  <AppText
                    size="sm"
                    weight={category === cat ? 'bold' : 'regular'}
                    style={{ color: category === cat ? colors.primary[700] : colors.text, flex: 1 }}
                  >
                    {cat}
                  </AppText>
                  {category === cat && <Check size={18} color={colors.primary[600]} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ID Type Dropdown Modal */}
      <Modal visible={idTypeModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIdTypeModalVisible(false)}
        >
          <View style={[styles.modalBox, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
            <View style={styles.modalHeaderRow}>
              <Shield size={20} color={colors.primary[600]} />
              <Heading level="h4" style={{ marginLeft: 8, flex: 1 }}>
                Select ID Type
              </Heading>
              <TouchableOpacity onPress={() => setIdTypeModalVisible(false)}>
                <X size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 12 }}>
              {VISITOR_ID_TYPES.map((dt) => (
                <TouchableOpacity
                  key={dt.code}
                  style={[
                    styles.dropdownItem,
                    idType === dt.code && { backgroundColor: '#EEF2FF', borderColor: colors.primary[600] },
                  ]}
                  onPress={() => {
                    setIdType(dt.code);
                    setIdTypeModalVisible(false);
                  }}
                >
                  <AppText
                    size="sm"
                    weight={idType === dt.code ? 'bold' : 'regular'}
                    style={{ color: idType === dt.code ? colors.primary[700] : colors.text, flex: 1 }}
                  >
                    {dt.label}
                  </AppText>
                  {idType === dt.code && <Check size={18} color={colors.primary[600]} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 5. Vehicle Type Dropdown Modal */}
      <Modal visible={vehicleTypeModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVehicleTypeModalVisible(false)}
        >
          <View style={[styles.modalBox, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
            <View style={styles.modalHeaderRow}>
              <Car size={20} color={colors.primary[600]} />
              <Heading level="h4" style={{ marginLeft: 8, flex: 1 }}>
                Select Vehicle Type
              </Heading>
              <TouchableOpacity onPress={() => setVehicleTypeModalVisible(false)}>
                <X size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 12 }}>
              {VISITOR_VEHICLE_TYPES.map((vType) => {
                const isSelected = vehicleType === vType;
                return (
                  <TouchableOpacity
                    key={vType}
                    style={[
                      styles.dropdownItem,
                      isSelected && { backgroundColor: '#EEF2FF', borderColor: colors.primary[600] },
                    ]}
                    onPress={() => {
                      setVehicleType(vType);
                      setVehicleTypeModalVisible(false);
                    }}
                  >
                    <Car size={16} color={isSelected ? colors.primary[600] : colors.textTertiary} />
                    <AppText
                      size="sm"
                      weight={isSelected ? 'bold' : 'regular'}
                      style={{ color: isSelected ? colors.primary[700] : colors.text, marginLeft: 10, flex: 1 }}
                    >
                      {vType}
                    </AppText>
                    {isSelected && <Check size={18} color={colors.primary[600]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  sectionCard: {
    marginBottom: 14,
    padding: 14,
    borderWidth: 1.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 8,
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  inputBox: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 13,
  },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    height: 46,
    overflow: 'hidden',
  },
  countryCodeBadge: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  phoneInputBox: {
    flex: 1,
    paddingHorizontal: 12,
    height: '100%',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  phoneSuggestionsDropdown: {
    borderWidth: 1.5,
    borderRadius: 8,
    marginTop: 6,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
  },
  rowTwoCols: {
    flexDirection: 'row',
  },
  blockBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitNumberBox: {
    width: 38,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  relationTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  captureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
  },
  photoPreviewWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  idPhotoPreview: {
    width: 60,
    height: 45,
    borderRadius: 4,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    left: 56,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitContainer: {
    marginTop: 10,
    marginBottom: 24,
    width: '100%',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  inlineAddBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    marginTop: 10,
  },
  inlineInput: {
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  inlineAddBtn: {
    height: 44,
    borderRadius: 6,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineCancelBtn: {
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNewTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 10,
  },
  relationChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  modalBox: {
    padding: 18,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  vehicleActiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  vehicleToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  vehicleToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 8,
  },
  vehicleToggleBtnActive: {
    borderWidth: 2,
  },
  vehicleInputsContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  requiredPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  plateInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    overflow: 'hidden',
    height: 48,
  },
  plateCountryBadge: {
    backgroundColor: '#DBEAFE',
    height: '100%',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#93C5FD',
  },
  plateInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  quickVehicleChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  vehicleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
});
