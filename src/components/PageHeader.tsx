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
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppText size="xl" color="primary">←</AppText>
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
    height: '100%',
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
