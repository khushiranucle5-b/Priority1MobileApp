import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { AppNotification } from '../../../store/useGuardStore';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

interface NotificationCardProps {
  notification: AppNotification;
  onPress: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onPress }) => {
  const { colors, borderRadius } = useTheme();

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

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'High': return colors.error;
      case 'Medium': return colors.warning;
      case 'Low': return colors.primary[500];
      default: return colors.primary[500];
    }
  };

  const formattedTime = new Date(notification.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = new Date(notification.date).toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: notification.isRead ? colors.surface : colors.primary[50], 
          borderColor: colors.border,
          borderRadius: borderRadius.md,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {!notification.isRead && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary[500], borderRadius: borderRadius.full }]} />
      )}
      
      <View style={styles.iconContainer}>
        <AppText style={{ fontSize: 24 }}>{getIcon()}</AppText>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <AppText weight="bold" style={styles.title} numberOfLines={1}>{notification.title}</AppText>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(), borderRadius: borderRadius.full }]}>
            <AppText size="xs" color="surface" weight="bold">{notification.priority}</AppText>
          </View>
        </View>
        
        <AppText size="sm" color="secondary" style={styles.description} numberOfLines={2}>
          {notification.description}
        </AppText>
        
        <View style={styles.footerRow}>
          <AppText size="xs" color="secondary">{notification.type}</AppText>
          <AppText size="xs" color="secondary">{formattedDate} • {formattedTime}</AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    left: 8,
    width: 8,
    height: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  description: {
    marginBottom: 8,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});
