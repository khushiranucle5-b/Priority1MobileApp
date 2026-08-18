import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

const actions = [
  { id: '3', title: "Today's Duty", icon: '📋', route: 'Duty' },
  { id: '4', title: 'Patrol', icon: '🚨', route: 'Patrol' },
  { id: '5', title: 'Incident Report', icon: '⚠️', route: 'Incident' },
  { id: '6', title: 'Leave Request', icon: '📅', route: 'Leave' },
  { id: '7', title: 'Documents', icon: '📄', route: 'Documents' },
];

export const QuickActionsGrid: React.FC = () => {
  const { colors, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  
  const { isClockedIn, isClockedOut } = useGuardStore();

  const handlePress = (route: string) => {
    if (route === 'ClockIn') {
      navigation.navigate('Attendance', { screen: 'SelfieVerification', params: { actionType: 'Clock In' } });
    } else if (route === 'ClockOut') {
      navigation.navigate('Attendance', { screen: 'SelfieVerification', params: { actionType: 'Clock Out' } });
    } else if (route === 'Duty') {
      navigation.navigate('Duty');
    } else if (route === 'Leave') {
      navigation.navigate('Leave');
    } else if (route === 'Incident') {
      navigation.navigate('Incident');
    } else if (route === 'Patrol') {
      navigation.navigate('Patrol');
    } else if (route === 'Documents') {
      navigation.navigate('Documents');
    } else {
      console.log(`Navigate to ${route}`);
    }
  };

  const isDisabled = (_route: string) => {
    return false;
  };

  return (
    <View style={styles.container}>
      <Heading level="h4" style={styles.title}>Quick Actions</Heading>
      
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderRadius: borderRadius.lg, ...shadows.sm },
              isDisabled(action.route) && { opacity: 0.5 }
            ]}
            onPress={() => handlePress(action.route)}
            activeOpacity={0.7}
            disabled={isDisabled(action.route)}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary[50], borderRadius: borderRadius.full }]}>
              <AppText style={styles.icon}>{action.icon}</AppText>
            </View>
            <AppText size="sm" weight="medium" style={styles.cardTitle}>{action.title}</AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '31%',
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
  },
  cardTitle: {
    textAlign: 'center',
  }
});
