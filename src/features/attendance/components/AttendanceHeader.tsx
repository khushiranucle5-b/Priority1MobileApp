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
    <View style={[styles.container, { paddingHorizontal: spacing.base, paddingVertical: spacing.sm }]}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        activeOpacity={0.7}
        accessibilityLabel="Go back"
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
    minHeight: 60,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowText: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
  },
  rightPlaceholder: {
    width: 48,
  }
});
