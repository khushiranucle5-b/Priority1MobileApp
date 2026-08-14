import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation.types';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { Button } from '../../../components/Button';

type Props = NativeStackScreenProps<HomeStackParamList, 'NotificationDetails'>;

export const NotificationDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { notificationId } = route.params;
  const { colors, spacing, borderRadius } = useTheme();
  
  const { notifications, markNotificationRead, deleteNotification } = useGuardStore();
  
  const notification = notifications.find(n => n.id === notificationId);

  useEffect(() => {
    if (notification && !notification.isRead) {
      markNotificationRead(notification.id);
    }
  }, [notification, markNotificationRead]);

  if (!notification) {
    return (
      <ScreenLayout>
        <PageHeader title="Notification Not Found" showBack onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <AppText color="secondary">This notification no longer exists.</AppText>
        </View>
      </ScreenLayout>
    );
  }

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'High': return colors.error;
      case 'Medium': return colors.warning;
      case 'Low': return colors.primary[500];
      default: return colors.primary[500];
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'Attendance': return '🕒';
      case 'Leave': return '📅';
      case 'Incident': return '⚠️';
      case 'Company': return '📢';
      case 'Holiday': return '🎉';
      case 'System': return '⚙️';
      default: return '🔔';
    }
  };

  const formattedTime = new Date(notification.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = new Date(notification.date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });

  const handleDelete = () => {
    deleteNotification(notification.id);
    navigation.goBack();
  };

  return (
    <ScreenLayout>
      <PageHeader title="Notification Details" showBack onBack={() => navigation.goBack()} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}>
          
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <AppText style={{ fontSize: 32 }}>{getIcon()}</AppText>
            </View>
            <View style={styles.titleContainer}>
              <Heading level="h3">{notification.title}</Heading>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(), borderRadius: borderRadius.full }]}>
                <AppText size="xs" color="surface" weight="bold">{notification.priority} Priority</AppText>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <AppText color="secondary" weight="bold" style={styles.label}>Category</AppText>
            <AppText>{notification.type}</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText color="secondary" weight="bold" style={styles.label}>Date</AppText>
            <AppText>{formattedDate}</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText color="secondary" weight="bold" style={styles.label}>Time</AppText>
            <AppText>{formattedTime}</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText color="secondary" weight="bold" style={styles.label}>Status</AppText>
            <AppText color="primary">{notification.isRead ? 'Read' : 'Unread'}</AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.messageContainer}>
            <AppText color="secondary" weight="bold" style={styles.label}>Description</AppText>
            <AppText style={styles.descriptionText}>{notification.description}</AppText>
          </View>

        </View>
        
        <Button 
          title="Delete Notification" 
          variant="outline"
          onPress={handleDelete}
          style={styles.deleteButton}
        />
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    width: 100,
  },
  messageContainer: {
    marginTop: 8,
  },
  descriptionText: {
    marginTop: 8,
    lineHeight: 24,
  },
  deleteButton: {
    borderColor: '#DC2626',
  }
});
