import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

interface SettingsRowProps {
  icon: string;
  title: string;
  showBorder?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon, title, showBorder = true }) => {
  const { colors, spacing } = useTheme();

  const handlePress = () => {
    console.log(`Navigate to ${title}`);
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
  const { spacing } = useTheme();

  return (
    <Card variant="flat" style={styles.card}>
      <Heading level="h4" style={styles.title}>Account Settings</Heading>
      <View style={{ marginTop: spacing.xs }}>
        <SettingsRow icon="⚙️" title="Profile Settings" />
        <SettingsRow icon="🔔" title="Notification Settings" />
        <SettingsRow icon="🌐" title="Language" />
        <SettingsRow icon="🔒" title="Privacy Policy" />
        <SettingsRow icon="❓" title="Help & Support" />
        <SettingsRow icon="📱" title="About Application" showBorder={false} />
      </View>
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
  }
});
