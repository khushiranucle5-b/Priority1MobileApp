import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, ScrollView, Share, Alert, Platform } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { LoggerService } from '../../../services';

interface SettingsRowProps {
  icon: string;
  title: string;
  showBorder?: boolean;
  onPress?: () => void;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon, title, showBorder = true, onPress }) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      console.log(`Navigate to ${title}`);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.row, showBorder && { borderBottomWidth: 1, borderBottomColor: colors.border }]} 
      onPress={handlePress}
    >
      <View style={styles.left}>
        <AppText style={styles.icon}>{icon}</AppText>
        <AppText size="base" weight="medium">{title}</AppText>
      </View>
      <AppText size="base" color="secondary">→</AppText>
    </TouchableOpacity>
  );
};

export const SettingsSection: React.FC = () => {
  const { spacing, colors, borderRadius } = useTheme();
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [logsText, setLogsText] = useState('');

  const handleOpenLogs = async () => {
    const text = await LoggerService.getLogsAsText();
    setLogsText(text || 'No logs recorded yet.');
    setLogsModalVisible(true);
  };

  const handleShareLogs = async () => {
    try {
      await Share.share({
        message: logsText,
        title: 'App Logs',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share logs');
    }
  };

  const handleClearLogs = async () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all stored application logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await LoggerService.clearLogs();
            setLogsText('No logs recorded yet.');
          },
        },
      ]
    );
  };

  return (
    <Card variant="flat" style={styles.card}>
      <Heading level="h4" style={styles.title}>Account Settings</Heading>
      <View style={{ marginTop: spacing.xs }}>
        <SettingsRow icon="⚙️" title="Profile Settings" />
        <SettingsRow icon="🔔" title="Notification Settings" />
        <SettingsRow icon="🌐" title="Language" />
        <SettingsRow icon="🔒" title="Privacy Policy" />
        <SettingsRow icon="❓" title="Help & Support" />
        <SettingsRow icon="📱" title="About Application" />
        <SettingsRow icon="📜" title="Developer Logs" showBorder={false} onPress={handleOpenLogs} />
      </View>

      <Modal
        visible={logsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLogsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderRadius: borderRadius.lg }]}>
            <View style={[styles.modalHeader, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <Heading level="h3">Application Logs</Heading>
              <TouchableOpacity onPress={() => setLogsModalVisible(false)}>
                <AppText size="lg" color="error" weight="bold">Close</AppText>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.logContainer}>
              <AppText 
                size="sm" 
                style={[
                  styles.logText, 
                  { 
                    backgroundColor: colors.surface, 
                    color: colors.text, 
                    borderRadius: borderRadius.sm,
                    padding: spacing.sm 
                  }
                ]}
              >
                {logsText}
              </AppText>
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.primary[600], borderRadius: borderRadius.md }]} 
                onPress={handleShareLogs}
              >
                <AppText size="base" color="white" weight="bold">Share / Export</AppText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.error, borderRadius: borderRadius.md }]} 
                onPress={handleClearLogs}
              >
                <AppText size="base" color="white" weight="bold">Clear Logs</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 20,
    width: 24,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    flex: 1,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  logContainer: {
    flex: 1,
    padding: 16,
  },
  logText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  }
});
