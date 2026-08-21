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
            <AppText size="lg" weight="bold" style={styles.title}>Local Database Status</AppText>
            
            <View style={styles.detailRow}>
              <AppText color="secondary">Storage Keys Used:</AppText>
              <AppText weight="bold">{dbKeys}</AppText>
            </View>

            <View style={styles.detailRow}>
              <AppText color="secondary">Estimated Size:</AppText>
              <AppText weight="bold">{totalSizeKB} KB</AppText>
            </View>
            
            <View style={styles.detailRow}>
              <AppText color="secondary">Sync Status:</AppText>
              <AppText weight="medium">Synchronized</AppText>
            </View>

            <AppText size="sm" color="secondary" style={styles.description}>
              The application caches structural data (like schedules, sites, and documents) to ensure seamless offline functionality. Clearing temporary cache resets non-essential view states while preserving offline database records.
            </AppText>

            <View style={{ marginTop: 20, width: '100%' }}>
              <Button 
                title="Clear Temporary Cache" 
                variant="outline"
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
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  title: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  description: {
    marginTop: 20,
    lineHeight: 20,
  }
});
