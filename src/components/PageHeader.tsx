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
    <View style={[styles.container, { paddingHorizontal: spacing.base, paddingVertical: spacing.md }]}>
      {showBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          activeOpacity={0.7}
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
    minHeight: 56,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingRight: 8,
  },
  backArrowText: {
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  title: {
    textAlign: 'center',
  },
  rightComponentContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    justifyContent: 'center',
    height: '100%',
  }
});
