import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation.types';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { NotificationCard, EmptyNotificationState, NotificationListSkeleton } from '../components';

import { Input } from '../../../components/Input';

type Props = NativeStackScreenProps<HomeStackParamList, 'Notifications'>;

const CATEGORIES = ['All', 'Attendance', 'Leave', 'Incident', 'Company', 'Holiday', 'System'];

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, spacing, borderRadius } = useTheme();
  const { notifications, markAllNotificationsRead, deleteAllNotifications } = useGuardStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const isLoading = false;

  // Memoize filtered and sorted notifications
  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (activeCategory !== 'All') {
      result = result.filter(n => n.type === activeCategory);
    }

    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(lowerQuery) || 
        n.description.toLowerCase().includes(lowerQuery) ||
        n.type.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [notifications, activeCategory, searchQuery]);

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
  };

  const handleDeleteAll = () => {
    Alert.alert(
      "Clear All",
      "Are you sure you want to delete all notifications? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete All", style: "destructive", onPress: () => deleteAllNotifications() }
      ]
    );
  };

  return (
    <ScreenLayout>
      <PageHeader title="Notifications" showBack onBack={() => navigation.goBack()} />
      
      <View style={[styles.headerActions, { paddingHorizontal: spacing.base }]}>
        <Input
          placeholder="Search notifications..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<AppText style={styles.searchIcon}>🔍</AppText>}
        />

        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={handleMarkAllRead} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <AppText size="sm" color="primary" weight="bold">Mark All Read</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAll} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <AppText size="sm" color="error" weight="bold">Clear All</AppText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: spacing.base }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                { 
                  backgroundColor: activeCategory === item ? colors.primary[600] : colors.surfaceSecondary,
                  borderRadius: borderRadius.full 
                }
              ]}
              onPress={() => setActiveCategory(item)}
            >
              <AppText 
                color={activeCategory === item ? 'inverse' : 'secondary'} 
                weight={activeCategory === item ? 'bold' : 'medium'}
                size="sm"
              >
                {item}
              </AppText>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={[styles.listContainer, { paddingHorizontal: spacing.base }]}>
        {isLoading ? (
          <NotificationListSkeleton />
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <NotificationCard 
                notification={item} 
                onPress={() => navigation.navigate('NotificationDetails', { notificationId: item.id })} 
              />
            )}
            contentContainerStyle={filteredNotifications.length === 0 ? styles.emptyContainer : styles.flatListContent}
            ListEmptyComponent={EmptyNotificationState}
          />
        )}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  headerActions: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  listContainer: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
  }
});
