import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heading } from './typography/Heading';
import { AppText } from './typography/Text';
import { useTheme } from '../providers/ThemeProvider';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, showBack = false, onBack, rightComponent }) => {
  const { spacing, colors } = useTheme();
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.base, paddingVertical: spacing.sm }]}>
      {showBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <AppText style={[styles.backArrowText, { color: colors.text }]}>←</AppText>
        </TouchableOpacity>
      )}
      <Heading level="h3" style={styles.title}>{title}</Heading>
      {rightComponent && (
        <View style={styles.rightComponentContainer}>
          {rightComponent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 60,
  },
  backButton: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  backArrowText: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
  },
  rightComponentContainer: {
    position: 'absolute',
    right: 12,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    minWidth: 48,
    minHeight: 48,
  }
});
