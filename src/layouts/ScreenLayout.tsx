import React from 'react';
import { StyleSheet, View, ViewProps, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../providers/ThemeProvider';
import { PersistentSidebar } from '../components/PersistentSidebar';

interface ScreenLayoutProps extends ViewProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  activeRoute?: string;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  style,
  edges = ['top', 'bottom'],
  activeRoute,
  ...props
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={edges}
    >
      <View style={styles.layoutRow}>
        {isLargeScreen && <PersistentSidebar activeRoute={activeRoute} />}
        <View style={[styles.container, style]} {...props}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  layoutRow: {
    flex: 1,
    flexDirection: 'row',
  },
  container: {
    flex: 1,
  },
});
