import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heading } from './typography/Heading';
import { AppText } from './typography/Text';
import { useTheme } from '../providers/ThemeProvider';
import { useDrawerStore } from '../store/useDrawerStore';
import { NavIcon } from './NavIcon';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  onMenuPress?: () => void;
  rightComponent?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showMenu,
  onMenuPress,
  rightComponent,
}) => {
  const { spacing, colors } = useTheme();
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const handleMenu = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      useDrawerStore.getState().openDrawer();
    }
  };

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.base, paddingVertical: spacing.sm }]}>
      {showBack ? (
        <TouchableOpacity
          style={styles.leftButton}
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <NavIcon name="arrow-left" size={24} color={colors.text || '#334155'} />
        </TouchableOpacity>
      ) : showMenu !== false ? (
        <TouchableOpacity
          style={styles.leftButton}
          onPress={handleMenu}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityLabel="Open menu"
        >
          <NavIcon name="menu" size={24} color={colors.text || '#334155'} />
        </TouchableOpacity>
      ) : null}
      <Heading level="h2" style={styles.title}>{title}</Heading>
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
    minHeight: 64,
  },
  leftButton: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  backArrowText: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  title: {
    textAlign: 'center',
  },
  rightComponentContainer: {
    position: 'absolute',
    right: 12,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    minWidth: 56,
    minHeight: 56,
  }
});
