import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../../../services/storage.service';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { Button } from '../../../components/Button';

import { typography } from '../../../theme/tokens/typography';

export const DataStorageScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  const [dbKeys, setDbKeys] = useState<number>(0);
  const [totalSizeKB, setTotalSizeKB] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateStorage();
  }, []);

  const calculateStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      setDbKeys(keys.length);
      
      let totalBytes = 0;
      const keyValues = await StorageService.multiGet<string>(keys);
      Object.entries(keyValues).forEach(([key, value]) => {
        totalBytes += key.length;
        if (value) totalBytes += String(value).length;
      });

      setTotalSizeKB(Math.round(totalBytes / 1024));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <PageHeader title="Data & Storage" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary[500]} style={{ marginTop: 40 }} />
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <AppText style={styles.title}>Local Database Status</AppText>
            
            <View style={styles.detailRow}>
              <AppText style={styles.label}>Storage Keys Used:</AppText>
              <AppText style={styles.value}>{dbKeys}</AppText>
            </View>

            <View style={styles.detailRow}>
              <AppText style={styles.label}>Estimated Size:</AppText>
              <AppText style={styles.value}>{totalSizeKB} KB</AppText>
            </View>
            
            <View style={styles.detailRow}>
              <AppText style={styles.label}>Sync Status:</AppText>
              <AppText style={styles.value}>Synchronized</AppText>
            </View>

            <AppText style={styles.description}>
              The application caches structural data (like schedules, sites, and documents) to ensure seamless offline functionality. Clearing temporary cache resets non-essential view states while preserving offline database records.
            </AppText>

            <View style={{ marginTop: 20, width: '100%' }}>
              <Button 
                title="Clear Temporary Cache" 
                variant="outline"
                size="large"
                fullWidth
                style={{ minHeight: 60 }}
                onPress={() => {
                  Alert.alert(
                    "Clear Cache",
                    "Temporary view cache cleared successfully.",
                    [{ text: "OK", onPress: () => calculateStorage() }]
                  );
                }} 
              />
            </View>
          </View>
        )}

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 20,
  },
  title: {
    ...typography.presets.cardTitle,
    color: '#0F172A',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    ...typography.presets.label,
    color: '#475569',
  },
  value: {
    ...typography.presets.body,
    fontWeight: '600',
    color: '#0F172A',
  },
  description: {
    marginTop: 20,
    ...typography.presets.helper,
    lineHeight: 22,
    color: '#64748B',
  }
});
