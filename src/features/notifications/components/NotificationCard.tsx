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

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'High': return colors.error;
      case 'Medium': return colors.warning;
      case 'Low': return colors.primary[500];
      default: return colors.primary[500];
    }
  };

  const getFormattedDateTime = () => {
    let t = notification.time || '';
    let d = notification.date || '';

    if (d && d.match(/^\d{4}-\d{2}-\d{2}/)) {
      const parsedDate = new Date(d);
      if (!isNaN(parsedDate.getTime())) {
        d = parsedDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    }

    if (t && t.includes('T')) {
      const parsedTime = new Date(t);
      if (!isNaN(parsedTime.getTime())) {
        t = parsedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }

    if (d && t) return `${d} • ${t}`;
    return d || t || 'Today';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: notification.isRead ? colors.surface : '#F0F9FF', 
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
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <AppText style={styles.title} numberOfLines={1}>{notification.title}</AppText>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(), borderRadius: borderRadius.full }]}>
            <AppText style={styles.priorityText}>{notification.priority}</AppText>
          </View>
        </View>
        
        <AppText style={styles.description} numberOfLines={2}>
          {notification.description}
        </AppText>
        
        <View style={styles.footerRow}>
          <AppText style={styles.footerText}>{notification.type}</AppText>
          <AppText style={styles.footerText}>{getFormattedDateTime()}</AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 18,
    paddingLeft: 22,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    position: 'relative',
    overflow: 'hidden',
  },
  unreadDot: {
    position: 'absolute',
    top: 22,
    left: 8,
    width: 8,
    height: 8,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    marginRight: 8,
    fontSize: 18.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  description: {
    marginBottom: 10,
    lineHeight: 22,
    fontSize: 15.5,
    color: '#475569',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  }
});
