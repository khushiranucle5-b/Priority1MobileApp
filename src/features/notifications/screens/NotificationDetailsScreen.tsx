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
              <AppText style={{ fontSize: 36 }}>{getIcon()}</AppText>
            </View>
            <View style={styles.titleContainer}>
              <AppText style={styles.titleText}>{notification.title}</AppText>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(), borderRadius: borderRadius.full }]}>
                <AppText style={styles.priorityText}>{notification.priority} Priority</AppText>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <AppText style={styles.label}>Category</AppText>
            <AppText style={styles.valueText}>{notification.type}</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText style={styles.label}>Date</AppText>
            <AppText style={styles.valueText}>{formattedDate}</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText style={styles.label}>Time</AppText>
            <AppText style={styles.valueText}>{formattedTime}</AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText style={styles.label}>Status</AppText>
            <AppText style={[styles.valueText, { color: '#2563EB' }]}>{notification.isRead ? 'Read' : 'Unread'}</AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.messageContainer}>
            <AppText style={styles.label}>Description</AppText>
            <AppText style={styles.descriptionText}>{notification.description}</AppText>
          </View>

        </View>
        
        <Button 
          title="Delete Notification" 
          variant="outline"
          size="large"
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
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  label: {
    width: 120,
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  valueText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
  },
  messageContainer: {
    marginTop: 8,
  },
  descriptionText: {
    marginTop: 8,
    fontSize: 17.5,
    lineHeight: 26,
    color: '#334155',
  },
  deleteButton: {
    borderColor: '#DC2626',
  }
});
