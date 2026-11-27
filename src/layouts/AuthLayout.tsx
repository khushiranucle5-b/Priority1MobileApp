import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../providers/ThemeProvider';

interface AuthLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, header }) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {header ? <View style={styles.header}>{header}</View> : null}
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            header ? styles.scrollWithHeader : styles.scrollCentered,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  scrollCentered: {
    justifyContent: 'center',
  },
  scrollWithHeader: {
    justifyContent: 'flex-start',
  },
  inner: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
});
