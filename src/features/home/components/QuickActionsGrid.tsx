import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

import { NavIcon, NavIconName } from '../../../components/NavIcon';

const actions: { id: string; title: string; icon: NavIconName; route: string }[] = [
  { id: '1', title: 'Patrol', icon: 'patrol', route: 'Patrol' },
  { id: '2', title: 'Incident Report', icon: 'incidents', route: 'Incident' },
  { id: '3', title: 'Leave Request', icon: 'leaves', route: 'Leave' },
];

export const QuickActionsGrid: React.FC = () => {
  const { colors, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();

  const handlePress = (route: string) => {
    if (route === 'Leave') {
      navigation.navigate('Leave');
    } else if (route === 'Incident') {
      navigation.navigate('Incident');
    } else if (route === 'Patrol') {
      navigation.navigate('Patrol');
    }
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
            ]}
            onPress={() => handlePress(action.route)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary[50], borderRadius: borderRadius.full }]}>
              <NavIcon name={action.icon} size={20} color="#4F46E5" />
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
