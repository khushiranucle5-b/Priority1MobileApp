import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heading } from '../../../components/typography/Heading';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

export const AttendanceHeader: React.FC = () => {
  const navigation = useNavigation();
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.base, paddingVertical: spacing.md }]}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
        activeOpacity={0.7}
      >
        <AppText style={[styles.backArrowText, { color: colors.text }]}>←</AppText>
      </TouchableOpacity>
      <Heading level="h3" style={styles.title}>Attendance</Heading>
      <View style={styles.rightPlaceholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowText: {
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  rightPlaceholder: {
    width: 32, // Matches back button width to center the title
  }
});
