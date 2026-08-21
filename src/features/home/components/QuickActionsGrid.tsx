import React from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { NavIcon, NavIconName } from '../../../components/NavIcon';

const actions: { id: string; title: string; icon: NavIconName; route: string; isEmergency?: boolean }[] = [
  { id: '1', title: 'DIRECT MSG', icon: 'messages', route: 'Messages' },
  { id: '2', title: 'FILE INCIDENT', icon: 'incidents', route: 'FileIncident' },
  { id: '3', title: 'LEAVE', icon: 'leaves', route: 'Leave' },
  { id: '4', title: 'EMERGENCY', icon: 'loneworker', route: 'Emergency', isEmergency: true },
  { id: '5', title: 'DOCUMENTS', icon: 'policies', route: 'Documents' },
  { id: '6', title: 'LONE WORK', icon: 'loneworker', route: 'LoneWorker' },
];

export const QuickActionsGrid: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const reportIncident = useGuardStore((state) => state.reportIncident);
  const guardName = useGuardStore((state) => state.guardName);
  const assignedSite = useGuardStore((state) => state.assignedSite);

  const handlePress = (action: typeof actions[0]) => {
    if (action.isEmergency) {
      Alert.alert(
        'Emergency SOS Alert',
        'Trigger immediate emergency SOS signal to Control Room?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'SEND SOS ALERT',
            style: 'destructive',
            onPress: async () => {
              await reportIncident({
                type: 'Emergency SOS',
                title: 'DASHBOARD EMERGENCY SOS TRIGGERED',
                description: `Emergency alert triggered by officer ${guardName || 'Khushi Rani'} at ${assignedSite || 'Ahmedabad Plant'}.`,
                location: assignedSite || 'Ahmedabad Plant',
                severity: 'Critical',
              });
              Alert.alert('SOS Transmitted', 'Emergency SOS signal sent to Control Room & Supervisor.');
            },
          },
        ]
      );
    } else {
      navigation.navigate(action.route);
    }
  };

  return (
    <View style={styles.container}>
      <Heading level="h4" style={styles.title}>QUICK ACTIONS</Heading>

      <View style={styles.grid}>
        {actions.map((action) => {
          const isEm = action.isEmergency;
          const iconColor = isEm ? '#DC2626' : (colors.primary[600] || '#2563eb');
          return (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.card,
                {
                  backgroundColor: isEm ? '#FEF2F2' : colors.surface,
                  borderColor: isEm ? '#FCA5A5' : colors.borderStrong || '#cbd5e1',
                  borderRadius: borderRadius.lg,
                },
              ]}
              onPress={() => handlePress(action)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconContainer, { backgroundColor: isEm ? '#FEE2E2' : colors.surfaceSecondary || '#f1f5f9' }]}>
                <NavIcon name={action.icon} size={26} color={iconColor} />
              </View>
              <AppText
                size="base"
                weight="bold"
                style={[styles.cardTitle, { color: isEm ? '#DC2626' : colors.text }]}
              >
                {action.title}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  title: {
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    height: 100,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
